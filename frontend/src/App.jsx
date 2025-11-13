import { useEffect, useState, useRef } from "react";
import "./App.css";

/**
 * Real-time Typing Visualizer Demo
 * - Left: HTTP (manual send)
 * - Right: WebSocket (live, backend-processed, visually appealing)
 */
export default function App() {
  const [typedText, setTypedText] = useState("");
  const [liveText, setLiveText] = useState(null);
  const [httpText, setHttpText] = useState("");
  const ws = useRef(null);

  // Setup WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/ws");

    ws.current.onopen = () => console.log("✅ WebSocket Connected!");
    ws.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data); // parse JSON safely
        setLiveText(msg);
        console.log("📩 WebSocket Message:", msg);
      } catch (err) {
        console.error("Failed to parse WS JSON", err);
      }
    };

    ws.current.onerror = (err) => console.error("❌ WebSocket Error:", err);
    ws.current.onclose = () => console.log("🔌 WebSocket Closed.");

    return () => ws.current.close();
  }, []);

  // Send WebSocket message while typing
  const handleType = (e) => {
    const text = e.target.value;
    setTypedText(text);

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(text);
    } else {
      console.warn("⚠️ WebSocket not ready yet");
    }
  };

  // Send HTTP message manually
  const sendHttp = async () => {
    const timestamp = new Date().toLocaleTimeString(); // capture current time
    await fetch("http://localhost:8000/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: typedText }),
    });
    const res = await fetch("http://localhost:8000/message");
    const data = await res.json();

    // store text and timestamp together
    setHttpText({ text: data.text, timestamp });
  };

  return (
    <div className="container">
      <h1>💬 Real-time Typing Visualizer</h1>
      <input
        value={typedText}
        onChange={handleType}
        placeholder="Start typing..."
        className="input-box"
      />

      <div className="panels">
        {/* HTTP Panel */}
        <div className="panel">
          <h2>📡 HTTP (manual)</h2>
          <button className="btn" onClick={sendHttp}>
            Send via HTTP
          </button>
          <div className="output-box http-box">
            {httpText ? (
              <>
                <span className="http-timestamp">⏱ {httpText.timestamp}</span>
                <span className="http-message">{httpText.text}</span>
              </>
            ) : (
              "Waiting for manual send..."
            )}
          </div>
        </div>

        {/* WebSocket Panel */}
        <div className="panel">
          <h2>⚡ WebSocket (live)</h2>
          <div className="output-box ws-box">
            {liveText ? (
              <>
                <span className="ws-timestamp">⏱ {liveText.timestamp}</span>
                <span className="ws-message">{liveText.transformed}</span>
              </>
            ) : (
              "Waiting for live input..."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
