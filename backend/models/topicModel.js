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
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, { timestamps: true });

const TopicModel = mongoose.model("topic", TopicSchema);
export default TopicModel;