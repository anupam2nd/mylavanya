
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  hasNewMessage?: boolean;
}

export default function FloatingChatButton({ 
  isOpen, 
  onClick, 
  hasNewMessage = false 
}: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-in-out",
        "bg-gradient-to-r from-primary to-rose-400 text-white",
        "hover:scale-110 hover:shadow-xl active:scale-95",
        "flex items-center justify-center",
        "border-2 border-white/20",
        hasNewMessage && "animate-bounce-soft"
      )}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      <div className="relative">
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        {hasNewMessage && !isOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>
    </button>
  );
}
