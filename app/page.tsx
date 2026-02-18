"use client";

import { useEffect, useRef, useState } from "react";

interface PresencePayload {
  type: "presence";
  users: string[];
}

export default function Home() {

  const wsRef = useRef<WebSocket | null>(null);

  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [input, setInput] = useState("");

  //
  // Connect once
  //
  useEffect(() => {

    const ws = new WebSocket("ws://localhost:3000/ws");

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Connected");
      setConnected(true);
    };

    ws.onmessage = (event) => {

      const data = JSON.parse(event.data);

      console.log("📩 Server:", data);

      if (data.type === "room_created") {
        setRoomId(data.roomId);
      }

      if (data.type === "message") {
        setMessages(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ${data.username}: ${data.message}`
        ]);
      }

      if (data.type === "system") {
        setMessages(prev => [
          ...prev,
          `⚡ ${data.message}`
        ]);
      }

      if (data.type === "presence") {
        setUsers(data.users);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("❌ Disconnected");
    };

    return () => ws.close();

  }, []);

  //
  // Safe send
  //
  function send(data: any) {

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("Socket not ready");
      return;
    }

    wsRef.current.send(JSON.stringify(data));
  }

  function createRoom() {
    if (!username.trim()) return;

    send({
      type: "create",
      username
    });
  }

  function joinRoom() {
    if (!username.trim() || !roomId.trim()) return;

    send({
      type: "join",
      roomId,
      username
    });
  }

  function sendMessage() {
    if (!input.trim()) return;

    send({
      type: "message",
      message: input
    });

    setInput("");
  }

  return (

    <div style={{ padding: 20, display: "flex", gap: 40 }}>

      <div style={{ flex: 2 }}>

        <h1>Realtime Chat</h1>

        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <br /><br />

        <button onClick={createRoom} disabled={!connected}>
          Create Room
        </button>

        <br /><br />

        <input
          placeholder="Room ID"
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        />

        <button onClick={joinRoom} disabled={!connected}>
          Join Room
        </button>

        <hr />

        <div style={{ minHeight: 200 }}>
          {messages.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>

        <br />

        <input
          value={input}
          onChange={e => setInput(e.target.value)}
        />

        <button onClick={sendMessage} disabled={!connected}>
          Send
        </button>

      </div>

      <div style={{ flex: 1 }}>

        <h3>Users in Room</h3>

        {users.length === 0 && <div>No users</div>}

        {users.map((user, i) => (
          <div key={i}>• {user}</div>
        ))}

      </div>

    </div>

  );

}
