
export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 px-4 py-2">
      <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/10">
        <span className="text-sm text-white/70">Ananya is typing</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
