// import multer from "multer";

// // Lưu file tạm thời vào bộ nhớ
// const storage = multer.memoryStorage();

// // Chỉ chấp nhận các file ảnh
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//         cb(null, true);
//     } else {
//         cb(new Error('File không hợp lệ, chỉ chấp nhận file ảnh'), false);
//     }
// };

// const upload = multer({ 
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
// });     
// export default upload;

import multer from "multer";

// Lưu file tạm thời vào bộ nhớ
const storage = multer.memoryStorage();

// Chỉ chấp nhận các file ảnh VÀ ÂM THANH
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
        cb(null, true);
    } else {
        cb(new Error('File không hợp lệ, chỉ chấp nhận file ảnh hoặc âm thanh'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Tăng giới hạn 10MB cho file audio
});   

export default upload;