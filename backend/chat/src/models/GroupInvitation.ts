import mongoose, { Document, Schema, Types } from "mongoose";

export interface IGroupInvitation extends Document {
  chatId: Types.ObjectId;
  invitedBy: Types.ObjectId;
  invitedUser: Types.ObjectId;
  status: "pending" | "accepted" | "declined" | "expired";
  message?: string; // Optional invitation message
  expiresAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IGroupInvitation>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    message: {
      type: String,
      maxlength: 200,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    respondedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
schema.index({ invitedUser: 1, status: 1 });
schema.index({ chatId: 1, status: 1 });
schema.index({ expiresAt: 1 });

// TTL index for expiring invitations
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index to prevent duplicate invitations
schema.index({ chatId: 1, invitedUser: 1, status: 1 });

// Validation
schema.pre("save", async function (next) {
  // Only allow one pending invitation per user per chat
  if (this.status === "pending") {
    try {
      const existing: any = await (this.constructor as any).findOne({
        chatId: this.chatId,
        invitedUser: this.invitedUser,
        status: "pending",
        _id: { $ne: this._id }
      });
      if (existing) {
        return next(new Error("User already has a pending invitation for this chat"));
      }
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export const GroupInvitation = mongoose.model<IGroupInvitation>("GroupInvitation", schema);
