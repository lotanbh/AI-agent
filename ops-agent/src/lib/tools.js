// first tool: check_service_health
// second tool: get_recent_logs
// third tool: get_production_info

import { tool } from "@openai/agents";
import { z } from "zod";
import { callDemoService } from "./demo-service.js";

export const checkServiceHealth = tool({
    name: "check_service_health",
    description: "Checks the health and status of the orders API.",
    parameters: z.object({}),

    async execute() {
        console.log("Executing check_service_health tool...");
        const health = await callDemoService("/health");
        const orders = await callDemoService("/api/orders");
        // const products = await callDemoService("/api/products");
        return { health, orders };
    },

});

export const getRecentLogs = tool({
    name: "get_recent_logs",
    description: "Get recent logs from a service in production.",
    parameters: z.object({}),

    async execute() {
        console.log("Executing get_recent_logs tool...");
        const result = await callDemoService("/api/logs");
        
        // אם הלוגים מגיעים כמערך בתוך ה-body, נעבד אותם בבטחה
        if (result && Array.isArray(result.body)) {
            return result.body.map((line) => ({
                ...line, 
                message: line.message.slice(0, 100) + (line.message.length > 100 ? "..." : "")
            }));
        }
        return result; // הגנה במקרה שהמבנה שונה
    },


});

export const getProductionInfo = tool({
    name: "get_production_info",
    description: "Return which version of orders API is running.",
    parameters: z.object({}),

    async execute() {
        console.log("Executing get_production_info tool...");
        const version = await callDemoService("/version");
        return { version };
    },

});

