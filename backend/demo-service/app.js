import dotenv from "dotenv";
dotenv.config();
import express from "express";
import {MongoClient} from "mongodb";

const VERSION = process.env.APP_VERSION || "1.0.0";
const FAULT = process.env.FAULT === "on";
const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI, {serverSelectionTimeoutMS: 3000 });
const logs = client.db().collection("logs");

async function log(message, level) {
    const line = { time: new Date(), version: VERSION, message, level };
    console.log(JSON.stringify(line));
    await logs.insertOne(line);
}

// Simulate a broken service by throwing an error when FAULT is set to "on"
async function loadprices() {
    if (FAULT) {
        await fetch("https://pricing-service:5000/prices");
    }
    return {lulav: 30, errog: 50};
}


const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({status: "ok"});
});

app.get("/version", (req, res) => {
    res.json({service:"orders-api", version: VERSION});
});

app.get("/logs", async (req, res) => {
    const newestFirst = { time: -1 };
    const lines = await logs
    .find({}, {projection: {_id: 0}})
    .sort(newestFirst)
    .limit(20)
    .toArray();
    res.json(lines);
});



app.get("/api/orders",  async (req, res) => {
    let prices;
    try {
        prices = await loadprices();
    } catch (error) {
        await log("error", `GET /api/orders 500 - cannot reach pricing service 
            ${error.cause} 
            ${error.code} 
            ${error.message}`
        );
        return res.status(500).json({ error: "Internal Server Error" });
    }
    await log("info", `GET /api/orders 200`);
    res.json({ orders: [{ id: 1, item: "lulav", price: prices.lulav }] });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Demo service is running on port ${PORT}`);
});

