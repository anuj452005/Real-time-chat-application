import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    chatType: {
        type: String,
        enum: ["private", "group"],
        required: true,
    },
    participants: [{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }],
    name: {
        type: String,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    avatar: {
        url: {
            type: String,
            default: null,
        },
        publicId: {
            type: String,
            default: null,
        },
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    admins: [{
            type: Schema.Types.ObjectId,
            ref: "User",
        }],
    isActive: {
        type: Boolean,
        default: true,
    },
    settings: {
        allowInvites: {
            type: Boolean,
            default: true,
        },
        allowMemberMessages: {
            type: Boolean,
            default: true,
        },
        allowFileSharing: {
            type: Boolean,
            default: true,
        },
        allowVoiceMessages: {
            type: Boolean,
            default: true,
        },
    },
    latestMessage: {
        messageId: {
            type: Schema.Types.ObjectId,
            ref: "Messages",
        },
        text: String,
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        messageType: {
            type: String,
            enum: ["text", "image", "file", "voice", "system"],
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: new Map(),
    },
}, {
    timestamps: true,
});
// Index for efficient querying
schema.index({ participants: 1, chatType: 1 });
schema.index({ createdBy: 1 });
schema.index({ "latestMessage.timestamp": -1 });
// Validation for private chats
schema.pre("save", function (next) {
    if (this.chatType === "private" && this.participants.length !== 2) {
        return next(new Error("Private chats must have exactly 2 participants"));
    }
    if (this.chatType === "group" && this.participants.length < 2) {
        return next(new Error("Group chats must have at least 2 participants"));
    }
    next();
});
export const Chat = mongoose.model("Chat", schema);
