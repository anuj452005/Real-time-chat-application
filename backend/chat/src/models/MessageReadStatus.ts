import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessageReadStatus extends Document {
  messageId: Types.ObjectId;
  chatId: Types.ObjectId;
  userId: Types.ObjectId;
  readAt: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IMessageReadStatus>(
  {
    messageId: {
      type: Schema.Types.ObjectId,
      ref: "Messages",
      required: true,
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    deliveredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique read status per message per user
schema.index({ messageId: 1, userId: 1 }, { unique: true });

// Index for efficient querying by chat and user
schema.index({ chatId: 1, userId: 1 });

// Index for querying by message
schema.index({ messageId: 1 });

export const MessageReadStatus = mongoose.model<IMessageReadStatus>("MessageReadStatus", schema);
