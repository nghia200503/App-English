import userModel from "../models/userModel.js";

export const authMe = (req, res) => {
    try {
        const user = req.user; // Lấy từ authMiddleware

        return res.status(200).json({user});
    } catch (error) {
        console.error("Lỗi khi gọi API authMe:", error);
        return res.status(500).json({message:"Lỗi hệ thống"});
    }
};

export const test = async (req, res) => {
    return res.sendStatus(204);
}

export const getLeaderboard = async (req, res) => {
    try {
        // Lấy top 20 user có role là 'user'
        const leaders = await userModel.find({ role: 'user' })
            // SỬA Ở ĐÂY: 
            // 1. level: -1 (Sắp xếp Level giảm dần - Ưu tiên cao nhất)
            // 2. experiencePoints: -1 (Nếu Level bằng nhau, sắp xếp XP giảm dần)
            .sort({ level: -1, experiencePoints: -1 }) 
            .limit(20)
            .select('displayName username avatarUrl level experiencePoints');

        res.status(200).json({
            success: true,
            data: leaders
        });
    } catch (error) {
        console.error("Lỗi lấy bảng xếp hạng:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};