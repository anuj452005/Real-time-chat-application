import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUserPresence extends Document {
  userId: Types.ObjectId;
  status: "online" | "offline" | "away" | "busy";
  lastSeen: Date;
  isTyping: boolean;
  typingIn?: Types.ObjectId; // Chat ID where user is typing
  deviceInfo?: {
    platform: string;
    browser?: string;
    userAgent?: string;
  };
  socketId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IUserPresence>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["online", "offline", "away", "busy"],
      default: "offline",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isTyping: {
      type: Boolean,
      default: false,
    },
    typingIn: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
    deviceInfo: {
      platform: String,
      browser: String,
      userAgent: String,
    },
    socketId: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
schema.index({ userId: 1 });
schema.index({ status: 1 });
schema.index({ lastSeen: 1 });

// Update lastSeen when status changes
schema.pre("save", function(next) {
  if (this.isModified("status")) {
    this.lastSeen = new Date();
  }
  next();
});

export const UserPresence = mongoose.model<IUserPresence>("UserPresence", schema);
