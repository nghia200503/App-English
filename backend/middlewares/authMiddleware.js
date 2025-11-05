import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js";

// authorization: xác minh user là ai
export const protectedRoute = async (req, res, next) => {
    try {
        // Lấy token từ header
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

        if (!token) {
            return res.status(401).json({message:"Không tìm thấy access token"});
        }

        // Xác nhận token hơp lệ
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
            if (err) {
                console.error(err);
                return res.status(403).json({message:"Access token hết hạn hoac không đúng"});
            }

            // Tìm user
            const user = await userModel.findById(decodedUser.userId).select("-hashedPassword");

            if (!user) {
                return res.status(404).json({message:"Không tìm thấy user"});
            }

            // Trả user về req
            req.user = user;
            next();
        });

    } catch (error) {
        console.error("Lỗi xác minh JWT trong authMiddleware",error);
        return res.status(500).json({message:"Lỗi hệ thống"});
    }
}