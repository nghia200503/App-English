import mongoose from "mongoose";

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  image: { type: String, required: true },
  imagePublicId: { type: String, required: true },
  audio: { type: String, required: true },
  audioPublicId: { type: String, required: true },
  pronunciation: { type: String, required: true },
  translation: { type: String, required: true },
  example: { type: String, required: true },
  topic: { type: String, required: true },
} , { timestamps: true });

const wordModel = mongoose.model("word", wordSchema);
export default wordModel;