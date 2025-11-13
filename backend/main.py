"""
FastAPI backend for Real-time Typing Visualizer Demo.
Demonstrates HTTP vs WebSocket communication.
"""

import datetime
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

# Allow cross-origin requests (from frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store the latest message
latest_message = {"text": ""}

# ----------------------------
# HTTP Endpoints
# ----------------------------
@app.get("/")
def root():
    """Simple test endpoint to verify the FastAPI app is running."""
    return {"message": "FastAPI backend is running! Connect via /ws for live updates."}

@app.get("/message")
async def get_message():
    """
    HTTP GET endpoint to fetch the latest message.
    Client must request this manually.
    """
    return JSONResponse(latest_message)


@app.post("/message")
async def post_message(msg: dict):
    """
    HTTP POST endpoint to update the latest message.
    Client must call /message to see changes.
    """
    latest_message["text"] = msg["text"]
    return {"status": "ok"}

@app.get("/ws")
def ws_info():
    """
    HTTP GET endpoint for informational purposes.

    Visiting this URL in a browser will return a friendly JSON message
    instead of a 404 Not Found. It explains that the real WebSocket 
    endpoint is at ws://localhost:8000/ws.
    """
    return {
        "message": "This is a WebSocket endpoint. "
                                          "Use a WebSocket client or frontend to connect to ws://localhost:8000/ws"
    }

# ----------------------------
# WebSocket Endpoint
# ----------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for live two-way communication.

    Receives text from client, processes it, and sends back as JSON:
    - timestamp
    - original text
    - transformed text (reversed)
    - emojis for visual impact
    """
    await websocket.accept()
    try:
        while True:
            # Receive text from frontend
            data = await websocket.receive_text()
            latest_message["text"] = data

            # Backend processing
            timestamp = datetime.datetime.now().strftime("%H:%M:%S")
            transformed = data[::-1]  # simple transformation
            response = {
                "timestamp": timestamp,
                "original": data,
                "transformed": f"⚡ {transformed} 🔄"
            }

            # Log to console for demo proof
            print(f"🖥️ [Backend Received @ {timestamp}]: {data}")

            # Send processed message as proper JSON
            await websocket.send_json(response)
    except Exception:
        print("Client disconnected...")
