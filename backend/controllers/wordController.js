import wordModel from '../models/wordModel.js';
import cloudinary from '../libs/cloudinary.js';
import streamifier from 'streamifier';

// --- Helper Function để upload buffer lên Cloudinary ---
const uploadToCloudinary = async (fileBuffer, resourceType = 'auto', folder = 'words', retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: resourceType,
                        folder: folder,
                        // TĂNG TIMEOUT LÊN 2 PHÚT (120000ms)
                        timeout: 120000 
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve({
                                url: result.secure_url,
                                public_id: result.public_id
                            });
                        }
                    }
                );
                streamifier.createReadStream(fileBuffer).pipe(uploadStream);
            });
        } catch (error) {
            // Kiểm tra lỗi: ECONNRESET (rớt mạng) HOẶC Timeout (quá hạn)
            const isNetworkError = error.code === 'ECONNRESET' || 
                                   error.message.includes('ECONNRESET') || 
                                   error.message.includes('Timeout') || 
                                   error.http_code === 499;

            if (isNetworkError && i < retries - 1) {
                console.log(`⚠️ Lỗi upload (Lần ${i + 1}/${retries}): ${error.message}. Đang thử lại...`);
                // Đợi 2 giây trước khi thử lại (tăng thời gian đợi lên)
                await new Promise(res => setTimeout(res, 2000)); 
            } else {
                // Nếu hết lượt thử hoặc lỗi khác (như sai định dạng file) thì ném lỗi ra
                throw error; 
            }
        }
    }
};

// Lấy tất cả từ vựng với phân trang
export const wordList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const topic = req.query.topic; // Lọc theo tên danh mục
    const search = req.query.search; // Lọc theo từ vựng/nghĩa
    
    // Xử lý trường hợp không phân trang (dùng cho Flashcard)
    const noPaginate = req.query.limit === 'all';
    if (noPaginate) {
      limit = 0; // Đặt limit = 0 để Mongoose hiểu là không giới hạn
    }
    
    const skip = (page - 1) * limit;

    // --- TẠO QUERY ĐỘNG ---
    const query = { owner: null };
    
    if (topic && topic !== 'all') {
      // Lọc theo tên danh mục (đúng với 'wordModel' của bạn)
      query.topic = topic; 
    }
    
    if (search) {
      // Tìm kiếm không phân biệt hoa thường
      query.word = { $regex: search, $options: 'i' };
    }
    // ------------------------

    // Đếm tổng số documents (DÙNG QUERY)
    const total = await wordModel.countDocuments(query);
    
    // Lấy data (DÙNG QUERY)
    const wordsQuery = wordModel
      .find(query)
      .sort({ createdAt: -1 });

    // Chỉ áp dụng skip/limit nếu CÓ phân trang
    if (!noPaginate) {
      wordsQuery.skip(skip).limit(limit);
    }
    
    const words = await wordsQuery;
    
    const totalPages = noPaginate ? 1 : Math.ceil(total / limit);
    
    // Trả về kết quả
    res.json({
      success: true,
      data: words,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: noPaginate ? total : limit,
        hasNextPage: !noPaginate && page < totalPages,
        hasPrevPage: !noPaginate && page > 1
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
    const { count } = req.body;
    // Log để kiểm tra
    console.log(`Bắt đầu xử lý ${count} từ...`);

    if (!count || count <= 0) {
      return res.status(400).json({ success: false, error: "Dữ liệu không hợp lệ" });
    }

    const wordsToCreate = [];
    const filesByFieldName = {};
    if (req.files) {
      for (const file of req.files) {
        filesByFieldName[file.fieldname] = file;
      }
    }

    // Xử lý tuần tự từng từ
    for (let i = 0; i < count; i++) {
      const word = req.body[`word_${i}`];
      const pronunciation = req.body[`pronunciation_${i}`];
      const translation = req.body[`translation_${i}`];
      const example = req.body[`example_${i}`];
      const topic = req.body[`topic_${i}`];

      const imageFile = filesByFieldName[`image_${i}`];
      const audioFile = filesByFieldName[`audio_${i}`];

      if (!word || !translation || !topic || !imageFile || !audioFile) {
        return res.status(400).json({ 
            success: false, 
            error: `Từ thứ ${i + 1} (${word || '...'}) thiếu thông tin hoặc file.` 
        });
      }

      try {
          console.log(`--> Đang upload file cho từ: "${word}"...`);
          
          // Upload Ảnh
          const imgRes = await uploadToCloudinary(imageFile.buffer, 'image');
          
          // Upload Audio
          const audRes = await uploadToCloudinary(audioFile.buffer, 'video');

          wordsToCreate.push({
              word,
              pronunciation: pronunciation || "",
              translation,
              example: example || "",
              topic,
              image: imgRes.url,
              imagePublicId: imgRes.public_id,
              audio: audRes.url,
              audioPublicId: audRes.public_id
          });

          console.log(`✅ Xong từ: "${word}"`);

      } catch (uploadErr) {
          console.error(`❌ Lỗi upload tại từ: ${word}`, uploadErr);
          // Trả về lỗi chi tiết hơn
          return res.status(500).json({ 
              success: false, 
              error: `Upload thất bại ở từ "${word}": ${uploadErr.message}. Hãy kiểm tra mạng và thử lại.` 
          });
      }
    }

    if (wordsToCreate.length > 0) {
      const savedWords = await wordModel.insertMany(wordsToCreate);
      res.status(201).json({
        success: true,
        message: `Đã thêm thành công ${savedWords.length} từ vựng!`,
        data: savedWords
      });
    }

  } catch (err) {
    console.error("Lỗi chung:", err);
    res.status(500).json({ success: false, error: "Lỗi server: " + err.message });
  }
};

// --- CÁC HÀM MỚI CHO USER ---

// 1. Lấy từ vựng CỦA RIÊNG USER
export const getUserWords = async (req, res) => {
    try {
        const userId = req.user._id;
        const { topic } = req.query;
        
        const query = { owner: userId };
        
        // Nếu có lọc theo topic
        if (topic && topic !== 'all') {
            query.topic = topic;
        }

        const words = await wordModel.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: words });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// 2. User tạo từ vựng mới
export const createUserWord = async (req, res) => {
    try {
        const { word, translation, topic, example, pronunciation } = req.body;
        const userId = req.user._id;

        // Validate cơ bản
        if (!word || !translation || !topic) {
            return res.status(400).json({ message: "Thiếu thông tin bắt buộc (Từ, Nghĩa, Chủ đề)" });
        }

        // User tạo nhanh thường không có file media ngay
        // Nếu muốn hỗ trợ upload, cần dùng multer và logic giống wordAdd
        
        const newWord = new wordModel({
            word,
            translation,
            topic,
            example: example || "",
            pronunciation: pronunciation || "",
            owner: userId,
            // Các trường media để trống
            image: "", imagePublicId: "", audio: "", audioPublicId: ""
        });

        await newWord.save();
        res.status(201).json({ success: true, data: newWord });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};