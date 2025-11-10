// import userModel from "../models/userModel.js";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import crypto from "crypto";
// import sessionModel from "../models/sessionModel.js";
// import { uploader } from "cloudinary";
// import cloudinary from "../libs/cloudinary.js";

// const ACCESS_TOKEN_TTL = "30m";
// const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

// // Đăng nhập
// const loginUser = async (req, res) => {
//   try {
//     // Lấy input
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res
//         .status(400)
//         .json({ message: "Vui lòng điền đầy đủ thông tin" });
//     }

//     // Kiểm tra user tồn tại
//     const user = await userModel.findOne({ username });

//     if (!user) {
//       return res
//         .status(401)
//         .json({ message: "Username hoặc mật khẩu không đúng" });
//     }

//     // Kiểm tra mật khẩu
//     const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

//     if (!passwordCorrect) {
//       return res
//         .status(401)
//         .json({ message: "Username hoặc mật khẩu không đúng" });
//     }

//     // Tạo access token với JWT
//     const accessToken = jwt.sign(
//       { userId: user._id },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: ACCESS_TOKEN_TTL }
//     );

//     // Tạo refresh token
//     const refreshToken = crypto.randomBytes(64).toString("hex");

//     // Tạo session lưu refresh token vào DB
//     await sessionModel.create({
//       userId: user._id,
//       refreshToken,
//       expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
//     });

//     // Trả refresh token về trang coookie
//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: REFRESH_TOKEN_TTL,
//     });

//     // Trả access token về trong res
//     return res
//       .status(200)
//       .json({ message: `User ${user.displayName} đã đăng nhập`, accessToken });
//   } catch (error) {
//     console.error("Lỗi khi gọi API đăng nhập:", error);
//     return res.status(500).json({ message: "Lỗi hệ thống" });
//   }
// };

// const bufferToDataURI = (file) => {
//   const b64 = Buffer.from(file.buffer).toString("base64");
//   // Giả sử Cloudinary uploader.upload có thể xử lý Data URI
//   return "data:" + file.mimetype + ";base64," + b64;
// };

// const addUser = async (req, res) => {
//   let avatarId; // Khai báo ngoài scope để xử lý lỗi
//   try {
//     const { username, password, email, firstName, lastName, role, phone, bio } =
//       req.body;
//     const file = req.file; // File ảnh từ multer
//     let avatarUrl;

//     if (!username || !password || !email || (!firstName && !lastName)) {
//       // Trả về lỗi 400 nếu thiếu trường bắt buộc
//       return res
//         .status(400)
//         .json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc" });
//     }

//     // Kiểm tra user/email đã tồn tại
//     const duplicateUsername = await userModel.findOne({ username });
//     if (duplicateUsername) {
//       return res.status(409).json({ message: "Username đã tồn tại" });
//     }
//     const duplicateEmail = await userModel.findOne({ email });
//     if (duplicateEmail) {
//       return res.status(409).json({ message: "Email đã tồn tại" });
//     }

//     // Xử lý upload ảnh (nếu có)
//     if (file) {
//       // Chuyển buffer sang Data URI (giống topicController)
//       const dataURI = bufferToDataURI(file);

//       // Upload lên Cloudinary
//       const result = await cloudinary.uploader.upload(
//         // Sử dụng 'uploader' như trong file gốc
//         dataURI,
//         {
//           folder: "avatars", // LƯU VÀO THƯ MỤC 'avatars'
//           // Tùy chọn chuyển đổi (giống code cũ)
//           transformation: [{ width: 150, height: 150, crop: "fill" }],
//         }
//       );
//       avatarUrl = result.secure_url;
//       avatarId = result.public_id;
//     }

//     // Mã hóa mật khẩu
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Tạo displayName (Giữ lại logic cũ)
//     let displayName;
//     if (firstName && lastName) {
//       displayName = `${lastName} ${firstName}`;
//     } else if (firstName) {
//       displayName = firstName;
//     } else if (lastName) {
//       displayName = lastName;
//     } else {
//       displayName = username;
//     }

//     // Tạo user mới
//     await userModel.create({
//       username,
//       hashedPassword,
//       email,
//       displayName,
//       role: role || "user",
//       phone: phone || undefined,
//       bio: bio || undefined,
//       avatarUrl,
//       avatarId,
//     });

