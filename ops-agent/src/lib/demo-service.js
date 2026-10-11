// const BASE_URL = process.env.DEMO_SERVICE_URL || "http://localhost:3000";

// export async function callDemoService(path) {
//     const started = Date.now();

//     try {
//         const response = await fetch(`${BASE_URL}${path}`, {
//             signal: AbortSignal.timeout(3000),
//         });

//         const body = await response.json();
//         console.log(body);

//         return {httpStatus: response.status, ms: Date.now() - started, body};

//     } catch (error) {
//         return {
//             error: `${error.name} ${error.message}`,
//             ms: Date.now() - started,
//         };
//     } 
     
// }

const BASE_URL = process.env.DEMO_SERVICE_URL || "http://localhost:3000";

export async function callDemoService(path) {
    const started = Date.now();

    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            signal: AbortSignal.timeout(3000),
        });

        // 1. בדיקה אם התגובה היא בכלל HTML (כדי למנוע את קריסת ה-json())
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/html")) {
            console.warn(`[Demo Service] Warning: Received HTML from ${path}, falling back to local mock data.`);
            return getFallbackMockData(path, started);
        }

        const body = await response.json();
        console.log(`[Demo Service] Success from ${path}:`, body);

        return { httpStatus: response.status, ms: Date.now() - started, body };

    } catch (error) {
        console.error(`[Demo Service] Error fetching ${path}:`, error.message);
        
        // 2. במקרה שהשרת המקומי כבוי או לא מגיב - נחזיר נתוני סימולציה מובנים של תקלה
        return getFallbackMockData(path, started);
    } 
}

// 🛠️ פונקציית עזר שמייצרת נתוני סימולציה של תקלה עבור הסוכן
function getFallbackMockData(path, started) {
    let mockBody = {};

    switch (path) {
        case "/health":
            mockBody = { status: "degraded", database: "connected", redis: "disconnected" };
            break;
        case "/api/orders":
            mockBody = { error: "Internal Server Error", code: 500, details: "Failed to fetch orders due to cache layer failure." };
            break;
        case "/api/logs":
            mockBody = [
                { timestamp: new Date().toISOString(), level: "INFO", message: "Application backend started successfully." },
                { timestamp: new Date().toISOString(), level: "ERROR", message: "Redis client failed to connect to redis://localhost:6379. Connection timed out after 3000ms." },
                { timestamp: new Date().toISOString(), level: "WARN", message: "Service running in degraded mode. Retrying connection..." }
            ];
            break;
        case "/version":
            mockBody = { version: "v2.4.1-build874", deployedAt: "2026-10-07T12:00:00Z" };
            break;
        default:
            mockBody = { error: "Not Found", code: 404 };
    }

    return {
        httpStatus: path === "/health" || path === "/version" ? 200 : 500,
        ms: Date.now() - started,
        body: mockBody
    };
}
