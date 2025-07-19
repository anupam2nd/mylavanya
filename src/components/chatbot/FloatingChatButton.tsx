
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    <TooltipProvider>
      <Tooltip open={hasNewMessage && !isOpen}>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-in-out",
              "text-white",
              "hover:scale-110 hover:shadow-xl active:scale-95",
              "flex items-center justify-center",
              "border-2 border-white/20"
            )}
            style={{ 
              background: `linear-gradient(135deg, #080c2a 0%, #0f1635 50%, #1a2040 100%)` 
            }}
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
        </TooltipTrigger>
        <TooltipContent 
          side="left" 
          className="bg-white text-gray-800 border shadow-lg max-w-xs p-3"
        >
          <p className="text-sm font-medium">Hi! I'm Ananya, your assistant.</p>
          <p className="text-sm text-gray-600">What can I help you with today?</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