//     // Return
//     return res.sendStatus(204);
//   } catch (error) {
//     console.error("Lỗi khi gọi API thêm người dùng:", error);
//     // Xóa ảnh đã upload nếu có lỗi xảy ra sau khi upload thành công nhưng trước khi lưu DB
//     if (avatarId) {
//       // Đảm bảo bạn có import 'uploader' để sử dụng uploader.destroy
//       await uploader.destroy(avatarId);
//     }
//     return res
//       .status(500)
//       .json({ message: "Lỗi hệ thống khi thêm người dùng" });
//   }
// };

// // Đăng ký
// const registerUser = async (req, res) => {
//   try {
//     const { username, password, email, firstName, lastName, role, phone, bio } =
//       req.body;

//     if (!username || !password || !email || (!firstName && !lastName)) {
//       return res
//         .status(400)
//         .json({ message: "Vui lòng điền đầy đủ thông tin" });
//     }

//     // Kiểm tra user đã tồn tại chưa
//     const duplicate = await userModel.findOne({ username });
//     if (duplicate) {
//       return res.status(409).json({ message: "Username đã tồn tại" });
//     }

//     // Kiểm tra email
//     const exists = await userModel.findOne({ email });
//     if (exists) {
//       return res.status(409).json({ message: "Email đã tồn tại" });
//     }

//     // Mã hóa mật khẩu
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Tạo displayName
//     let displayName;
//     if (firstName && lastName) {
//       displayName = `${lastName} ${firstName}`;
//     } else if (firstName) {
//       displayName = firstName;
//     } else if (lastName) {
//       displayName = lastName;
//     } else {
//       displayName = username;
//     }

//     // Tạo user mới
//     await userModel.create({
//       username,
//       hashedPassword,
//       email,
//       displayName,
//       role: role || "user",
//       phone: phone || undefined,
//       bio: bio || undefined,
//     });

//     // Return
//     return res.sendStatus(204);
//   } catch (error) {
//     console.error("Lỗi khi gọi API đăng ký:", error);
//     return res.status(500).json({ message: "Lỗi hệ thống" });
//   }
// };

// // Đăng xuất
// const logoutUser = async (req, res) => {
//   try {
//     // Lấy refresh token từ cookie
//     const token = req.cookies?.refreshToken;

//     if (token) {
//       // Xóa refresh trong session DB
//       await sessionModel.deleteOne({ refreshToken: token });

//       // Xóa cookie trình duyệt
//       res.clearCookie("refreshToken");
//     }

//     return res.sendStatus(204);
//   } catch (error) {
//     console.error("Lỗi khi gọi API đăng xuất:", error);
//     return res.status(500).json({ message: "Lỗi hệ thống" });
//   }
// };

// // Tạo access token mới từ refresh token
// const refreshToken = async (req, res) => {
//   try {
//     // Lấy refresh token từ cookie
//     const token = req.cookies?.refreshToken;

//     if (!token) {
//       return res.status(401).json({ message: "Token không tồn tại" });
//     }

//     // So với refresh token trong DB
//     const session = await sessionModel.findOne({ refreshToken: token });

//     if (!session) {
//       return res
//         .status(403)
//         .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
//     }

//     // Kiểm tra token đã hết hạn chưa
//     if (session.expiresAt < new Date()) {
//       return res.status(403).json({ message: "Token đã hết hạn" });
//     }

//     // Tạo access token mới
//     const accessToken = jwt.sign(
//       { userId: session.userId },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: ACCESS_TOKEN_TTL }
//     );

//     return res.status(200).json({ accessToken });
//   } catch (error) {
//     console.error("Lỗi khi gọi refreshToken:", error);
//     return res.status(500).json({ message: "Lỗi hệ thống" });
//   }
// };

// // Lấy danh sách người dùng
// const userList = async (req, res) => {
//   try {
//     // 1. Lấy page và limit từ query params (giống topicList)
//     const page = parseInt(req.query.page) || 1;
//     // Đặt limit mặc định, ví dụ 8 (bạn có thể đổi thành 5 hoặc 10)
//     const limit = parseInt(req.query.limit) || 8;

