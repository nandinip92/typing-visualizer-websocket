import { useEffect, useState, useRef } from "react";
import "./App.css";

/**
 * Real-time Typing Visualizer Demo
 * - Left: HTTP "Send" updates message only on click.
 * - Right: WebSocket updates instantly as you type.
 */
export default function App() {
  const [typedText, setTypedText] = useState("");
  const [liveText, setLiveText] = useState("");
  const [httpText, setHttpText] = useState("");
  const [wsStatus, setWsStatus] = useState("Connecting..."); // connection status
  const ws = useRef(null); // persistent WebSocket

  // Setup WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket("ws://127.0.0.1:8000/ws");

    ws.current.onopen = () => {
      console.log("✅ WebSocket Connected!");
      setWsStatus("Connected ✅");
    };

    ws.current.onmessage = (event) => {
      console.log("📩 Message received:", event.data);
      setLiveText(event.data);
    };

    ws.current.onerror = (err) => {
      console.error("❌ WebSocket Error:", err);
      setWsStatus("Error ❌");
    };

    ws.current.onclose = () => {
      console.log("🔌 WebSocket Closed.");
      setWsStatus("Closed 🔌");
    };

    // Cleanup on unmount
    return () => ws.current.close();
  }, []);

  // Send WebSocket message as user types
  const handleType = (e) => {
    const text = e.target.value;
    setTypedText(text);

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(text);
    } else {
      console.warn("⚠️ WebSocket not ready yet");
    }
  };

  // Send message via HTTP manually
  const sendHttp = async () => {
    await fetch("http://127.0.0.1:8000/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: typedText }),
    });
    const res = await fetch("http://127.0.0.1:8000/message");
    const data = await res.json();
    setHttpText(data.text);
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
          <div className="output-box http-box">{httpText}</div>
        </div>

        {/* WebSocket Panel */}
        <div className="panel">
          <h2>⚡ WebSocket (live) — {wsStatus}</h2>
          <div className="output-box ws-box">{liveText}</div>
        </div>
      </div>
    </div>
  );
}
