function ChatInput({ onSendMessage }) {
  try {
    const [message, setMessage] = React.useState('');
    const [isRecording, setIsRecording] = React.useState(false);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message);
        setMessage('');
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    const toggleRecording = () => {
      setIsRecording(!isRecording);
      // Here you would integrate actual voice recording functionality
    };

    return (
      <div className="p-4 border-t border-[var(--border-color)] bg-white" data-name="chat-input" data-file="components/ChatInput.js">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:bg-[var(--secondary-color)] rounded-full transition-colors"
          >
            <div className="icon-paperclip text-xl"></div>
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows="1"
              className="chat-input resize-none pr-12"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            
            {/* Emoji Button */}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
            >
              <div className="icon-smile text-xl"></div>
            </button>
          </div>

          {/* Voice/Send Button */}
          {message.trim() ? (
            <button
              type="submit"
              className="w-11 h-11 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <div className="icon-send text-xl"></div>
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleRecording}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-[var(--secondary-color)] text-[var(--text-secondary)] hover:text-[var(--primary-color)]'
              }`}
            >
              <div className={`text-xl ${isRecording ? 'icon-square' : 'icon-mic'}`}></div>
            </button>
          )}
        </form>
      </div>
    );
  } catch (error) {
    console.error('ChatInput component error:', error);
    return null;
  }
}