// import mongoose from "mongoose";

// const TopicSchema = new mongoose.Schema({
//     nameTopic: {
//         type: String,
//         required: true
//     },
//     meaning: {
//         type: String,
//         required: true
//     },
//     pronunciation: {
//         type: String,
//         required: true
//     },
//     image: {
//         type: String,
//         required: true
//     }
// }, { timestamps: true });

// const TopicModel = mongoose.model("topic", TopicSchema);
// export default TopicModel;
import mongoose from "mongoose";

const TopicSchema = new mongoose.Schema({
    nameTopic: {
        type: String,
        required: true
    },
    meaning: {
        type: String,
        required: true
    },
    pronunciation: {
        type: String,
        required: false // User có thể không cần nhập
    },
    image: {
        type: String,
        required: false // User có thể không cần ảnh
    },
    // --- THÊM TRƯỜNG NÀY ---
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null // null = Admin/System topic
    }
}, { timestamps: true });

// Index để tìm nhanh các topic của user
TopicSchema.index({ owner: 1 });

const TopicModel = mongoose.model("topic", TopicSchema);
export default TopicModel;