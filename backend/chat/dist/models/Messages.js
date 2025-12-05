import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    chatId: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        maxlength: 4000,
    },
    attachments: [{
            type: {
                type: String,
                enum: ["image", "file", "voice", "video"],
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
            publicId: {
                type: String,
                required: true,
            },
            filename: String,
            size: Number,
            mimeType: String,
            duration: Number, // For voice/video messages in seconds
        }],
    messageType: {
        type: String,
        enum: ["text", "image", "file", "voice", "video", "system"],
        default: "text",
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: "Messages",
    },
    forwardedFrom: {
        type: Schema.Types.ObjectId,
        ref: "Messages",
    },
    edited: {
        type: Boolean,
        default: false,
    },
    editedAt: Date,
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    reactions: {
        type: Map,
        of: [String], // Array of user IDs
        default: new Map(),
    },
    isPinned: {
        type: Boolean,
        default: false,
    },
    pinnedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    pinnedAt: Date,
    readBy: {
        type: Map,
        of: Date,
        default: new Map(),
    },
    deliveredTo: {
        type: Map,
        of: Date,
        default: new Map(),
    },
}, {
    timestamps: true,
});
// Indexes for efficient querying
schema.index({ chatId: 1, createdAt: -1 });
schema.index({ sender: 1 });
schema.index({ messageType: 1 });
schema.index({ isPinned: 1, chatId: 1 });
// Validation
schema.pre("save", function (next) {
    // Ensure at least text or attachments are present
    if (!this.text && (!this.attachments || this.attachments.length === 0)) {
        return next(new Error("Message must have either text or attachments"));
    }
    // System messages should not have sender
    if (this.messageType === "system" && this.sender) {
        return next(new Error("System messages should not have a sender"));
    }
    next();
});
export const Messages = mongoose.model("Messages", schema);
