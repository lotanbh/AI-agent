// import { run } from "@openai/agents";
// import { OpenAI } from "openai";
// import { opsAgent } from "../../../lib/agent.js";
// import { saveInvestigation } from "../../../lib/db.js";

// const geminiClient = new OpenAI({
//   apiKey: process.env.GEMINI_API_KEY,
//   baseURL: "https://googleapis.com" 
// });



// export async function POST(request) {
//     const encoder = new TextEncoder();

//     const stream = new ReadableStream({
//         async start(controller) {
//             function send(event) {
//                 controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
//             }

//             const toolResults = [];

//             try {
//                 const results = await run(opsAgent, "Investigate orders-api", {
//                     client: geminiClient,
//                     stream: true,
//                     maxTurns: 6,
//                     signal: AbortSignal.any([
//                         request.signal,
//                         AbortSignal.timeout(60_000),
//                     ]),
//                 });

//                 for await (const event of results) {
//                     if (event.name === "tool_called") {
//                         send({ type: "tool_called", tool: event.item.rawItem.name});
//                     }

//                     const tool = event.item?.rawItem?.name || "unknown_tool";
                    
//                     if (event.name === "tool_output") {
//                         send({ type: "tool_output", tool, output: event.item.output });
//                         toolResults.push({ tool, output: event.item.output });
//                     }
//                 }

//                 // for await (const event of result) {
//                 // if (event.type !== "run_item_stream_event") {
//                 //     continue;
//                 // }

//                 // if (event.item.type === "tool_call_item") {
//                 //     const tool = event.item.rawItem.name;

//                 //     send({
//                 //     type: "tool_called",
//                 //     tool,
//                 //     });
//                 // }

//                 // if (event.item.type === "tool_call_output_item") {
//                 //     send({
//                 //     type: "tool_output",
//                 //     output: event.item.output,
//                 //     });

//                 //     toolResults.push({
//                 //     output: event.item.output,
//                 //     });
//                 // }
//                 // }

//                 await results.completed;
//                 if (results.cancelled) {
//                     throw new Error("Investigation was cancelled.");
//                 }

//                 const report = results.finalOutput;
//                 send({ type: "report", report });
                
//                 // Save the investigation results to the database


//                 await saveInvestigation({
//                     createdAt: new Date(),
//                     toolResults, report });

//             } catch (error) {
//                 send({ type: "error", message: error.message });
//             } 
                
//             controller.close();
//         },
//     });


//     return new Response(stream, {
//         headers: { "Content-Type": "application/x-ndjson" },
//     });
// }

// // קוד שמוציא את המודלים הזמינים החינמיים
// // import { OpenAI } from "openai";

// // const geminiClient = new OpenAI({
// //     apiKey: process.env.GEMINI_API_KEY,
// //     baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" 
// // });

// // export async function POST(request) {
// //     try {
// //         // 1. נמשוך מגוגל את רשימת המודלים המדויקת שפתוחה עבור ה-Key שלך
// //         const list = await geminiClient.models.list();
// //         const modelNames = list.data.map(m => m.id);
        
// //         console.log("=== מודלים זמינים בחשבון שלך ===");
// //         console.log(modelNames);
// //         console.log("================================");

// //         return new Response(JSON.stringify({ 
// //             type: "info", 
// //             message: "בדוק את הטרמינל ב-VS Code כדי לראות את שמות המודלים!",
// //             availableModels: modelNames 
// //         }), {
// //             headers: { "Content-Type": "application/json" },
// //         });

// //     } catch (error) {
// //         return new Response(JSON.stringify({ type: "error", message: error.message }), {
// //             status: 500,
// //             headers: { "Content-Type": "application/json" },
// //         });
// //     }
// // }


import { run, setDefaultOpenAIClient, setOpenAIAPI, setTracingDisabled } from "@openai/agents";
import { OpenAI } from "openai";
import { opsAgent } from "../../../lib/agent.js";
import { saveInvestigation } from "../../../lib/db.js";

// 1. הלקוח של גוגל - כתובת התאימות הרשמית
const geminiClient = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// 2. אכיפה ארכיטקטונית מוחלטת ל-SDK
setDefaultOpenAIClient(geminiClient); // מגדיר את גוגל כספק העולמי של הריצה
setOpenAIAPI('chat_completions');     // מונע שימוש ב-Responses API ומכריח תאימות
setTracingDisabled(true);            // מכבה את ה-Tracing כדי למנוע הודעות מערכת

export async function POST(request) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            function send(event) {
                controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
            }

            const toolResults = [];

            try {
                // מריצים את ה-run שמבוסס כעת במלואו על גוגל
                const results = await run(opsAgent, "Investigate orders-api", {
                    stream: true,
                    maxTurns: 6,
                    signal: AbortSignal.any([
                        request.signal,
                        AbortSignal.timeout(60_000),
                    ]),
                });

                for await (const event of results) {
                    if (event.name === "tool_called") {
                        send({ type: "tool_called", tool: event.item.rawItem.name});
                    }

                    const tool = event.item?.rawItem?.name || "unknown_tool";
                    
                    if (event.name === "tool_output") {
                        send({ type: "tool_output", tool, output: event.item.output });
                        toolResults.push({ tool, output: event.item.output });
                    }
                }

                await results.completed;
                if (results.cancelled) {
                    throw new Error("Investigation was cancelled.");
                }

                const report = results.finalOutput;
                send({ type: "report", report });
                
                await saveInvestigation({
                    createdAt: new Date(),
                    toolResults, 
                    report 
                });

            } catch (error) {
                send({ type: "error", message: error.message });
            } 
                
            controller.close();
        },
    });

    return new Response(stream, {
        headers: { "Content-Type": "application/x-ndjson" },
    });
}
