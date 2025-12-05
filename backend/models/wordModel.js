// import mongoose from "mongoose";

// const wordSchema = new mongoose.Schema({
//   word: { type: String, required: true },
//   image: { type: String, required: true },
//   imagePublicId: { type: String, required: true },
//   audio: { type: String, required: true },
//   audioPublicId: { type: String, required: true },
//   pronunciation: { type: String, required: true },
//   translation: { type: String, required: true },
//   example: { type: String, required: true },
//   topic: { type: String, required: true },
// } , { timestamps: true });

// const wordModel = mongoose.model("word", wordSchema);
// export default wordModel;
import mongoose from "mongoose";

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  pronunciation: { type: String, required: false },
  translation: { type: String, required: true },
  example: { type: String, required: false },
  topic: { type: String, required: true },
  
  // File media là optional với user
  image: { type: String, required: false },
  imagePublicId: { type: String, required: false },
  audio: { type: String, required: false },
  audioPublicId: { type: String, required: false },

  // --- THÊM TRƯỜNG NÀY ---
  owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      default: null 
  }
} , { timestamps: true });

// Index để tìm nhanh
wordSchema.index({ owner: 1, topic: 1 });

const wordModel = mongoose.model("word", wordSchema);
export default wordModel;