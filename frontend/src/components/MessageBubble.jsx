import React, { useState, useEffect } from 'react';
import { Languages, Eye, EyeOff } from 'lucide-react';
import { useTranslationStore } from '../store/useTranslationStore';
import { useAuthStore } from '../store/useAuthStore';
import TranslationPanel from './TranslationPanel';

const MessageBubble = ({ message, onImageClick }) => {
  const { authUser } = useAuthStore();
  const {
    autoTranslate,
    preferredLanguage,
    showOriginal,
    translateMessage,
    getMessageTranslation,
    isMessageTranslating
  } = useTranslationStore();

  const [showTranslationPanel, setShowTranslationPanel] = useState(false);
  const [translation, setTranslation] = useState(null);
  const [showTranslatedText, setShowTranslatedText] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null);

  const isOwnMessage = message.senderId === authUser._id;
  const hasText = message.text && message.text.trim().length > 0;
  const isTranslating = isMessageTranslating(message._id);

  // Check for existing translation when component mounts or when message changes
  useEffect(() => {
    if (!isOwnMessage && hasText && preferredLanguage) {
      // Check if translation already exists in cache
      const cached = getMessageTranslation(message._id, 'auto', preferredLanguage);
      if (cached) {
        setTranslation(cached);
        setDetectedLanguage(cached.detectedLanguage);
        
        // If auto-translate is enabled, show the translation
        if (autoTranslate) {
          setShowTranslatedText(true);
        }
      }
    }
  }, [message._id, message.text, isOwnMessage, hasText, preferredLanguage, autoTranslate, getMessageTranslation]);

  // Auto-translate when enabled and not own message
  useEffect(() => {
    if (autoTranslate && !isOwnMessage && hasText && preferredLanguage) {
      handleAutoTranslate();
    }
  }, [autoTranslate, isOwnMessage, hasText, preferredLanguage, message._id, message.text]);

  // Listen for translation updates
  useEffect(() => {
    // This effect will run when the translation store updates
    const checkForTranslation = () => {
      if (!isOwnMessage && hasText && preferredLanguage) {
        const cached = getMessageTranslation(message._id, 'auto', preferredLanguage);
        if (cached && !translation) {
          setTranslation(cached);
          setDetectedLanguage(cached.detectedLanguage);
          
          // If auto-translate is enabled, show the translation
          if (autoTranslate) {
            setShowTranslatedText(true);
          }
        }
      }
    };
    
    // Check immediately
    checkForTranslation();
    
    // Set up a short interval to check for updates (simulating store subscription)
    const interval = setInterval(checkForTranslation, 500);
    
    return () => clearInterval(interval);
  }, [message._id, isOwnMessage, hasText, preferredLanguage, autoTranslate, translation, getMessageTranslation]);

  // Automatically show translated text when auto-translate is enabled and translation is available
  useEffect(() => {
    if (autoTranslate && !isOwnMessage && translation && !showTranslatedText) {
      setShowTranslatedText(true);
    }
    // Hide translated text when auto-translate is disabled
    if (!autoTranslate && showTranslatedText) {
      setShowTranslatedText(false);
    }
  }, [autoTranslate, translation, isOwnMessage, showTranslatedText]);

  const handleAutoTranslate = async () => {
    if (!hasText || isOwnMessage) return;

    try {
      // Check if translation already exists
      const cached = getMessageTranslation(message._id, 'auto', preferredLanguage);
      if (cached) {
        setTranslation(cached);
        setDetectedLanguage(cached.detectedLanguage);
        return;
      }

      const result = await translateMessage(
        message._id,
        message.text,
        'auto',
        preferredLanguage
      );
      
      if (result) {
        setTranslation(result);
        setDetectedLanguage(result.detectedLanguage);
      }
    } catch (error) {
      console.error('Auto-translation failed:', error);
    }
  };

  const handleTranslateClick = () => {
    setShowTranslationPanel(true);
  };

  const toggleTranslationView = () => {
    setShowTranslatedText(!showTranslatedText);
  };

  // Don't show translation options for own messages or messages without text
  const shouldShowTranslationControls = !isOwnMessage && hasText;

  return (
    <>
      <div className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}>
        <div
          className={`glowing-bubble relative group ${
            isOwnMessage
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
              : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          }`}
        >
          {/* Translation Controls */}
          {shouldShowTranslationControls && (
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1">
                {translation && (
                  <button
                    onClick={toggleTranslationView}
                    className="p-1 rounded bg-black/20 hover:bg-black/40 transition-colors"
                    title={showTranslatedText ? "Show original" : "Show translation"}
                  >
                    {showTranslatedText ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                )}
                <button
                  onClick={handleTranslateClick}
                  className="p-1 rounded bg-black/20 hover:bg-black/40 transition-colors"
                  title="Translate message"
                >
                  <Languages className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Inline image rendering for image messages or image attachments */}
          {(message.image || (message.attachmentUrl && message.attachmentType?.startsWith("image/"))) && (
            <img
              src={message.image || message.attachmentUrl}
              alt="Shared"
              className="rounded-lg h-48 object-cover cursor-zoom-in"
              onClick={() => onImageClick(message.image || message.attachmentUrl)}
            />
          )}

          {/* Non-image attachments fall back to link */}
          {message.attachmentUrl && !message.image && !(message.attachmentType?.startsWith("image/")) && (
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="underline text-xs opacity-90"
            >
              {message.attachmentType?.startsWith("video/") ? "View video" : "Open file"}
            </a>
          )}

          {/* Message Text */}
          {hasText && (
            <div className="mt-2">
              {/* Show translation if available and user wants to see it */}
              {translation && showTranslatedText ? (
                <div className="space-y-2">
                  <p className="bg-white/20 p-2 rounded border-l-2 border-white/50">
                    {translation.translatedText}
                  </p>
                  {showOriginal && (
                    <p className="text-xs opacity-70 italic">
                      Original: {message.text}
                    </p>
                  )}
                  {/* Sleek Auto-Translate Tag */}
                  <div className="text-xs flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full w-fit">
                    <Languages className="w-3 h-3 text-cyan-400" />
                    <span className="font-medium">{translation.fromLanguage} → {translation.toLanguage}</span>
                    {autoTranslate && (
                      <span className="badge badge-primary badge-xs ml-1 bg-cyan-500/20 text-cyan-300 border-0">AUTO</span>
                    )}
                    {translation.provider === 'rapidapi' && (
                      <span className="badge badge-info badge-xs ml-1 bg-blue-500/20 text-blue-300 border-0">API</span>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p>{message.text}</p>
                  {/* Auto-translate indicator */}
                  {isTranslating && (
                    <div className="text-xs opacity-60 mt-1 flex items-center gap-1">
                      <div className="loading loading-spinner loading-xs"></div>
                      <span>Translating...</span>
                    </div>
                  )}
                  {/* Translation available indicator - only show when auto-translate is disabled */}
                  {translation && !showTranslatedText && !autoTranslate && (
                    <div className="text-xs opacity-60 mt-1 flex items-center gap-1">
                      <Languages className="w-3 h-3" />
                      <span>Translation available</span>
                      <button
                        onClick={toggleTranslationView}
                        className="underline hover:no-underline"
                      >
                        Show
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Message metadata */}
          <p className="text-xs mt-1 opacity-90 flex items-center gap-1">
            {new Date(message.createdAt).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {isOwnMessage && (
              <span className="ml-1">
                {message.seen ? "✅✅" : message.delivered ? "✅✅" : "✅"}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Translation Panel Modal */}
      {showTranslationPanel && (
        <TranslationPanel
          message={message}
          onClose={() => setShowTranslationPanel(false)}
        />
      )}
    </>
  );
};

export default MessageBubble;