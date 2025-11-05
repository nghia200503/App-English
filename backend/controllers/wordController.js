import wordModel from '../models/wordModel.js';
import cloudinary from '../libs/cloudinary.js';
import streamifier from 'streamifier';

// --- Helper Function để upload buffer lên Cloudinary ---
const uploadToCloudinary = (fileBuffer, resourceType = 'auto', folder = 'words') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: resourceType,
                folder: folder
            },
            (error, result) => {
                if (error) {
                    reject(new Error(`Cloudinary upload error: ${error.message}`));
                } else {
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                }
            }
        );
        // Ghi buffer vào stream để upload
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

// Lấy tất cả từ vựng với phân trang
export const wordList = async (req, res) => {
  try {
    // Lấy page và limit từ query params, mặc định page=1, limit=5
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Tính toán skip
    const skip = (page - 1) * limit;
    
    // Đếm tổng số documents
    const total = await wordModel.countDocuments();
    
    // Lấy data với pagination
    const words = await wordModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sắp xếp mới nhất trước
    
    // Tính tổng số trang
    const totalPages = Math.ceil(total / limit);
    
    // Trả về kết quả với metadata
    res.json({
      success: true,
      data: words,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error("Lỗi server khi lấy danh sách từ vựng:", err);
    res.status(500).json({ 
      success: false,
      error: "Lỗi server khi lấy tất cả từ vựng" 
    });
  }
};

// Lấy 1 từ vựng theo ID
export const wordGetById = async (req, res) => {
  try {
    const { id } = req.params;
    const word = await wordModel.findById(id);
    
    if (!word) {
      return res.status(404).json({success: false, message: "Không tìm thấy từ vựng"});
    }
    
    res.json({success: true, data: word});
  } catch (err) {
    console.error("Lỗi khi lấy từ vựng:", err);
    res.status(500).json({success: false, error: "Lỗi server khi lấy từ vựng" });
  }
};

// Lấy từ vựng theo chủ đề
export const wordGetByTopic = async (req, res) => {
  try {
    const words = await wordModel.find({ topic: req.params.topicName });
    res.json(words);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi lấy từ vựng theo từ vựng" });
  }
};

// Thêm từ vựng mới
export const wordAdd = async (req, res) => {
  try {
    // 1. Lấy file từ req.files (do upload.fields)
    const imageFile = req.files?.image?.[0];
    const audioFile = req.files?.audio?.[0];

    // 2. Lấy dữ liệu text từ req.body
    const { word, pronunciation, translation, example, topic } = req.body;
    
    // 3. Kiểm tra file bắt buộc
    if (!imageFile) {
        return res.status(400).json({ error: "Thiếu file ảnh (image)" });
    }
    if (!audioFile) {
        return res.status(400).json({ error: "Thiếu file âm thanh (audio)" });
    }

    // 4. Upload đồng thời lên Cloudinary
    // Ghi chú: Cloudinary xử lý audio như là 'video'
    const [imageResult, audioResult] = await Promise.all([
        uploadToCloudinary(imageFile.buffer, 'image'),
        uploadToCloudinary(audioFile.buffer, 'video') 
    ]);

    // 5. Tạo đối tượng mới để lưu vào DB (bao gồm cả public_id)
    const newWord = new wordModel({
        word,
        pronunciation,
        translation,
        example,
        topic,
        image: imageResult.url,
        imagePublicId: imageResult.public_id,
        audio: audioResult.url,
        audioPublicId: audioResult.public_id
    });

    const savedWord = await newWord.save();
    res.status(201).json(savedWord);

  } catch (err) {
    console.error("Lỗi khi tạo từ vựng:", err);
    if (err.name === 'ValidationError') {
        res.status(400).json({ error: "Dữ liệu không hợp lệ", details: err.message });
    } else {
        res.status(500).json({ error: "Lỗi server khi upload file hoặc lưu DB" });
    }
  }
}

// Cập nhật từ vựng
export const wordUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body }; // Lấy dữ liệu text
        
        // 1. Lấy file (nếu có)
        const imageFile = req.files?.image?.[0];
        const audioFile = req.files?.audio?.[0];

        // 2. Lấy document cũ để biết public_id (để xóa file cũ)
        const oldWord = await wordModel.findById(id);
        if (!oldWord) {
            return res.status(404).json({ error: "Không tìm thấy từ vựng" });
        }

        const uploadPromises = [];
        
        // 3. Xử lý upload file mới (nếu có) và xóa file cũ
        if (imageFile) {
            uploadPromises.push(
                uploadToCloudinary(imageFile.buffer, 'image').then(result => {
                    updateData.image = result.url;
                    updateData.imagePublicId = result.public_id;
                    // Xóa ảnh cũ trên Cloudinary
                    cloudinary.uploader.destroy(oldWord.imagePublicId);
                })
            );
        }
        if (audioFile) {
            uploadPromises.push(
                uploadToCloudinary(audioFile.buffer, 'video').then(result => {
                    updateData.audio = result.url;
                    updateData.audioPublicId = result.public_id;
                    // Xóa audio cũ (resource_type là 'video')
                    cloudinary.uploader.destroy(oldWord.audioPublicId, { resource_type: 'video' });
                })
            );
        }
        
        // 4. Chờ tất cả upload (nếu có) hoàn tất
        await Promise.all(uploadPromises);

        // 5. Cập nhật vào DB
        const updatedWord = await wordModel.findByIdAndUpdate(
            id,
            updateData, // updateData chứa cả text và link file mới (nếu có)
            { new: true, runValidators: true } 
        );

        res.json(updatedWord);

    } catch (err) {
        console.error("Lỗi khi cập nhật từ vựng:", err);
        if (err.name === 'ValidationError') {
            res.status(400).json({ error: "Dữ liệu cập nhật không hợp lệ", details: err.message });
        } else {
            res.status(500).json({ error: "Lỗi server khi cập nhật" });
        }
    }
};

