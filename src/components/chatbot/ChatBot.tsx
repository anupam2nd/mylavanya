
import { useChatbot } from '@/hooks/useChatbot';
import FloatingChatButton from './FloatingChatButton';
import ChatWindow from './ChatWindow';

export default function ChatBot() {
  const {
    messages,
    isLoading,
    isOpen,
    error,
    hasNewMessage,
    sendMessage,
    toggleChat,
    clearError,
    clearMessages,
  } = useChatbot();

  return (
    <>
      <FloatingChatButton
        isOpen={isOpen}
        onClick={toggleChat}
        hasNewMessage={hasNewMessage}
      />
      
      {isOpen && (
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSendMessage={sendMessage}
          onClose={toggleChat}
          onClearMessages={clearMessages}
          onClearError={clearError}
        />
      )}
    </>
  );
}
