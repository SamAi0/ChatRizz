import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import GroupHeader from "./GroupHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import ImagePreviewModal from "./ImagePreviewModal";
import MessageBubble from "./MessageBubble";

function ChatContainer() {
  const {
    selectedUser,
    selectedGroup,
    getMessagesByUserId,
    getGroupMessages,
    messages,
    groupMessages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  useEffect(() => {
    if (selectedUser) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
    } else if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
      subscribeToGroupMessages(selectedGroup._id);
    }

    // clean up
    return () => {
      unsubscribeFromMessages();
      unsubscribeFromGroupMessages();
    };
  }, [selectedUser, selectedGroup, getMessagesByUserId, getGroupMessages, subscribeToMessages, unsubscribeFromMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, groupMessages, selectedUser, selectedGroup]);

  // Render group chat UI if a group is selected
  if (selectedGroup) {
    return (
      <>
        <GroupHeader />
        <div className="flex-1 px-4 overflow-y-auto py-4">
          {groupMessages.length > 0 && !isMessagesLoading ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {groupMessages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  onImageClick={setPreviewImageUrl}
                  isGroupMessage={true}
                />
              ))}
              {/* 👇 scroll target */}
              <div ref={messageEndRef} />
            </div>
          ) : isMessagesLoading ? (
            <MessagesLoadingSkeleton />
          ) : (
            <NoChatHistoryPlaceholder name={selectedGroup.name} isGroup={true} />
          )}
        </div>

        <MessageInput isGroupChat={true} />
        <ImagePreviewModal
          imageUrl={previewImageUrl}
          onClose={() => setPreviewImageUrl(null)}
        />
      </>
    );
  }

  // Render regular chat UI if a user is selected
  if (selectedUser) {
    return (
      <>
        <ChatHeader />
        <div className="flex-1 px-4 overflow-y-auto py-4">
          {messages.length > 0 && !isMessagesLoading ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  onImageClick={setPreviewImageUrl}
                />
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

  // No chat selected
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-slate-400 mb-4">
          Select a chat or group to start messaging
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;