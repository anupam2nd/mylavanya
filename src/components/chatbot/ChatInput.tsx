
import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center space-x-2 p-4 bg-white/10 backdrop-blur-sm border-t border-white/20">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? "AI is responding..." : "Type your message..."}
        disabled={disabled}
        className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus-visible:ring-white/30"
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        size="icon"
        className="bg-gradient-to-r from-primary to-rose-400 hover:from-primary/90 hover:to-rose-400/90 border-none shadow-lg"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
