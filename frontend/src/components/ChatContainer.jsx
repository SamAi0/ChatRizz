import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import ImagePreviewModal from "./ImagePreviewModal";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    openProfileSidebar,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"} group`}
              >
                {/* Avatar for received messages */}
                {msg.senderId !== authUser._id && (
                  <div className="chat-image avatar">
                    <button
                      className="w-8 h-8 rounded-full overflow-hidden border border-slate-600 hover:border-cyan-500 transition-colors"
                      onClick={() => openProfileSidebar ? openProfileSidebar(selectedUser) : null}
                      title="View Profile"
                    >
                      <img
                        src={selectedUser.profilePic || "/avatar.png"}
                        alt={selectedUser.fullName}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  </div>
                )}
                
                <div
                  className={`chat-bubble relative group-hover:shadow-lg transition-all duration-200 ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white shadow-cyan-600/20"
                      : "bg-slate-800 text-slate-200 border border-slate-700/50"
                  }`}
                >
                  {/* Inline image rendering for image messages or image attachments */}
                  {(msg.image || (msg.attachmentUrl && msg.attachmentType?.startsWith("image/"))) && (
                    <img
                      src={msg.image || msg.attachmentUrl}
                      alt="Shared"
                      className="rounded-lg h-48 object-cover cursor-zoom-in"
                      onClick={() => setPreviewImageUrl(msg.image || msg.attachmentUrl)}
                    />
                  )}
                  {/* Non-image attachments fall back to link */}
                  {msg.attachmentUrl && !msg.image && !(msg.attachmentType?.startsWith("image/")) && (
                    <a
                      href={msg.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-xs opacity-90"
                    >
                      {msg.attachmentType?.startsWith("video/") ? "View video" : "Open file"}
                    </a>
                  )}
                  {msg.text && (
                    <div className="">
                      <p className="leading-relaxed">{msg.text}</p>
                      {msg.isTranslated && msg.originalText && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-xs opacity-80">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              🌐 Translated
                            </span>
                            <button
                              onClick={(event) => {
                                const textElement = event.target.closest('.chat-bubble').querySelector('p');
                                if (textElement.textContent === msg.text) {
                                  textElement.textContent = msg.originalText;
                                  event.target.textContent = 'Show translation';
                                } else {
                                  textElement.textContent = msg.text;
                                  event.target.textContent = 'Show original';
                                }
                              }}
                              className="underline hover:no-underline text-xs"
                            >
                              Show original
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Message Timestamp & Status */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                    <p className="text-xs opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    
                    {/* Message Status for Sent Messages */}
                    {msg.senderId === authUser._id && (
                      <div className="flex items-center gap-1">
                        {msg.seen ? (
                          <span className="text-xs text-green-400" title="Seen">✓✓</span>
                        ) : msg.delivered ? (
                          <span className="text-xs text-slate-300" title="Delivered">✓✓</span>
                        ) : (
                          <span className="text-xs text-slate-400" title="Sent">✓</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
      <ImagePreviewModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </>
  );
}

export default ChatContainer;