//     // 2. Tính toán skip (giống topicList)
//     const skip = (page - 1) * limit;

//     // 3. Đếm tổng số documents (giống topicList)
//     const total = await userModel.countDocuments();

//     // 4. Lấy data với pagination (kết hợp logic cũ và mới)
//     const users = await userModel
//       .find()
//       .select("username displayName email avatarUrl phone role") // Giữ lại select từ hàm cũ
//       .sort({ createdAt: -1 }) // Sắp xếp mới nhất trước
//       .skip(skip)
//       .limit(limit);

//     // 5. Tính tổng số trang (giống topicList)
//     const totalPages = Math.ceil(total / limit);

//     // 6. Trả về kết quả với metadata (giống topicList)
//     res.json({
//       success: true,
//       data: users,
//       pagination: {
//         currentPage: page,
//         totalPages: totalPages,
//         totalItems: total,
//         itemsPerPage: limit,
//         hasNextPage: page < totalPages,
//         hasPrevPage: page > 1,
//       },
//     });
//   } catch (error) {
//     console.error("Lỗi khi lấy danh sách người dùng:", error);
//     // Trả về lỗi theo format mới
//     res.status(500).json({
//       success: false,
//       message: "Lỗi server khi lấy danh sách người dùng",
//     });
//   }
// };

// // Lấy thông tin một người dùng
// const getUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await userModel
//       .findById(id)
//       .select("username displayName email avatarUrl phone role bio");

//     if (!user) {
//       return res.status(404).json({ message: "Không tìm thấy người dùng" });
//     }

//     return res.status(200).json(user);
//   } catch (error) {
//     console.error("Lỗi khi lấy thông tin người dùng:", error);
//     return res.status(500).json({ message: "Lỗi hệ thống" });
//   }
// };

// // Cập nhật người dùng
// const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { username, email, displayName, phone, role, bio, password } =
//       req.body;
//     const file = req.file; // Lấy file từ multer

//     // Kiểm tra user tồn tại
//     const user = await userModel.findById(id);
//     if (!user) {
//       return res.status(404).json({ message: "Không tìm thấy người dùng" });
//     }

//     // 1. Kiểm tra username trùng (nếu thay đổi)
//     if (username && username !== user.username) {
//       const usernameExists = await userModel.findOne({
//         username,
//         _id: { $ne: id },
//       });
//       if (usernameExists) {
//         return res.status(409).json({ message: "Username đã được sử dụng" });
//       }
//       user.username = username;
//     }

//     // 2. Kiểm tra email trùng (nếu thay đổi)
//     if (email && email !== user.email) {
//       const emailExists = await userModel.findOne({ email, _id: { $ne: id } });
//       if (emailExists) {
//         return res.status(409).json({ message: "Email đã được sử dụng" });
//       }
//       user.email = email;
//     }

//     // 3. Xử lý Avatar (NẾU CÓ FILE MỚI)
//     const oldAvatarId = user.avatarId; // Lưu lại ID avatar cũ

//     if (file) {
//       // Chuyển buffer sang Data URI
//       const dataURI = bufferToDataURI(file);

//       // Upload ảnh mới lên Cloudinary
//       const result = await cloudinary.uploader.upload(dataURI, {
//         folder: "avatars",
//         transformation: [{ width: 150, height: 150, crop: "fill" }],
//       });

//       // Cập nhật URL và ID avatar mới
//       user.avatarUrl = result.secure_url;
//       user.avatarId = result.public_id;

//       // Xóa avatar cũ (nếu có)
//       if (oldAvatarId) {
//         try {
//           await cloudinary.uploader.destroy(oldAvatarId);
//         } catch (deleteError) {
//           // Ghi log lỗi nhưng không dừng tiến trình cập nhật
//           console.error("Lỗi khi xóa avatar cũ trên Cloudinary:", deleteError);
//         }
//       }
//     }

//     // 4. Cập nhật các trường khác
//     if (displayName) user.displayName = displayName;
//     if (phone !== undefined) user.phone = phone;
//     if (role) user.role = role;
//     if (bio !== undefined) user.bio = bio;

//     // 5. Cập nhật mật khẩu nếu có
//     if (password) {
//       user.hashedPassword = await bcrypt.hash(password, 10);
//     }

//     await user.save();

