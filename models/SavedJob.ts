import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISavedJob extends Document {
  user:      mongoose.Types.ObjectId;
  job:       mongoose.Types.ObjectId;
  createdAt: Date;
}

const SavedJobSchema = new Schema<ISavedJob>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    job:  { type: Schema.Types.ObjectId, ref: "Job",  required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SavedJobSchema.index({ user: 1, job: 1 }, { unique: true });
SavedJobSchema.index({ user: 1, createdAt: -1 });

const SavedJob: Model<ISavedJob> =
  mongoose.models.SavedJob
    ? (mongoose.models.SavedJob as Model<ISavedJob>)
    : mongoose.model<ISavedJob>("SavedJob", SavedJobSchema);

export default SavedJob;
