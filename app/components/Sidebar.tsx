interface SidebarProps {
  users: string[];
  username: string;
}

export function Sidebar({ users, username }: SidebarProps) {
  return (
    <div className="w-80 h-full min-h-0 glass-panel rounded-3xl flex flex-col overflow-hidden hidden lg:flex">
      <div className="px-6 py-5 border-b border-violet-500/20 bg-black/40 backdrop-blur-md shrink-0">
        <h3 className="text-sm font-bold tracking-widest text-gray-400 flex items-center justify-between">
          <span>ACTIVE NODES</span>
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
          </span>
        </h3>
      </div>
      <div className="p-4 flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-2.5">
        {users.map((u, i) => (
          <div key={i} className="flex items-center gap-4 p-3.5 rounded-2xl bg-black/20 border border-violet-500/10 hover:bg-violet-900/20 hover:border-violet-500/30 transition-all cursor-default">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-sm font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              {u.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold ${u === username ? 'text-white' : 'text-gray-300'}`}>
                {u} {u === username && <span className="text-violet-400 ml-1">(You)</span>}
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">Online now</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
