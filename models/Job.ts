import mongoose, { Schema, Document, Model } from "mongoose";

/* ------------------------------------------------------------------ */
/*  Enums                                                               */
/* ------------------------------------------------------------------ */
export const WORK_TIMES   = ["full-time", "part-time", "remote", "shift", "contract", "internship"] as const;
export const EXPERIENCES  = ["no-exp", "1-3", "3-5", "5-plus"] as const;
export const JOB_STATUSES = ["pending", "approved", "rejected", "closed"] as const;

export type WorkTime   = typeof WORK_TIMES[number];
export type Experience = typeof EXPERIENCES[number];
export type JobStatus  = typeof JOB_STATUSES[number];

/* ------------------------------------------------------------------ */
/*  Interfaces                                                          */
/* ------------------------------------------------------------------ */
export interface IJob extends Document {
  /* Core */
  title:          string;
  description:    string;
  location:       string;
  phone:          string;           // contact phone

  /* Salary */
  salaryMin?:     number;
  salaryMax?:     number;
  salaryNegotiable: boolean;

  /* Age range */
  ageMin?:        number;
  ageMax?:        number;

  /* Work schedule */
  workTime:       WorkTime;
  experience:     Experience;

  /* Relations */
  postedBy:       mongoose.Types.ObjectId;

  /* Moderation */
  status:         JobStatus;        // pending → approved/rejected
  rejectedReason?: string;
  approvedAt?:    Date;
  approvedBy?:    mongoose.Types.ObjectId;

  /* Engagement */
  views:          number;
  savedBy:        mongoose.Types.ObjectId[];   // user ids who saved

  /* Visibility */
  featured:       boolean;          // top-pinned (set by admin)
  featuredUntil?: Date;

  /* Meta */
  deadline?:      Date;
  createdAt:      Date;
  updatedAt:      Date;
}

/* ------------------------------------------------------------------ */
/*  Schema                                                              */
/* ------------------------------------------------------------------ */
const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String, required: [true, "Sarlavha majburiy"],
      trim: true, minlength: 3, maxlength: 120,
    },
    description: {
      type: String, required: [true, "Tavsif majburiy"],
      trim: true, minlength: 20,
    },
    location:  { type: String, required: [true, "Manzil majburiy"], trim: true },
    phone:     {
      type: String, required: [true, "Telefon majburiy"],
      match: [/^\+998[0-9]{9}$/, "Telefon +998XXXXXXXXX formatida bo'lishi kerak"],
    },

    salaryMin:        { type: Number, min: 0 },
    salaryMax:        { type: Number, min: 0 },
    salaryNegotiable: { type: Boolean, default: false },

    ageMin: { type: Number, min: 14, max: 80 },
    ageMax: { type: Number, min: 14, max: 80 },

    workTime:   { type: String, enum: WORK_TIMES,  required: true },
    experience: { type: String, enum: EXPERIENCES, default: "no-exp" },

    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    status:         { type: String, enum: JOB_STATUSES, default: "pending" },
    rejectedReason: { type: String },
    approvedAt:     { type: Date },
    approvedBy:     { type: Schema.Types.ObjectId, ref: "User" },

    views:   { type: Number, default: 0 },
    savedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],

    featured:      { type: Boolean, default: false },
    featuredUntil: { type: Date },

    deadline: { type: Date },
  },
  { timestamps: true }
);

/* ── Indexes ── */
JobSchema.index({ status: 1, createdAt: -1 });          // main listing
JobSchema.index({ status: 1, views: -1 });               // trending
JobSchema.index({ status: 1, featured: -1, createdAt: -1 }); // featured first
JobSchema.index({ postedBy: 1, createdAt: -1 });         // dashboard
JobSchema.index({ title: "text", description: "text", location: "text" }); // search

/* ── Auto expire featured ── */
JobSchema.pre("save", function (next) {
  if (this.featured && this.featuredUntil && this.featuredUntil < new Date()) {
    this.featured = false;
  }
  next();
});

const Job: Model<IJob> =
  mongoose.models.Job
    ? (mongoose.models.Job as Model<IJob>)
    : mongoose.model<IJob>("Job", JobSchema);

export default Job;
