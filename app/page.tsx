"use client";

import { useEffect, useRef, useState } from "react";
import { JoinScreen } from "./components/JoinScreen";
import { ChatArea, Message } from "./components/ChatArea";
import { Sidebar } from "./components/Sidebar";

export default function Home() {

  const wsRef = useRef<WebSocket | null>(null);

  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  const [messages, setMessages] = useState<{ type: string, username?: string, message: string, time?: string }[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [input, setInput] = useState("");

  // Connect exactly once
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


      // Room created → creator joined automatically
      if (data.type === "room_created") {
        setRoomId(data.roomId);
        setJoined(true);
      }

      // Join acknowledgement
      if (data.type === "joined") {
        console.log("✅ Join confirmed");
        setJoined(true);
      }

      // Chat message
      if (data.type === "message") {
        setMessages(prev => [
          ...prev,
          { type: 'chat', username: data.username, message: data.message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }

      // System message
      if (data.type === "system") {
        setMessages(prev => [
          ...prev,
          { type: 'system', message: data.message }
        ]);
      }

      // Presence update
      if (data.type === "presence") {
        setUsers(data.users);
      }

      // Error handling
      if (data.type === "error") {
        alert("⚠️ " + data.message);
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

  // Safe send helper
  function send(data: any) {
    if (!wsRef.current) return;
    if (wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify(data));
  }

  // Create room
  function createRoom() {
    if (!username.trim()) return;
    send({ type: "create", username: username.trim() });
  }

  // Join room
  function joinRoom() {
    if (!username.trim() || !roomId.trim()) return;
    send({ type: "join", roomId: roomId.trim(), username: username.trim() });
  }

  // Send chat message
  function sendMessage() {
    if (!connected || !roomId || !input.trim()) return;
    send({ type: "message", message: input });
    setInput("");
  }

  return (
    <div className="min-h-screen relative bg-[#05000a] text-white selection:bg-violet-500/30 font-sans flex flex-col items-center justify-center py-10 sm:py-16 px-4 sm:px-8">
      {/* Background radial highlights */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 -left-1/4 w-2/3 sm:w-1/2 aspect-square bg-violet-900/20 blur-[140px] rounded-full" />
        <div className="absolute -bottom-1/3 -right-1/4 w-2/3 sm:w-1/2 aspect-square bg-purple-900/25 blur-[160px] rounded-full" />
      </div>

      {!joined ? (
        <JoinScreen
          username={username}
          setUsername={setUsername}
          roomId={roomId}
          setRoomId={setRoomId}
          connected={connected}
          createRoom={createRoom}
          joinRoom={joinRoom}
        />
      ) : (
        <div className="w-full max-w-6xl h-[72vh] sm:h-[78vh] max-h-[880px] flex flex-col lg:flex-row gap-4 sm:gap-6 relative z-10 animate-fade-in shadow-2xl mt-4 sm:mt-0 py-2 sm:py-0">

          <ChatArea
            roomId={roomId}
            username={username}
            messages={messages as Message[]}
            input={input}
            setInput={setInput}
            connected={connected}
            sendMessage={sendMessage}
          />

          <Sidebar users={users} username={username} />

        </div>
      )}
    </div>
  );
}
