import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { XIcon, PlusIcon, SaveIcon } from "lucide-react";

const DefaultMessagesManager = ({ onClose }) => {
  // Default messages for new conversations
  const defaultMessages = [
    "Hey there! How's your day going?",
    "Hi 👋 Just wanted to say hello!",
    "Nice to meet you – what brings you here?",
    "Hi! Want to chat?"
  ];

  const [customMessages, setCustomMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { sendMessage } = useChatStore();

  // Load custom messages from localStorage on component mount
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

  const addCustomMessage = () => {
    if (newMessage.trim() && customMessages.length < 5) {
      const updatedMessages = [...customMessages, newMessage.trim()];
      setCustomMessages(updatedMessages);
      setNewMessage("");
      // Save to localStorage
      localStorage.setItem('chatrizz-custom-messages', JSON.stringify(updatedMessages));
    }
  };

  const removeCustomMessage = (index) => {
    const updatedMessages = customMessages.filter((_, i) => i !== index);
    setCustomMessages(updatedMessages);
    // Save to localStorage
    localStorage.setItem('chatrizz-custom-messages', JSON.stringify(updatedMessages));
  };

  const sendDefaultMessage = (message) => {
    sendMessage({
      text: message,
      image: null,
      attachmentUrl: null,
      attachmentType: null,
    });
    onClose();
  };

  const saveCustomMessages = () => {
    // Messages are already saved on add/remove, but we can show confirmation
    if (customMessages.length > 0) {
      // In a real implementation, you might want to show a toast notification
      console.log("Custom messages saved to localStorage");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h3 className="text-lg font-semibold">Quick Messages</h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 max-h-[calc(80vh-120px)] overflow-y-auto">
          {/* Default Messages */}
          <div>
            <h4 className="font-medium mb-3">Popular starters</h4>
            <div className="space-y-2">
              {defaultMessages.map((message, index) => (
                <button
                  key={index}
                  onClick={() => sendDefaultMessage(message)}
                  className="w-full text-left p-3 bg-base-200 hover:bg-base-300 rounded-lg transition-colors text-sm"
                >
                  {message}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Messages */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Your starters</h4>
              <button
                onClick={saveCustomMessages}
                className="btn btn-xs btn-ghost"
                title="Save custom messages"
              >
                <SaveIcon className="w-4 h-4" />
              </button>
            </div>
            
            {customMessages.length > 0 ? (
              <div className="space-y-2 mb-3">
                {customMessages.map((message, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <button
                      onClick={() => sendDefaultMessage(message)}
                      className="flex-1 text-left p-3 bg-base-200 hover:bg-base-300 rounded-lg transition-colors text-sm"
                    >
                      {message}
                    </button>
                    <button
                      onClick={() => removeCustomMessage(index)}
                      className="btn btn-ghost btn-sm btn-circle"
                      title="Remove message"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/60 p-3 bg-base-200 rounded-lg">
                No custom messages yet. Add your own below!
              </p>
            )}

            {/* Add Custom Message */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your custom message..."
                className="input input-bordered input-sm flex-1"
                maxLength={100}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newMessage.trim()) {
                    addCustomMessage();
                  }
                }}
              />
              <button
                onClick={addCustomMessage}
                disabled={!newMessage.trim() || customMessages.length >= 5}
                className="btn btn-primary btn-sm"
                title="Add custom message"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-base-content/60 mt-1">
              Max 5 custom messages, 100 characters each
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-base-300">
          <p className="text-xs text-base-content/60">
            Click any message to send it instantly
          </p>
          <button
            onClick={onClose}
            className="btn btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DefaultMessagesManager;