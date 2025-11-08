import Message from "../models/Message.js";
import User from "../models/User.js";
import { io } from "../lib/socket.js";

export const sendBroadcastMessage = async (req, res) => {
  try {
    const { text, recipients, image, attachmentUrl, attachmentType } = req.body;
    const senderId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Text is required for broadcast message" });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: "At least one recipient is required" });
    }

    // Check if all recipients exist
    const recipientUsers = await User.find({ _id: { $in: recipients } });
    if (recipientUsers.length !== recipients.length) {
      return res.status(400).json({ message: "One or more recipients not found" });
    }

    // Create broadcast messages for each recipient
    const broadcastMessages = [];
    const sentMessages = [];

    for (const recipientId of recipients) {
      const message = new Message({
        senderId,
        receiverId: recipientId,
        text,
        image,
        attachmentUrl,
        attachmentType,
        delivered: false,
        seen: false,
      });

      broadcastMessages.push(message);
    }

    // Save all messages
    await Message.insertMany(broadcastMessages);

    // Emit messages to online recipients
    for (const message of broadcastMessages) {
      const receiverSocketId = io.getReceiverSocketId(message.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
        await Message.updateOne({ _id: message._id }, { $set: { delivered: true } });
        io.to(receiverSocketId).emit("delivered", { messageId: message._id });
      }
      sentMessages.push(message);
    }

    res.status(201).json({
      message: "Broadcast message sent successfully",
      count: sentMessages.length,
      messages: sentMessages
    });
  } catch (error) {
    console.log("Error in sendBroadcastMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBroadcastHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get messages where user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ],
      // Messages sent to multiple recipients (broadcasts) would need a special flag
      // For now, we'll just get all messages
    })
    .populate("senderId", "fullName profilePic")
    .populate("receiverId", "fullName profilePic")
    .sort({ createdAt: -1 })
    .limit(100); // Limit to last 100 messages

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getBroadcastHistory controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};