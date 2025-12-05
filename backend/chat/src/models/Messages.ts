import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  chatId: Types.ObjectId;
  sender: Types.ObjectId;
  text?: string;
  attachments?: {
    type: "image" | "file" | "voice" | "video";
    url: string;
    publicId: string;
    filename?: string;
    size?: number;
    mimeType?: string;
    duration?: number; // For voice/video messages
  }[];
  messageType: "text" | "image" | "file" | "voice" | "video" | "system";
  replyTo?: Types.ObjectId; // For reply messages
  forwardedFrom?: Types.ObjectId; // For forwarded messages
  edited: boolean;
  editedAt?: Date;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  reactions: Map<string, string[]>; // emoji -> array of user IDs
  isPinned: boolean;
  pinnedBy?: Types.ObjectId;
  pinnedAt?: Date;
  readBy: Map<string, Date>; // userId -> read timestamp
  deliveredTo: Map<string, Date>; // userId -> delivered timestamp
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IMessage>(
  {
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
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
schema.index({ chatId: 1, createdAt: -1 });
schema.index({ sender: 1 });
schema.index({ messageType: 1 });
schema.index({ isPinned: 1, chatId: 1 });

// Validation
schema.pre("save", function(next) {
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

export const Messages = mongoose.model<IMessage>("Messages", schema);