//     // Trả về thông tin user đã cập nhật
//     const updatedUser = await userModel
//       .findById(id)
//       .select("username displayName email avatarUrl phone role bio");

//     return res.status(200).json({
//       message: "Cập nhật người dùng thành công",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Lỗi khi cập nhật người dùng:", error);
//     // Xử lý lỗi nếu upload thất bại (nếu cần)
//     // (Nếu upload lỗi, nó sẽ bị bắt bởi catch block này)
//     return res.status(500).json({ message: "Lỗi hệ thống" });
//   }
// };

// // Xóa người dùng
// const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // 1. Kiểm tra user tồn tại và lấy thông tin avatarId
//     const user = await userModel.findById(id);
//     if (!user) {
//       return res.status(404).json({ message: "Không tìm thấy người dùng" });
//     }

//     // 2. XỬ LÝ XÓA AVATAR TRÊN CLOUDINARY
//     if (user.avatarId) {
//       try {
//         // Sử dụng uploader.destroy để xóa file
//         await cloudinary.uploader.destroy(user.avatarId);
//         console.log(`Đã xóa avatar trên Cloudinary: ${user.avatarId}`);
//       } catch (cloudError) {
//         // Ghi log lỗi xóa Cloudinary nhưng KHÔNG trả về 500
//         // vì việc xóa user khỏi DB vẫn quan trọng hơn
//         console.error("Lỗi khi xóa avatar Cloudinary:", cloudError);
//       }
//     }

//     // 3. Xóa tất cả session của user
//     await sessionModel.deleteMany({ userId: id });

//     // 4. Xóa user khỏi DB
//     await userModel.findByIdAndDelete(id);

//     return res.status(200).json({ message: "Xóa người dùng thành công" });
//   } catch (error) {
//     console.error("Lỗi khi xóa người dùng:", error);
//     return res.status(500).json({ message: "Lỗi hệ thống" });
//   }
// };

// export {
//   loginUser,
//   registerUser,
//   logoutUser,
//   refreshToken,
//   userList,
//   getUser,
//   updateUser,
//   deleteUser,
//   addUser,
// };
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sessionModel from "../models/sessionModel.js";
import { uploader } from "cloudinary";
import cloudinary from "../libs/cloudinary.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

