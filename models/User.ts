import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "user" | "admin";
export type UserPlan = "free" | "basic" | "standard" | "pro" | "business";

export interface IRefreshToken {
  token:     string;
  createdAt: Date;
  expiresAt: Date;
  userAgent?: string;
  ip?:       string;
}

export interface IUser extends Document {
  name:            string;
  phone:           string;
  password:        string;
  role:            UserRole;
  plan:            UserPlan;
  planExpireDate?: Date;
  jobLimit:        number;       // max active jobs (-1 = unlimited)
  topCredits:      number;
  refreshTokens:   IRefreshToken[];
  isActive:        boolean;
  createdAt:       Date;
  updatedAt:       Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    token:     { type: String, required: true },
    expiresAt: { type: Date,   required: true },
    createdAt: { type: Date,   default: Date.now },
    userAgent: { type: String },
    ip:        { type: String },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String, required: [true, "Ism majburiy"],
      trim: true, minlength: 2, maxlength: 80,
    },
    phone: {
      type: String, required: [true, "Telefon majburiy"],
      unique: true, trim: true,
      match: [/^\+998[0-9]{9}$/, "Telefon +998XXXXXXXXX formatida bo'lishi kerak"],
    },
    password:      { type: String, required: true, select: false, minlength: 8 },
    role:          { type: String, enum: ["user", "admin"], default: "user" },
    plan:          { type: String, enum: ["free","basic","standard","pro","business"], default: "free" },
    planExpireDate:{ type: Date, default: null },
    jobLimit:      { type: Number, default: 1 },   // default free: 1 job
    topCredits:    { type: Number, default: 0, min: 0 },
    refreshTokens: { type: [RefreshTokenSchema], default: [], select: false },
    isActive:      { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });

const User: Model<IUser> =
  mongoose.models.User
    ? (mongoose.models.User as Model<IUser>)
    : mongoose.model<IUser>("User", UserSchema);

export default User;
