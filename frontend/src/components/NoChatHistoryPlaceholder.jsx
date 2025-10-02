import { useState, useEffect } from "react";
import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const NoChatHistoryPlaceholder = ({ name }) => {
  const { sendMessage } = useChatStore();
  
  // Default messages for new conversations
  const defaultMessages = [
    "Hey there! How's your day going?",
    "Hi 👋 Just wanted to say hello!",
    "Nice to meet you – what brings you here?",
    "Hi! Want to chat?"
  ];

  const [customMessages, setCustomMessages] = useState([]);

  // Load custom messages from localStorage
  useEffect(() => {
    const savedCustomMessages = localStorage.getItem('chatrizz-custom-messages');
    if (savedCustomMessages) {
      try {
        setCustomMessages(JSON.parse(savedCustomMessages));
      } catch (e) {
        console.error('Failed to parse custom messages', e);
      }
    }
  }, []);

  const sendDefaultMessage = (message) => {
    sendMessage({
      text: message,
      image: null,
      attachmentUrl: null,
      attachmentType: null,
    });
  };

  // Combine default and custom messages, limit to 4 total
  const allMessages = [...defaultMessages, ...customMessages].slice(0, 4);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 rounded-full flex items-center justify-center mb-5">
        <MessageCircleIcon className="size-8 text-cyan-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-200 mb-3">
        Start your conversation with {name}
      </h3>
      <div className="flex flex-col space-y-3 max-w-md mb-5">
        <p className="text-slate-400 text-sm">
          This is the beginning of your conversation. Send a message to start chatting!
        </p>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mx-auto"></div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {allMessages.map((message, index) => (
          <button 
            key={index}
            onClick={() => sendDefaultMessage(message)}
            className="px-4 py-2 text-xs font-medium text-cyan-400 bg-cyan-500/10 rounded-full hover:bg-cyan-500/20 transition-colors cursor-pointer"
          >
            {message}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-4">
        Or type your own message below
      </p>
    </div>
  );
};

export default NoChatHistoryPlaceholder;