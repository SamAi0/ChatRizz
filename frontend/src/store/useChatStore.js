import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { useTranslationStore } from "./useTranslationStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  groups: [],
  messages: [],
  groupMessages: [],
  userMedia: [], // New state for user media
  activeTab: "chats",
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isMediaLoading: false, // New loading state for media
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser, selectedGroup: null }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup, selectedUser: null }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      // mark peer messages as seen when fetching
      await axiosInstance.post(`/messages/seen/${userId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // New function to fetch user media
  getUserMedia: async () => {
    set({ isMediaLoading: true });
    try {
      const res = await axiosInstance.get("/messages/media");
      set({ userMedia: res.data });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch user media");
      return [];
    } finally {
      set({ isMediaLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      attachmentUrl: messageData.attachmentUrl,
      attachmentType: messageData.attachmentType,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    const { groupMessages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      groupId: groupId,
      text: messageData.text,
      image: messageData.image,
      attachmentUrl: messageData.attachmentUrl,
      attachmentType: messageData.attachmentType,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    
    // Immediately update the UI by adding the message
    set({ groupMessages: [...groupMessages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/groups/${groupId}/messages`, messageData);
      set({ groupMessages: groupMessages.concat(res.data) });
    } catch (error) {
      // remove optimistic message on failure
      set({ groupMessages: groupMessages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  leaveGroup: async (groupId) => {
    try {
      // Use the correct endpoint for leaving a group (removing oneself)
      await axiosInstance.delete(`/groups/${groupId}/members/${useAuthStore.getState().authUser._id}`);
      toast.success("Left group successfully");
      set({ selectedGroup: null });
      // Refresh groups list
      get().getGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave group");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });
      
      // immediately mark as seen when chat is open
      axiosInstance.post(`/messages/seen/${selectedUser._id}`).catch(() => {});

      // Auto-translate new incoming message if auto-translate is enabled
      const { autoTranslate, preferredLanguage, translateMessage } = useTranslationStore.getState();
      const { authUser } = useAuthStore.getState();
      
      if (autoTranslate && newMessage.text && newMessage.senderId !== authUser._id && preferredLanguage) {
        // Trigger translation in the background
        translateMessage(
          newMessage._id,
          newMessage.text,
          'auto',
          preferredLanguage
        ).then(translation => {
          // Translation completed successfully
          console.log('Auto-translation completed for message:', newMessage._id);
        }).catch(error => {
          console.error('Auto-translation failed for new message:', error);
        });
      }

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0; // reset to start
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    socket.on("delivered", ({ messageId }) => {
      const updated = get().messages.map((m) => (m._id === messageId ? { ...m, delivered: true } : m));
      set({ messages: updated });
    });

    socket.on("seen", () => {
      const updated = get().messages.map((m) =>
        m.receiverId === selectedUser._id ? { ...m, seen: true, delivered: true } : m
      );
      set({ messages: updated });
    });
  },

  subscribeToGroupMessages: (groupId) => {
    const socket = useAuthStore.getState().socket;
    
    // Join the group room
    socket.emit("joinGroup", groupId);

    socket.on("newGroupMessage", (newMessage) => {
      // Only add message if it's for the currently selected group
      if (get().selectedGroup && get().selectedGroup._id === newMessage.groupId) {
        const currentGroupMessages = get().groupMessages;
        set({ groupMessages: [...currentGroupMessages, newMessage] });
      }

      // Play notification sound if enabled
      if (get().isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    socket.on("groupTyping", ({ groupId, userId }) => {
      // Handle group typing indicators
      console.log(`User ${userId} is typing in group ${groupId}`);
    });

    socket.on("groupStopTyping", ({ groupId, userId }) => {
      // Handle group stop typing indicators
      console.log(`User ${userId} stopped typing in group ${groupId}`);
    });

    // Listen for group members added event
    socket.on("groupMembersAdded", ({ groupId, newMembers, updatedGroup }) => {
      // Update the selected group if it's the same group
      if (get().selectedGroup && get().selectedGroup._id === groupId) {
        set({ selectedGroup: updatedGroup });
      }
      
      // Refresh groups list
      get().getGroups();
    });

    // Listen for group member removed event
    socket.on("groupMemberRemoved", ({ groupId, removedMemberId, updatedGroup }) => {
      // Update the selected group if it's the same group
      if (get().selectedGroup && get().selectedGroup._id === groupId) {
        set({ selectedGroup: updatedGroup });
      }
      
      // Refresh groups list
      get().getGroups();
    });

    // Listen for group admin changed event
    socket.on("groupAdminChanged", ({ groupId, newAdminId, updatedGroup }) => {
      // Update the selected group if it's the same group
      if (get().selectedGroup && get().selectedGroup._id === groupId) {
        set({ selectedGroup: updatedGroup });
      }
      
      // Refresh groups list
      get().getGroups();
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("delivered");
    socket.off("seen");
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newGroupMessage");
    socket.off("groupTyping");
    socket.off("groupStopTyping");
  },
}));