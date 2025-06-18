
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

  const buttonStyle = {
    background: `linear-gradient(135deg, #080c2a 0%, #0f1635 50%, #1a2040 100%)`
  };

  return (
    <div className="flex items-center space-x-2 p-4 bg-white/5 backdrop-blur-sm border-t border-white/10">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? "AI is responding..." : "Type your message..."}
        disabled={disabled}
        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30 focus-visible:border-white/40"
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        size="icon"
        className="border-none shadow-lg hover:scale-105 transition-transform"
        style={buttonStyle}
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
