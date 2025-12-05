import mongoose, { Document, Schema, Types } from "mongoose";

export interface INotification extends Document {
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  chatId?: Types.ObjectId;
  messageId?: Types.ObjectId;
  type: "message" | "group_invite" | "group_join" | "group_leave" | "group_admin" | "message_reaction" | "message_reply" | "user_online" | "user_offline";
  title: string;
  body: string;
  data?: {
    [key: string]: any;
  };
  isRead: boolean;
  readAt?: Date;
  priority: "low" | "normal" | "high";
  channels: {
    inApp: boolean;
    push: boolean;
    email: boolean;
  };
  scheduledFor?: Date; // For delayed notifications
  expiresAt?: Date; // For expiring notifications
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: "Messages",
    },
    type: {
      type: String,
      enum: [
        "message",
        "group_invite",
        "group_join",
        "group_leave",
        "group_admin",
        "message_reaction",
        "message_reply",
        "user_online",
        "user_offline"
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    body: {
      type: String,
      required: true,
      maxlength: 500,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    channels: {
      inApp: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: false,
      },
    },
    scheduledFor: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
schema.index({ recipient: 1, isRead: 1, createdAt: -1 });
schema.index({ type: 1 });
schema.index({ chatId: 1 });
schema.index({ scheduledFor: 1 });
schema.index({ expiresAt: 1 });

// TTL index for expiring notifications
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for unread notifications
schema.index({ recipient: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>("Notification", schema);
