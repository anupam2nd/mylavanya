
import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { ChatMessage } from '@/types/chatbot';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onClose: () => void;
  onClearMessages: () => void;
  onClearError: () => void;
}

export default function ChatWindow({
  messages,
  isLoading,
  error,
  onSendMessage,
  onClose,
  onClearMessages,
  onClearError
}: ChatWindowProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md h-[600px] bg-gradient-to-br from-primary/90 via-rose-400/80 to-purple-500/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">AI</span>
            </div>
            <div>
              <h2 className="text-white font-semibold">AI Assistant</h2>
              <p className="text-white/70 text-xs">Always here to help</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <Button
                onClick={onClearMessages}
                size="icon"
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/20"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
            <p className="text-white text-sm">{error}</p>
            <Button
              onClick={onClearError}
              size="sm"
              variant="ghost"
              className="mt-2 text-white/70 hover:text-white p-0 h-auto"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Messages */}
        <MessageList messages={messages} isLoading={isLoading} />

        {/* Input */}
        <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
