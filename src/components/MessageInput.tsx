import React, { useState } from 'react';
import { Send, Paperclip, Smile, Mic, Image, FileText } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import VoiceRecorder from './VoiceRecorder';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendVoice?: (audioBlob: Blob, duration: number) => void;
}

export default function MessageInput({ onSendMessage, onSendVoice }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const handleVoiceSend = (audioBlob: Blob, duration: number) => {
    if (onSendVoice) {
      onSendVoice(audioBlob, duration);
    }
    setShowVoiceRecorder(false);
  };

  if (showVoiceRecorder) {
    return (
      <div className="p-4 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 border-t border-purple-500/30">
        <VoiceRecorder
          onSendVoice={handleVoiceSend}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 border-t border-purple-500/30">
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
      
      {showAttachments && (
        <div className="absolute bottom-20 left-4 bg-gray-800 border border-purple-500/30 rounded-lg p-2 shadow-xl z-50">
          <div className="flex flex-col space-y-2">
            <button className="flex items-center space-x-2 p-2 text-purple-200 hover:bg-purple-600/30 rounded transition-colors">
              <Image size={18} />
              <span>Photo & Video</span>
            </button>
            <button className="flex items-center space-x-2 p-2 text-purple-200 hover:bg-purple-600/30 rounded transition-colors">
              <FileText size={18} />
              <span>Document</span>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <button
          type="button"
          onClick={() => setShowAttachments(!showAttachments)}
          className="p-2 text-purple-200 hover:bg-white/10 rounded-full transition-colors"
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message"
            rows={1}
            className="w-full px-4 py-3 pr-12 bg-gray-800/50 backdrop-blur-sm border border-purple-400/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-none text-white placeholder-purple-200"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-purple-200 hover:bg-white/10 rounded-full transition-colors"
          >
            <Smile size={20} />
          </button>
        </div>

        {message.trim() ? (
          <button
            type="submit"
            className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <Send size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowVoiceRecorder(true)}
            className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <Mic size={20} />
          </button>
        )}
      </form>
    </div>
  );
}