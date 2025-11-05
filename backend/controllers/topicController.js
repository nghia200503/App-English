import topicModel from "../models/topicModel.js";
import cloudinary from "../libs/cloudinary.js";

// Lấy tất cả chủ đề với phân trang
export const topicList = async (req, res) => {
  try {
    // Lấy page và limit từ query params, mặc định page=1, limit=5
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    // Tính toán skip
    const skip = (page - 1) * limit;

    // Đếm tổng số documents
    const total = await topicModel.countDocuments();

    // Lấy data với pagination
    const topics = await topicModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sắp xếp mới nhất trước

    // Tính tổng số trang
    const totalPages = Math.ceil(total / limit);

    // Trả về kết quả với metadata
    res.json({
      success: true,
      data: topics,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Lỗi server khi lấy danh sách chủ đề:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi lấy tất cả chủ đề",
    });
  }
};

// Hàm helper để chuyển buffer sang Data URI
const bufferToDataURI = (file) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  return "data:" + file.mimetype + ";base64," + b64;
};

// Lấy 1 chủ đề theo ID
export const topicGetById = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await topicModel.findById(id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chủ đề",
      });
    }

    res.json({
      success: true,
      data: topic,
    });
  } catch (err) {
    console.error("Lỗi khi lấy chủ đề:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi lấy chủ đề",
    });
  }
};

// Thêm chủ đề mới
export const topicAdd = async (req, res) => {
  try {
    const { nameTopic, meaning, pronunciation } = req.body;
    const file = req.file;

    // Kiểm tra dữ liệu
    if (!nameTopic || !meaning || !pronunciation || !file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin",
      });
    }

    // Chuyển buffer sang Data URI
    const dataURI = bufferToDataURI(file);

    // ---- THAY ĐỔI TẠI ĐÂY ----
    // 1. Tạo tên thư mục an toàn từ nameTopic
    // Ví dụ: "Family & Friends" -> "family_friends"
    const safeFolderName = nameTopic
      .toLowerCase()
      .replace(/\s+/g, "_") // Thay khoảng trắng bằng gạch dưới
      .replace(/[^a-z0-9_]/g, ""); // Loại bỏ ký tự đặc biệt

    // 2. Upload lên Cloudinary với thư mục động
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `topics/${safeFolderName}`, // Đường dẫn động
    });
    // -------------------------

    // Tạo topic mới trong DB
    const newTopic = new topicModel({
      nameTopic: nameTopic,
      meaning: meaning,
      pronunciation: pronunciation,
      image: result.secure_url,
    });

    await newTopic.save();

    return res.status(201).json({
      success: true,
      data: newTopic,
      message: "Thêm chủ đề thành công",
    });
  } catch (error) {
    console.error("Lỗi khi thêm chủ đề:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi thêm chủ đề",
    });
  }
};

// Cập nhật chủ đề
export const topicUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { nameTopic, meaning, pronunciation } = req.body;
    const file = req.file;

    const existingTopic = await topicModel.findById(id);
    if (!existingTopic) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chủ đề",
      });
    }

    const updateData = {
      nameTopic: nameTopic || existingTopic.nameTopic,
      meaning: meaning || existingTopic.meaning,
      pronunciation: pronunciation || existingTopic.pronunciation,
    };

    // Nếu có file ảnh mới
    if (file) {
      // Xóa ảnh cũ (hàm này của bạn đã xử lý đúng publicId)
      await deleteImageFromCloudinary(existingTopic.image);

      // ---- THAY ĐỔI TẠI ĐÂY ----
      // 1. Dùng tên chủ đề SẼ ĐƯỢC CẬP NHẬT (có thể là tên mới hoặc tên cũ)
      //    để làm tên thư mục
      const folderName = updateData.nameTopic;

      // 2. Tạo tên thư mục an toàn
      const safeFolderName = folderName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");

      // 3. Upload ảnh mới vào thư mục động
      const dataURI = bufferToDataURI(file);
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: `topics/${safeFolderName}`, // Đường dẫn động
      });
      updateData.image = result.secure_url;
      // -------------------------
    }

    const updatedTopic = await topicModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: updatedTopic,
      message: "Cập nhật chủ đề thành công",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật chủ đề:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật chủ đề",
    });
  }
};

