
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatbotState {
  messages: ChatMessage[];
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;
  hasNewMessage?: boolean;
}

export interface ApiResponse {
  response?: string;
  error?: string;
}
