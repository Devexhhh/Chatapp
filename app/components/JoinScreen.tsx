import { Zap, Rocket, Key, User, Sparkles } from "lucide-react";

interface JoinScreenProps {
  username: string;
  setUsername: (u: string) => void;
  roomId: string;
  setRoomId: (r: string) => void;
  connected: boolean;
  createRoom: () => void;
  joinRoom: () => void;
}

export function JoinScreen({
  username,
  setUsername,
  roomId,
  setRoomId,
  connected,
  createRoom,
  joinRoom,
}: JoinScreenProps) {
  return (
    <div className="glass-panel w-full max-w-md p-8 rounded-3xl flex flex-col gap-6 relative z-10 animate-fade-in shadow-2xl">
      <div className="text-center space-y-2">
        <h1 className="flex items-center justify-center gap-3 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500 pb-1">
          <Zap className="w-8 h-8 text-violet-400" /> Nexus Chat
        </h1>
        <p className="text-gray-400 text-sm font-medium">Realtime Web3 Messaging Protocol</p>
      </div>

      <div className="space-y-5 pt-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-violet-200/70 font-semibold ml-1 tracking-wide">
            <User className="w-4 h-4" /> Identity
          </label>
          <input
            className="glass-input w-full px-4 py-3 rounded-xl text-sm"
            placeholder="Enter your username..."
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !!roomId && joinRoom()}
            autoFocus
          />
        </div>
        
        <button
          className="modern-button w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 group"
          onClick={createRoom}
          disabled={!connected || !username}
        >
          <span>Create New Realm</span>
          <Rocket className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink-0 mx-4 text-white/30 text-xs font-bold tracking-widest">OR JOIN</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-fuchsia-200/70 font-semibold ml-1 tracking-wide">
            <Key className="w-4 h-4" /> Room Access Code
          </label>
          <input
            className="glass-input w-full px-4 py-3 rounded-xl text-sm"
            placeholder="Paste room ID..."
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && joinRoom()}
          />
        </div>

        <button
          className="modern-button w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 group"
          onClick={joinRoom}
          disabled={!connected || !username || !roomId}
        >
          <span>Enter Realm</span>
          <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
        </button>
      </div>
      
      <div className="text-center pt-4">
        <span className={`text-xs font-semibold flex items-center justify-center gap-2 ${connected ? 'text-violet-400' : 'text-red-400'}`}>
          <span className="relative flex h-2.5 w-2.5">
            {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connected ? "bg-violet-500" : "bg-red-500"}`}></span>
          </span>
          {connected ? "System Online" : "Connecting to Node..."}
        </span>
      </div>
    </div>
  );
}
