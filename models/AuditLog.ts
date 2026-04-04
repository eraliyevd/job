import mongoose, { Schema, Document, Model } from "mongoose";

export type AuditAction =
  | "admin.login"
  | "admin.login_failed"
  | "job.approve"   | "job.reject"    | "job.feature"   | "job.unfeature" | "job.close"
  | "payment.approve" | "payment.reject"
  | "user.block"    | "user.unblock"  | "user.role_change";

export interface IAuditLog extends Document {
  adminId:    mongoose.Types.ObjectId;
  adminName:  string;
  action:     AuditAction;
  targetId?:  string;              // affected resource ID
  targetType?:"job" | "payment" | "user";
  detail?:    string;              // extra context (reject reason etc.)
  ip:         string;
  userAgent?: string;
  createdAt:  Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    adminName:  { type: String, required: true },
    action:     { type: String, required: true },
    targetId:   { type: String },
    targetType: { type: String, enum: ["job", "payment", "user"] },
    detail:     { type: String },
    ip:         { type: String, required: true },
    userAgent:  { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ adminId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog
    ? (mongoose.models.AuditLog as Model<IAuditLog>)
    : mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