export const wordDelete = async (req, res) => {
  try {
    // 1. Tìm và xóa document khỏi DB
    const deletedWord = await wordModel.findByIdAndDelete(req.params.id);
    if (!deletedWord) {
      return res.status(404).json({ error: "Không tìm thấy từ vựng để xóa" });
    }

    // 2. [SỬA] Tạo mảng chứa các promise xóa file
    const deletePromises = [];

    // 3. [SỬA] Chỉ xóa nếu có public_id
    if (deletedWord.imagePublicId) {
        deletePromises.push(
            cloudinary.uploader.destroy(deletedWord.imagePublicId)
        );
    }
    if (deletedWord.audioPublicId) {
        deletePromises.push(
            cloudinary.uploader.destroy(deletedWord.audioPublicId, { resource_type: 'video' })
        );
    }

    // 4. [SỬA] Chờ xóa file (nếu có)
    await Promise.all(deletePromises);

    res.json({ 
      success: true, 
      message: "Xóa từ vựng thành công" 
    });

  } catch (err) {
    // Lỗi sẽ không còn xảy ra ở đây nữa
    console.error("Lỗi khi xóa từ vựng:", err);
    res.status(500).json({ 
      success: false, 
      error: "Lỗi server khi xóa từ vựng" 
    });
  }
};

export const wordAddBulk = async (req, res) => {
  try {
    // 1. Lấy tổng số từ được gửi lên
    const { count } = req.body;
    if (!count || count <= 0) {
      return res.status(400).json({ success: false, error: "Thiếu tham số 'count'" });
    }

    const wordsToCreate = [];
    const uploadPromises = [];
    
    // 2. Map các file đã upload để dễ truy cập bằng fieldname
    const filesByFieldName = {};
    if (req.files) {
      for (const file of req.files) {
        filesByFieldName[file.fieldname] = file;
      }
    }

    // 3. Lặp qua từng từ để xử lý
    for (let i = 0; i < count; i++) {
      // Lấy data text
      const word = req.body[`word_${i}`];
      const pronunciation = req.body[`pronunciation_${i}`];
      const translation = req.body[`translation_${i}`];
      const example = req.body[`example_${i}`];
      const topic = req.body[`topic_${i}`];

      // Lấy file
      const imageFile = filesByFieldName[`image_${i}`];
      const audioFile = filesByFieldName[`audio_${i}`];

      // Validate
      if (!word || !pronunciation || !translation || !example || !topic || !imageFile || !audioFile) {
        console.warn(`Bỏ qua từ ở vị trí ${i} do thiếu dữ liệu.`);
        // Bạn có thể chọn trả về lỗi 400 ở đây nếu muốn
        continue; 
      }

      // 4. Tạo promise cho việc upload và chuẩn bị data
      uploadPromises.push(
        // Upload 2 file song song
        Promise.all([
          uploadToCloudinary(imageFile.buffer, 'image'),
          uploadToCloudinary(audioFile.buffer, 'video') 
        ]).then(([imageResult, audioResult]) => {
          // Thêm đối tượng word hoàn chỉnh vào mảng
          wordsToCreate.push({
            word,
            pronunciation,
            translation,
            example,
            topic,
            image: imageResult.url,
            imagePublicId: imageResult.public_id,
            audio: audioResult.url,
            audioPublicId: audioResult.public_id
          });
        })
      );
    }

    // 5. Chờ tất cả upload hoàn tất
    await Promise.all(uploadPromises);

    // 6. Thêm tất cả từ vựng vào DB bằng insertMany
    if (wordsToCreate.length > 0) {
      const savedWords = await wordModel.insertMany(wordsToCreate);
      res.status(201).json({
        success: true,
        message: `Thêm thành công ${savedWords.length}/${count} từ vựng.`,
        data: savedWords
      });
    } else {
      res.status(400).json({ success: false, error: "Không có từ vựng hợp lệ nào được xử lý." });
    }

  } catch (err) {
    console.error("Lỗi khi thêm từ vựng hàng loạt:", err);
    res.status(500).json({ success: false, error: "Lỗi server khi thêm hàng loạt" });
  }
};