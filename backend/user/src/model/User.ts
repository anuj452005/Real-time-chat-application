import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  googleId?: string;
  authProvider?: "email" | "google";
  avatar?: {
    url: string;
    publicId: string;
  };
  status: "online" | "offline" | "away" | "busy";
  lastSeen: Date;
  isActive: boolean;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sound: boolean;
    };
    privacy: {
      showLastSeen: boolean;
      showOnlineStatus: boolean;
    };
  };
}

const schema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null values and still maintains uniqueness
    },
    authProvider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
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
    status: {
      type: String,
      enum: ["online", "offline", "away", "busy"],
      default: "offline",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        sound: {
          type: Boolean,
          default: true,
        },
      },
      privacy: {
        showLastSeen: {
          type: Boolean,
          default: true,
        },
        showOnlineStatus: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", schema);