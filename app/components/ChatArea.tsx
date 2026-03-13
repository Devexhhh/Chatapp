import { ReactElement, RefObject } from "react";
import { Lock, User, MessageSquareDashed, Zap, Send } from "lucide-react";

export interface Message {
  type: string;
  username?: string;
  message: string;
  time?: string;
}

interface ChatAreaProps {
  roomId: string;
  username: string;
  messages: Message[];
  input: string;
  setInput: (i: string) => void;
  connected: boolean;
  sendMessage: () => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function ChatArea({
  roomId,
  username,
  messages,
  input,
  setInput,
  connected,
  sendMessage,
  messagesEndRef
}: ChatAreaProps) {
  return (
    <div className="flex-1 h-full min-h-0 glass-panel rounded-3xl flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-violet-500/20 bg-black/40 flex items-center justify-between backdrop-blur-md shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            Room: {roomId}
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-1 font-medium">
            <Lock className="w-3 h-3" /> Encrypted P2P Connection
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-violet-300 bg-violet-950/40 px-4 py-1.5 rounded-full border border-violet-500/30 shadow-inner">
          <User className="w-4 h-4" /> {username}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-violet-500/40 space-y-3 object-center">
            <MessageSquareDashed className="w-16 h-16 opacity-30" />
            <p className="font-medium">Silence in the void... send a message!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          if (msg.type === "system") {
            return (
              <div key={i} className="flex justify-center my-4 animate-fade-in">
                <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-violet-200/60 bg-black/40 px-4 py-1.5 rounded-full border border-violet-500/20 shadow-sm">
                  <Zap className="w-3 h-3 text-violet-400" /> {msg.message}
                </span>
              </div>
            );
          }

          const isMe = msg.username === username;
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className={`text-xs font-bold ${isMe ? 'text-violet-400' : 'text-fuchsia-400'}`}>
                  {msg.username}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">{msg.time}</span>
              </div>
              <div className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm shadow-md leading-relaxed
                ${isMe 
                  ? 'bg-gradient-to-br from-violet-600 to-violet-800 text-white rounded-tr-sm border border-violet-400/30' 
                  : 'bg-black/40 text-gray-200 rounded-tl-sm border border-violet-500/20 backdrop-blur-md'
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-5 bg-black/40 border-t border-violet-500/20 backdrop-blur-md rounded-b-3xl">
        <form 
          onSubmit={e => { e.preventDefault(); sendMessage(); }}
          className="flex gap-3"
        >
          <input
            className="glass-input flex-1 bg-black/50 px-4 py-3 rounded-xl text-base"
            placeholder="Transmit message to realm..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={!connected}
          />
          <button
            type="submit"
            className="modern-button px-8 py-3 rounded-xl font-bold flex items-center gap-2 group"
            disabled={!connected || !input.trim()}
          >
            Send <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