// Đăng nhập
const loginUser = async (req, res) => {
  try {
    // Lấy input
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    // Kiểm tra user tồn tại
    const user = await userModel.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Username hoặc mật khẩu không đúng" });
    }

    // Kiểm tra mật khẩu
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "Username hoặc mật khẩu không đúng" });
    }

    // Tạo access token với JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    // Tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // Tạo session lưu refresh token vào DB
    await sessionModel.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // Tạo đối tượng user an toàn để gửi về client
    const userForClient = {
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      bio: user.bio,
      phone: user.phone,
      createdAt: user.createdAt,
      dob: user.dob,
      address: user.address,
      occupation: user.occupation,
      learningGoal: user.learningGoal
    };

    // Trả refresh token về trang coookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    // Trả access token về trong res
    return res
      .status(200)
      .json({ message: `User ${user.displayName} đã đăng nhập`, accessToken, user: userForClient });
  } catch (error) {
    console.error("Lỗi khi gọi API đăng nhập:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

const bufferToDataURI = (file) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  // Giả sử Cloudinary uploader.upload có thể xử lý Data URI
  return "data:" + file.mimetype + ";base64," + b64;
};

const addUser = async (req, res) => {
  let avatarId; // Khai báo ngoài scope để xử lý lỗi
  try {
    const { username, password, email, firstName, lastName, role, phone, bio } =
      req.body;
    const file = req.file; // File ảnh từ multer
    let avatarUrl;

    if (!username || !password || !email || (!firstName && !lastName)) {
      // Trả về lỗi 400 nếu thiếu trường bắt buộc
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc" });
    }

    // Kiểm tra user/email đã tồn tại
    const duplicateUsername = await userModel.findOne({ username });
    if (duplicateUsername) {
      return res.status(409).json({ message: "Username đã tồn tại" });
    }
    const duplicateEmail = await userModel.findOne({ email });
    if (duplicateEmail) {
      return res.status(409).json({ message: "Email đã tồn tại" });
    }

    // Xử lý upload ảnh (nếu có)
    if (file) {
      // Chuyển buffer sang Data URI (giống topicController)
      const dataURI = bufferToDataURI(file);

      // Upload lên Cloudinary
      const result = await cloudinary.uploader.upload(
        // Sử dụng 'uploader' như trong file gốc
        dataURI,
        {
          folder: "avatars", // LƯU VÀO THƯ MỤC 'avatars'
          // Tùy chọn chuyển đổi (giống code cũ)
          transformation: [{ width: 150, height: 150, crop: "fill" }],
        }
      );
      avatarUrl = result.secure_url;
      avatarId = result.public_id;
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo displayName (Giữ lại logic cũ)
    let displayName;
    if (firstName && lastName) {
      displayName = `${lastName} ${firstName}`;
    } else if (firstName) {
      displayName = firstName;
    } else if (lastName) {
      displayName = lastName;
    } else {
      displayName = username;
    }

    // Tạo user mới
    await userModel.create({
      username,
      hashedPassword,
      email,
      displayName,
      role: role || "user",
      phone: phone || undefined,
      bio: bio || undefined,
      avatarUrl,
      avatarId,
    });

    // Return
    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi API thêm người dùng:", error);
    // Xóa ảnh đã upload nếu có lỗi xảy ra sau khi upload thành công nhưng trước khi lưu DB
    if (avatarId) {
      // Đảm bảo bạn có import 'uploader' để sử dụng uploader.destroy
      await uploader.destroy(avatarId);
    }
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống khi thêm người dùng" });
  }
};

// Đăng ký
const registerUser = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName, role, phone, bio } =
      req.body;

    if (!username || !password || !email || (!firstName && !lastName)) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    // Kiểm tra user đã tồn tại chưa
    const duplicate = await userModel.findOne({ username });
    if (duplicate) {
      return res.status(409).json({ message: "Username đã tồn tại" });
    }

    // Kiểm tra email
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo displayName
    let displayName;
    if (firstName && lastName) {
      displayName = `${lastName} ${firstName}`;
    } else if (firstName) {
      displayName = firstName;
    } else if (lastName) {
      displayName = lastName;
    } else {
      displayName = username;
    }

    // Tạo user mới
    await userModel.create({
      username,
      hashedPassword,
      email,
      displayName,
      role: role || "user",
      phone: phone || undefined,
      bio: bio || undefined,
    });

    // Return
    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi API đăng ký:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Đăng xuất
const logoutUser = async (req, res) => {
  try {
    // Lấy refresh token từ cookie
    const token = req.cookies?.refreshToken;

    if (token) {
      // Xóa refresh trong session DB
      await sessionModel.deleteOne({ refreshToken: token });

      // Xóa cookie trình duyệt
      res.clearCookie("refreshToken");
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi API đăng xuất:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Tạo access token mới từ refresh token
const refreshToken = async (req, res) => {
  try {
    // Lấy refresh token từ cookie
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Token không tồn tại" });
    }

    // So với refresh token trong DB
    const session = await sessionModel.findOne({ refreshToken: token });

    if (!session) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Kiểm tra token đã hết hạn chưa
    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: "Token đã hết hạn" });
    }

    // Tạo access token mới
    const accessToken = jwt.sign(
      { userId: session.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Lỗi khi gọi refreshToken:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy danh sách người dùng
const userList = async (req, res) => {
  try {
    // 1. Lấy page và limit từ query params (giống topicList)
    const page = parseInt(req.query.page) || 1;
    // Đặt limit mặc định, ví dụ 8 (bạn có thể đổi thành 5 hoặc 10)
    const limit = parseInt(req.query.limit) || 8;

    // 2. Tính toán skip (giống topicList)
    const skip = (page - 1) * limit;

    // 3. Đếm tổng số documents (giống topicList)
    const total = await userModel.countDocuments();

    // 4. Lấy data với pagination (kết hợp logic cũ và mới)
    const users = await userModel
      .find()
      .select("username displayName email avatarUrl phone role") // Giữ lại select từ hàm cũ
      .sort({ createdAt: -1 }) // Sắp xếp mới nhất trước
      .skip(skip)
      .limit(limit);

    // 5. Tính tổng số trang (giống topicList)
    const totalPages = Math.ceil(total / limit);

    // 6. Trả về kết quả với metadata (giống topicList)
    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    // Trả về lỗi theo format mới
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách người dùng",
    });
  }
};

// Lấy thông tin một người dùng
const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel
      .findById(id)
      .select("username displayName email avatarUrl phone role bio");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cập nhật người dùng
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
        username, email, displayName, phone, role, bio, password,
        dob, address, occupation, learningGoal 
    } = req.body;
    const file = req.file; // Lấy file từ multer

    // Kiểm tra user tồn tại
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // 1. Kiểm tra username trùng (nếu thay đổi)
    if (username && username !== user.username) {
      const usernameExists = await userModel.findOne({
        username,
        _id: { $ne: id },
      });
      if (usernameExists) {
        return res.status(409).json({ message: "Username đã được sử dụng" });
      }
      user.username = username;
    }

    // 2. Kiểm tra email trùng (nếu thay đổi)
    if (email && email !== user.email) {
      const emailExists = await userModel.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(409).json({ message: "Email đã được sử dụng" });
      }
      user.email = email;
    }

    // 3. Xử lý Avatar (NẾU CÓ FILE MỚI)
    const oldAvatarId = user.avatarId; // Lưu lại ID avatar cũ

    if (file) {
      // Chuyển buffer sang Data URI
      const dataURI = bufferToDataURI(file);

      // Upload ảnh mới lên Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "avatars",
        transformation: [{ width: 150, height: 150, crop: "fill" }],
      });

      // Cập nhật URL và ID avatar mới
      user.avatarUrl = result.secure_url;
      user.avatarId = result.public_id;

      // Xóa avatar cũ (nếu có)
      if (oldAvatarId) {
        try {
          await cloudinary.uploader.destroy(oldAvatarId);
        } catch (deleteError) {
          // Ghi log lỗi nhưng không dừng tiến trình cập nhật
          console.error("Lỗi khi xóa avatar cũ trên Cloudinary:", deleteError);
        }
      }
    }

    // 4. Cập nhật các trường khác
    if (displayName) user.displayName = displayName;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (bio !== undefined) user.bio = bio;
    if (dob !== undefined) {
        // Nếu dob là chuỗi rỗng (falsy) thì set là null
        // Nếu dob có giá trị, thì mới tạo new Date()
        user.dob = dob ? new Date(dob) : null;
    }
    if (address !== undefined) user.address = address;
    if (occupation !== undefined) user.occupation = occupation;
    if (learningGoal !== undefined) user.learningGoal = learningGoal;

    // 5. Cập nhật mật khẩu nếu có
    if (password) {
      user.hashedPassword = await bcrypt.hash(password, 10);
    }

    await user.save();

    // Trả về thông tin user đã cập nhật
    const updatedUser = await userModel
      .findById(id)
      .select("username displayName email avatarUrl phone role bio createdAt dob address occupation learningGoal");

    return res.status(200).json({
      message: "Cập nhật người dùng thành công",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    // Xử lý lỗi nếu upload thất bại (nếu cần)
    // (Nếu upload lỗi, nó sẽ bị bắt bởi catch block này)
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Xóa người dùng
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Kiểm tra user tồn tại và lấy thông tin avatarId
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // 2. XỬ LÝ XÓA AVATAR TRÊN CLOUDINARY
    if (user.avatarId) {
      try {
        // Sử dụng uploader.destroy để xóa file
        await cloudinary.uploader.destroy(user.avatarId);
        console.log(`Đã xóa avatar trên Cloudinary: ${user.avatarId}`);
      } catch (cloudError) {
        // Ghi log lỗi xóa Cloudinary nhưng KHÔNG trả về 500
        // vì việc xóa user khỏi DB vẫn quan trọng hơn
        console.error("Lỗi khi xóa avatar Cloudinary:", cloudError);
      }
    }

    // 3. Xóa tất cả session của user
    await sessionModel.deleteMany({ userId: id });

    // 4. Xóa user khỏi DB
    await userModel.findByIdAndDelete(id);

    return res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export {
  loginUser,
  registerUser,
  logoutUser,
  refreshToken,
  userList,
  getUser,
  updateUser,
  deleteUser,
  addUser,
};
