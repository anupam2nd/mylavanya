
import { ChatMessage } from '@/types/chatbot';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  
  const userBubbleStyle = {
    background: `linear-gradient(135deg, #080c2a 0%, #0f1635 50%, #1a2040 100%)`
  };
  
  return (
    <div className={cn(
      "flex w-full mb-4 animate-fade-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] px-4 py-3 rounded-2xl shadow-sm",
        isUser 
          ? "text-white rounded-br-md border border-white/10" 
          : "bg-white/95 backdrop-blur-sm text-gray-800 rounded-bl-md border border-gray-200/50"
      )}
      style={isUser ? userBubbleStyle : undefined}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={cn(
          "text-xs mt-2 opacity-70",
          isUser ? "text-white/70" : "text-gray-500"
        )}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
}
