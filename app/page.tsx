"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {

  const wsRef = useRef<WebSocket | null>(null);

  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {

    const ws = new WebSocket("ws://localhost:3000/ws");

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Connected");
      setConnected(true);
    };

    ws.onmessage = (event) => {

      console.log("📩 Server:", event.data);

      const data = JSON.parse(event.data);

      if (data.type === "room_created") {
        setRoomId(data.roomId);
      }

      if (data.type === "message") {
        setMessages(prev => [
          ...prev,
          `${data.username}: ${data.message}`
        ]);
      }

      if (data.type === "system") {
        setMessages(prev => [
          ...prev,
          `⚡ ${data.message}`
        ]);
      }

    };

    ws.onclose = () => {
      setConnected(false);
      console.log("❌ Disconnected");
    };

    return () => ws.close();

  }, []);


  function send(data: any) {

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("Socket not ready");
      return;
    }

    wsRef.current.send(JSON.stringify(data));
  }

  function createRoom() {
    send({
      type: "create",
      username
    });
  }

  function joinRoom() {
    send({
      type: "join",
      roomId,
      username
    });
  }

  function sendMessage() {

    send({
      type: "message",
      message: input
    });

    setInput("");
  }

  return (

    <div style={{ padding: 20 }}>

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

      {messages.map((msg, i) => (
        <div key={i}>{msg}</div>
      ))}

      <br />

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <button onClick={sendMessage} disabled={!connected}>
        Send
      </button>

    </div>

  );

}
