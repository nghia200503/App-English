import axiosInstance from "../libs/axios";

export const updateWordProgress = async (wordId, method, isCorrect = false) => {
    try {
        const response = await axiosInstance.post("/progress/update", {
            wordId,
            method,   // 'flashcard', 'listen', 'quiz', 'spelling'
            isCorrect // true/false (chỉ dùng cho listen, quiz, spelling)
        });
        return response.data;
    } catch (error) {
        console.error("Failed to update progress:", error);
        throw error;
    }
};

export const getMyProgress = async () => {
    try {
        const response = await axiosInstance.get("/progress");
        return response.data;
    } catch (error) {
        console.error("Failed to get progress:", error);
        throw error;
    }
};