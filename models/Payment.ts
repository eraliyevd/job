import mongoose, { Schema, Document, Model } from "mongoose";
import type { PlanKey } from "@/lib/plans";

export type PaymentStatus = "pending" | "approved" | "rejected";

export interface IPayment extends Document {
  userId:          mongoose.Types.ObjectId;
  plan:            PlanKey;
  amount:          number;          // so'm

  /* Screenshot — stored as base64 data URI in MongoDB.
     Max ~2 MB after base64 encoding (~1.5 MB raw image). */
  screenshot?:     string;          // data:image/...;base64,...
  screenshotName?: string;          // original filename for display

  /* Moderation */
  status:          PaymentStatus;
  adminNote?:      string;          // rejection reason or admin comment
  reviewedBy?:     mongoose.Types.ObjectId;
  reviewedAt?:     Date;

  /* What was granted (filled on approval) */
  grantedPlan?:    PlanKey;
  grantedUntil?:   Date;
  grantedTopCredits?: number;
  grantedJobLimit?:   number;

  createdAt:       Date;
  updatedAt:       Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan:   {
      type: String,
      enum: ["free","basic","standard","pro","business"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },

    screenshot:     { type: String },           // base64 data URI
    screenshotName: { type: String },

    status:     { type: String, enum: ["pending","approved","rejected"], default: "pending" },
    adminNote:  { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },

    grantedPlan:       { type: String },
    grantedUntil:      { type: Date },
    grantedTopCredits: { type: Number },
    grantedJobLimit:   { type: Number },
  },
  { timestamps: true }
);

PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment
    ? (mongoose.models.Payment as Model<IPayment>)
    : mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
