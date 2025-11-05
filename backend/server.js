import express from "express"; 
import dotenv from 'dotenv';
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import topicRoute from "./routes/topicRoute.js";
import wordRoute from "./routes/wordRoute.js";
import cookieParser from "cookie-parser";
import { protectedRoute } from "./middlewares/authMiddleware.js";
import cors from "cors";
// Khởi tạo Express 
const app = express();
// Load biến môi trường từ file .env
dotenv.config();

// Cổng server
const PORT = process.env.PORT || 5001;

// Thiết lập Middleware
app.use(express.json());
app.use(cookieParser());
// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// Tách chuỗi CLIENT_URL thành một mảng các origin được phép
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép nếu origin nằm trong danh sách hoặc nếu không có origin (ví dụ: Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Origin này không được phép bởi CORS'));
    }
  },
  credentials: true
}));


app.use('/api/auth', authRoute);
app.use(protectedRoute);
app.use('/api/users', userRoute);
app.use('/api/topics', topicRoute);
app.use('/api/words', wordRoute);
// Public route cho phép truy cập từ bên ngoài

// Private route, cần xác thực mới truy cập được
// Chạy server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server chạy trên cổng: ${PORT}`);
  });
})