// Hàm helper để xóa ảnh trên Cloudinary
const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    // URL format: https://res.cloudinary.com/.../upload/v123/topics/animal/file.jpg
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    // Kiểm tra xem 'upload' có tồn tại không và có ít nhất 1 phần tử sau version (v123)
    if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
      // Lấy tất cả các phần tử sau version (v123)
      // Ví dụ: ['topics', 'animal', 'file.jpg']
      const pathParts = urlParts.slice(uploadIndex + 2);

      // Nối chúng lại để tạo đường dẫn đầy đủ
      // Ví dụ: 'topics/animal/file.jpg'
      const fullPathWithExt = pathParts.join("/");

      // Xóa phần mở rộng file (ví dụ: .jpg, .png)
      // Cách này an toàn ngay cả khi tên file có dấu chấm (vd: file.v2.jpg)
      const publicId = fullPathWithExt.split(".").slice(0, -1).join(".");
      // Ví dụ: 'topics/animal/file'

      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        console.log(`Đã xóa ảnh: ${publicId}`);
      } else {
        console.warn("Không thể trích xuất publicId từ URL:", imageUrl);
      }
    }
  } catch (error) {
    console.error("Lỗi khi xóa ảnh trên Cloudinary:", error);
  }
};

// Hàm helper để XÓA TOÀN BỘ THƯ MỤC
const deleteTopicFolderFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    // Bước 1: Trích xuất publicId giống như hàm cũ
    // Ví dụ: 'topics/animal/file123'
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1 || urlParts.length <= uploadIndex + 2) {
      console.warn("URL Cloudinary không hợp lệ:", imageUrl);
      return;
    }

    const pathParts = urlParts.slice(uploadIndex + 2);
    const fullPathWithExt = pathParts.join("/");
    const publicId = fullPathWithExt.split(".").slice(0, -1).join(".");

    if (!publicId) {
      console.warn("Không thể trích xuất publicId từ URL:", imageUrl);
      return;
    }

    // Bước 2: Trích xuất đường dẫn thư mục (prefix) từ publicId
    // Ví dụ: 'topics/animal'
    const folderPath = publicId.split("/").slice(0, -1).join("/");

    if (!folderPath) {
      console.warn("Không thể trích xuất folderPath từ publicId:", publicId);
      return;
    }

    // Bước 3: Xóa tất cả tài nguyên (ảnh) trong thư mục đó
    console.log(`Đang xóa tất cả ảnh trong thư mục: ${folderPath}`);
    // "prefix" hoạt động như một "tìm kiếm tất cả file bắt đầu bằng..."
    await cloudinary.api.delete_resources_by_prefix(folderPath);

    // Bước 4: Xóa thư mục (nay đã rỗng)
    console.log(`Đang xóa thư mục: ${folderPath}`);
    await cloudinary.api.delete_folder(folderPath);

    console.log(`Đã xóa thành công thư mục và nội dung của: ${folderPath}`);
  } catch (error) {
    console.error("Lỗi khi xóa thư mục trên Cloudinary:", error);
  }
};

// Xóa chủ đề
export const topicDelete = async (req, res) => {
  try {
    const { id } = req.params;

    const topic = await topicModel.findById(id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chủ đề",
      });
    }

    // ---- THAY ĐỔI TẠI ĐÂY ----
    // Gọi hàm mới để xóa toàn bộ thư mục
    await deleteTopicFolderFromCloudinary(topic.image);
    // -------------------------

    // Xóa trong database
    await topicModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Xóa chủ đề thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa chủ đề:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xóa chủ đề",
    });
  }
};

// Lấy tất cả chủ đề KHÔNG PHÂN TRANG (dùng cho dropdown chọn chủ đề)
export const getAllTopics = async (req, res) => {
  try {
    // Bỏ hết phân trang, chỉ tìm và sắp xếp
    const allTopics = await topicModel.find().sort({ nameTopic: 1 }); // Sắp xếp theo tên A-Z cho dễ chọn

    res.json({
      success: true,
      data: allTopics,
    });
  } catch (err) {
    console.error("Lỗi khi lấy tất cả chủ đề:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi lấy tất cả chủ đề",
    });
  }
};
