"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {

  const wsRef = useRef<WebSocket | null>(null);

  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  const [messages, setMessages] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [input, setInput] = useState("");

  //
  // Connect exactly once
  //
  useEffect(() => {

    if (wsRef.current) return;

    const ws = new WebSocket("ws://localhost:3000/ws");

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Connected");
      setConnected(true);
    };

    ws.onmessage = (event) => {

      const data = JSON.parse(event.data);

      console.log("📩 Server:", data);

      //
      // Room created → creator joined automatically
      //
      if (data.type === "room_created") {
        setRoomId(data.roomId);
        setJoined(true);
      }

      //
      // Join acknowledgement
      //
      if (data.type === "joined") {
        console.log("✅ Join confirmed");
        setJoined(true);
      }

      //
      // Chat message
      //
      if (data.type === "message") {
        setMessages(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ${data.username}: ${data.message}`
        ]);
      }

      //
      // System message
      //
      if (data.type === "system") {
        setMessages(prev => [
          ...prev,
          `⚡ ${data.message}`
        ]);
      }

      //
      // Presence update
      //
      if (data.type === "presence") {
        setUsers(data.users);
      }

      //
      // Error handling
      //
      if (data.type === "error") {
        alert(data.message);
      }

    };

    ws.onclose = () => {
      console.log("❌ Disconnected");
      setConnected(false);
      setJoined(false);
      wsRef.current = null;
    };

    return () => {
      ws.close();
    };

  }, []);

  //
  // Safe send helper
  //
  function send(data: any) {

    if (!wsRef.current) {
      console.log("No socket");
      return;
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("Socket not ready");
      return;
    }

    wsRef.current.send(JSON.stringify(data));
  }

  //
  // Create room
  //
  function createRoom() {

    if (!username.trim()) return;

    send({
      type: "create",
      username
    });

  }

  //
  // Join room
  //
  function joinRoom() {

    if (!username.trim()) return;
    if (!roomId.trim()) return;

    send({
      type: "join",
      roomId,
      username
    });

  }

  //
  // Send chat message
  //
  function sendMessage() {

    if (!connected) return;
    if (!roomId) return;
    if (!input.trim()) return;

    send({
      type: "message",
      message: input
    });

    setInput("");

  }

  return (

    <div style={{ padding: 20, display: "flex", gap: 40 }}>

      {/* CHAT SECTION */}
      <div style={{ flex: 2 }}>

        <h1>Realtime Chat</h1>

        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <br /><br />

        <button
          onClick={createRoom}
          disabled={!connected || !username}
        >
          Create Room
        </button>

        <br /><br />

        <input
          placeholder="Room ID"
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        />

        <button
          onClick={joinRoom}
          disabled={!connected || !username || !roomId}
        >
          Join Room
        </button>

        <hr />

        <div style={{
          minHeight: 200,
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 6
        }}>
          {messages.length === 0 && <div>No messages yet</div>}

          {messages.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>

        <br />

        <input
          placeholder="Type message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={!connected || !roomId}
        />

        <button
          onClick={sendMessage}
          disabled={!connected || !roomId}
        >
          Send
        </button>

      </div>

      {/* USERS SECTION */}
      <div style={{ flex: 1 }}>

        <h3>Users in Room</h3>

        <div style={{
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 6
        }}>

          {users.length === 0
            ? <div>No users</div>
            : users.map((user, i) => (
              <div key={i}>• {user}</div>
            ))
          }

        </div>

      </div>

    </div>

  );

}
