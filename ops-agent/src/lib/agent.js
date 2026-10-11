// import { Agent } from "@openai/agents";
// import { checkServiceHealth, getRecentLogs, getProductionInfo } from "./tools";

// // setDefaultOpenAIKey(process.env.OPENAI_API_KEY);

// // ⚠️ מחקנו את setDefaultOpenAIKey כדי לא לחסום את ה-Client של גוגל

// export const opsAgent = new Agent({
//   name: "Ops Agent",
//   instructions: `
//     You are an on-call engineer investigating services in a production environment.

//     Your goal is to quickly identify the root cause of service incidents using available operational evidence.

//     Investigation flow:
//     1. Start with check_service_health to determine the current health and status of the affected service.
//     2. If the service is unhealthy or degraded, use get_recent_logs to inspect recent errors, warnings, crashes, and unusual behavior.
//     3. Use get_production_info to inspect the production environment, deployment, configuration, runtime, and other relevant infrastructure information.
//     4. Correlate evidence from all relevant tools before determining the root cause.
//     5. Do not guess. Clearly distinguish confirmed findings from hypotheses.
//     6. Prefer the smallest safe corrective action.
//     7. Never claim an issue is resolved unless there is evidence confirming recovery.

//     When reporting an investigation, be concise and operational. Include:
//     - Current status
//     - Relevant evidence
//     - Root cause, if confirmed
//     - Recommended action
//     - Remaining uncertainty, if any

//     Answer in hebrew with excatly 4 sections:
//     1. מצב נוכחי
//     2. ראיות רלוונטיות
//     3. סיבת השורש, אם אושרה
//     4. פעולה מומלצת
//     `,
//   // שימוש במודל שקיים ומאושר ברשימה ששלחת מהטרמינל
//   model: "gemini-3.8-flash", 
//   tools: [
//       checkServiceHealth,
//       getRecentLogs,
//       getProductionInfo
//     ]
// });

import { Agent } from "@openai/agents";
import { checkServiceHealth, getRecentLogs, getProductionInfo } from "./tools";

export const opsAgent = new Agent({
  name: "Ops Agent",
  instructions: `
    You are an on-call engineer investigating services in a production environment.
    Your goal is to quickly identify the root cause of service incidents using available operational evidence.
    
    Answer in hebrew with exactly 4 sections:
    1. מצב נוכחי
    2. ראיות רלוונטיות
    3. סיבת השורש, אם אושרה
    4. פעולה מומלצת
  `,
  // 👈 ה-SDK יקח את השם הזה ויריץ אותו מול ה-Gemini Client שהגדרת כ-Default ב-Route
  model: "gemini-3.8-flash",
  model_settings: {
    parallelToolCalls: false 
  }, 

  tools: [
      checkServiceHealth,
      getRecentLogs,
      getProductionInfo
    ]
});
