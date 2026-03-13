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

  const [messages, setMessages] = useState<{type: string, username?: string, message: string, time?: string}[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect exactly once
  useEffect(() => {

    if (wsRef.current) return;

    const ws = new WebSocket("https://generators-margaret-prior-stewart.trycloudflare.com");

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
          { type: 'chat', username: data.username, message: data.message, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <div className="h-screen overflow-hidden relative bg-[#05000a] text-white selection:bg-violet-500/30 font-sans flex flex-col items-center justify-start pt-12 sm:pt-25 px-4 sm:px-8">
      {/* Background radial highlights */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-900/15 blur-[120px] rounded-full point-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/15 blur-[120px] rounded-full point-events-none" />
      
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
        <div className="w-full max-w-7xl h-full max-h-[850px] flex gap-6 relative z-10 animate-fade-in shadow-2xl mt-4 sm:mt-0 py-2 sm:py-0">
          
          <ChatArea 
            roomId={roomId}
            username={username}
            messages={messages as Message[]}
            input={input}
            setInput={setInput}
            connected={connected}
            sendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
          />

          <Sidebar users={users} username={username} />

        </div>
      )}
    </div>
  );
}
