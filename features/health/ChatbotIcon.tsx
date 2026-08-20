import React from 'react';
import { ChatBubbleLeftRightIcon } from '../../shared/Icons';

interface ChatbotIconProps {
  onClick: () => void;
}

const ChatbotIcon: React.FC<ChatbotIconProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-brand-teal-500 to-brand-green-500 text-white p-4 rounded-full shadow-lg hover:from-brand-teal-600 hover:to-brand-green-600 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:ring-offset-2 transition-transform transform hover:scale-110"
      aria-label="Open health assistant chat"
    >
      <ChatBubbleLeftRightIcon className="h-8 w-8" />
    </button>
  );
};

export default ChatbotIcon;