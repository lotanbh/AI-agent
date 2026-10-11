"use client";

import React, { useState } from 'react';
import { readEvents } from "./read-events";

export default function HomePage() {
  const [running, setRunning] = useState(false);
  const [query, setQuery] = useState(""); // חיבור ה-Input לסטייט
  const [events, setEvents] = useState([]);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  async function investigate() {
    setRunning(true);
    setEvents([]);
    setReport("");
    setError("");

    try {
      // כאן ניתן להעביר את ה-query לשרת בתוך ה-body אם ה-API שלך תומך בזה
      const response = await fetch('/api/investigation', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }) 
      });

      await readEvents(response, (event) => {
        if (event.type === 'report') {
          setReport(event.report);
        } else if (event.type === 'error') {
          setError(event.message);
        } else {
          setEvents((prev) => [...prev, event]);
        }
      });
    } catch (error) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setRunning(false);
    }
  }
  
  return (
    <main className="premium-layout">
      <div className="premium-card">
        
        <header className="card-header">
          <h1>Ops Agent</h1>
          <p>AI agent for investigating and resolving operational issues.</p>
          <div className="status-indicator">
            <span className="status-dot"></span>
            Operational
          </div>
        </header>

        {/* כל התוכן הדינמי נכנס כעת לתוך ה-chat-body הנגלל */}
        <div className="chat-body">
          
          {/* בלוק סטטוס ריצה ראשוני */}
          {!running && events.length === 0 && !report && !error && (
            <div className="welcome-message">
              Ready to scan. Describe the issue or hit investigate.
            </div>
          )}

          {/* מציג מה הסוכן עושה כרגע */}
          {events.length > 0 && (
            <div className="section-block">
              <h2>Agent Activity</h2>
              <div className="events-container">
                {events.map((event, i) => (
                  <div key={i} className="event">
                    <span className="event-tag">
                      {event.type === "tool_called" ? "⚙️ Tool Started:" : "✅ Tool Returned:"}
                    </span>
                    <strong className="event-name">{event.tool || event.type}</strong>
                    {event.output && (
                      <pre className="output-preview">{JSON.stringify(event.output, null, 2)}</pre>
                    )}
                  </div> 
                ))}
              </div>
            </div>
          )}

          {/* מציג את הדו"ח הסופי או השגיאה */}
          {(report || error) && (
            <div className="section-block">
              <h2>Investigation Report</h2>
              <div className="report-container">
                {report && <div className="report-text">{report}</div>}
                {error && <pre className="error-block">{error}</pre>}
              </div>
            </div>
          )}
        </div>

        <footer className="card-footer">
          <div className="input-container">
            <input 
              type="text" 
              placeholder="Ask assistant to scan folders..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={running}
              onKeyDown={(e) => e.key === 'Enter' && !running && investigate()}
            />
            <button onClick={investigate} disabled={running} className="send-btn">
              {running ? "Investigating..." : "Investigate"}
            </button>
          </div>
        </footer>
        
      </div>
    </main>
  );
}
