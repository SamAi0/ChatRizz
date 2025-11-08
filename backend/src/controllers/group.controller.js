import Group from "../models/Group.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, members, isPublic = false } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    // Validate members array
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "At least one member is required" });
    }

    // Check if all members exist
    const memberUsers = await User.find({ _id: { $in: members } });
    if (memberUsers.length !== members.length) {
      return res.status(400).json({ message: "One or more members not found" });
    }

    // Create group with current user as admin
    const group = new Group({
      name,
      description,
      createdBy: userId,
      admins: [userId],
      isPublic,
      members: [
        { user: userId, role: "admin" },
        ...members.filter(id => id.toString() !== userId.toString()).map(id => ({ user: id, role: "member" }))
      ]
    });

    await group.save();

    // Populate members for response
    await group.populate([
      { path: "createdBy", select: "fullName profilePic" },
      { path: "members.user", select: "fullName profilePic" },
      { path: "admins", select: "fullName profilePic" }
    ]);

    res.status(201).json(group);
  } catch (error) {
    console.log("Error in createGroup controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id)
      .populate([
        { path: "createdBy", select: "fullName profilePic" },
        { path: "members.user", select: "fullName profilePic statusText" },
        { path: "admins", select: "fullName profilePic" }
      ]);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member of the group
    const isMember = group.members.some(member => member.user._id.toString() === userId.toString());
    if (!isMember && !group.isPublic) {
      return res.status(403).json({ message: "Access denied to this group" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in getGroupById controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ 
      $or: [
        { "members.user": userId },
        { isPublic: true }
      ],
      isActive: true
    })
    .populate([
      { path: "createdBy", select: "fullName profilePic" },
      { path: "members.user", select: "fullName profilePic" },
      { path: "admins", select: "fullName profilePic" }
    ])
    .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getUserGroups controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    const isAdmin = group.admins.some(admin => admin.toString() === userId.toString());
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can update group settings" });
    }

    // Update fields
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (isPublic !== undefined) group.isPublic = isPublic;

    await group.save();

    // Populate for response
    await group.populate([
      { path: "createdBy", select: "fullName profilePic" },
      { path: "members.user", select: "fullName profilePic" },
      { path: "admins", select: "fullName profilePic" }
    ]);

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in updateGroup controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    const isAdmin = group.admins.some(admin => admin.toString() === userId.toString());
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can delete the group" });
    }

    // Soft delete by setting isActive to false
    group.isActive = false;
    await group.save();

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.log("Error in deleteGroup controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { members } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    const isAdmin = group.admins.some(admin => admin.toString() === userId.toString());
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can add members" });
    }

    // Validate members array
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "Members array is required" });
    }

    // Check if members exist
    const memberUsers = await User.find({ _id: { $in: members } });
    if (memberUsers.length !== members.length) {
      return res.status(400).json({ message: "One or more members not found" });
    }

    // Add members (avoid duplicates)
    const existingMemberIds = group.members.map(m => m.user.toString());
    const newMembers = members
      .filter(memberId => !existingMemberIds.includes(memberId.toString()))
      .map(memberId => ({ user: memberId, role: "member" }));

    group.members.push(...newMembers);
    await group.save();

    // Populate for response
    await group.populate([
      { path: "createdBy", select: "fullName profilePic" },
      { path: "members.user", select: "fullName profilePic" },
      { path: "admins", select: "fullName profilePic" }
    ]);

    // Emit socket event to notify all group members about the new members
    const io = req.app.get('io');
    if (io) {
      // Notify all group members that new members have been added
      io.to(`group-${id}`).emit("groupMembersAdded", {
        groupId: id,
        newMembers: newMembers,
        updatedGroup: group
      });
    }

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in addMembers controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin or trying to remove themselves
    const isAdmin = group.admins.some(admin => admin.toString() === userId.toString());
    const isRemovingSelf = userId.toString() === memberId.toString();
    
    if (!isAdmin && !isRemovingSelf) {
      return res.status(403).json({ message: "Only admins can remove other members" });
    }

    // Prevent removing the last admin
    if (group.admins.length === 1 && group.admins[0].toString() === memberId.toString()) {
      return res.status(400).json({ message: "Cannot remove the last admin" });
    }

    // Remove member
    group.members = group.members.filter(member => 
      member.user.toString() !== memberId.toString()
    );

    // If removed user was admin, remove from admins list
    group.admins = group.admins.filter(admin => 
      admin.toString() !== memberId.toString()
    );

    await group.save();

    // Populate for response
    await group.populate([
      { path: "createdBy", select: "fullName profilePic" },
      { path: "members.user", select: "fullName profilePic" },
      { path: "admins", select: "fullName profilePic" }
    ]);

    // Emit socket event to notify all group members about the removed member
    const io = req.app.get('io');
    if (io) {
      // Notify all group members that a member has been removed
      io.to(`group-${id}`).emit("groupMemberRemoved", {
        groupId: id,
        removedMemberId: memberId,
        updatedGroup: group
      });
    }

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in removeMember controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    const isAdmin = group.admins.some(admin => admin.toString() === userId.toString());
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can make other users admin" });
    }

    // Check if member exists in group
    const memberExists = group.members.some(member => 
      member.user.toString() === memberId.toString()
    );
    
    if (!memberExists) {
      return res.status(400).json({ message: "User is not a member of this group" });
    }

    // Add to admins if not already admin
    const isAdminAlready = group.admins.some(admin => 
      admin.toString() === memberId.toString()
    );
    
    if (!isAdminAlready) {
      group.admins.push(memberId);
      
      // Update member role
      const member = group.members.find(m => m.user.toString() === memberId.toString());
      if (member) {
        member.role = "admin";
      }
      
      await group.save();
    }

    // Populate for response
    await group.populate([
      { path: "createdBy", select: "fullName profilePic" },
      { path: "members.user", select: "fullName profilePic" },
      { path: "admins", select: "fullName profilePic" }
    ]);

    // Emit socket event to notify all group members about the admin change
    const io = req.app.get('io');
    if (io) {
      // Notify all group members that a member has been made admin
      io.to(`group-${id}`).emit("groupAdminChanged", {
        groupId: id,
        newAdminId: memberId,
        updatedGroup: group
      });
    }

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in makeAdmin controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// New controller to remove admin privileges
export const removeAdmin = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    const isAdmin = group.admins.some(admin => admin.toString() === userId.toString());
    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can remove admin privileges" });
    }

    // Prevent removing the last admin
    if (group.admins.length <= 1) {
      return res.status(400).json({ message: "Cannot remove the last admin" });
    }

    // Prevent admins from removing themselves
    if (memberId.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot remove yourself as admin" });
    }

    // Check if member exists in group as admin
    const isAdminMember = group.admins.some(admin => 
      admin.toString() === memberId.toString()
    );
    
    if (!isAdminMember) {
      return res.status(400).json({ message: "User is not an admin of this group" });
    }

    // Remove from admins
    group.admins = group.admins.filter(admin => 
      admin.toString() !== memberId.toString()
    );
    
    // Update member role to member
    const member = group.members.find(m => m.user.toString() === memberId.toString());
    if (member) {
      member.role = "member";
    }
    
    await group.save();

    // Populate for response
    await group.populate([
      { path: "createdBy", select: "fullName profilePic" },
      { path: "members.user", select: "fullName profilePic" },
      { path: "admins", select: "fullName profilePic" }
    ]);

    // Emit socket event to notify all group members about the admin change
    const io = req.app.get('io');
    if (io) {
      // Notify all group members that a member has been removed as admin
      io.to(`group-${id}`).emit("groupAdminChanged", {
        groupId: id,
        removedAdminId: memberId,
        updatedGroup: group
      });
    }

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in removeAdmin controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Check if group exists and user has access
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(member => member.user.toString() === userId.toString());
    if (!isMember && !group.isPublic) {
      return res.status(403).json({ message: "Access denied to this group" });
    }

    // Get messages for the group
    const messages = await Message.find({ groupId: id })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getGroupMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, image, attachmentUrl, attachmentType } = req.body;
    const senderId = req.user._id;

    if (!text && !image && !attachmentUrl) {
      return res.status(400).json({ message: "Provide text or a file." });
    }

    // Check if group exists and user is member
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(member => member.user.toString() === senderId.toString());
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    let imageUrl;
    let uploadedAttachmentUrl = attachmentUrl;
    let uploadedAttachmentType = attachmentType;

    // Handle image upload
    if (image) {
      // In a real implementation, you would upload to cloudinary here
      // For now, we'll just use the provided image URL
      imageUrl = image;
    }

    // Handle attachment upload
    if (attachmentUrl) {
      // In a real implementation, you would upload to cloudinary here
      uploadedAttachmentUrl = attachmentUrl;
      uploadedAttachmentType = attachmentType;
    }

    // Create group message
    const newMessage = new Message({
      senderId,
      groupId: id,
      text,
      image: imageUrl,
      attachmentUrl: uploadedAttachmentUrl,
      attachmentType: uploadedAttachmentType,
      delivered: false,
      seen: false,
      deliveredTo: group.members.map(m => m.user),
      seenBy: []
    });

    await newMessage.save();

    // Populate sender for response
    await newMessage.populate("senderId", "fullName profilePic");

    // Emit the new message to all group members
    const io = req.app.get('io');
    if (io) {
      io.to(`group-${id}`).emit("newGroupMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendGroupMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};