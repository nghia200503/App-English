import api from "../libs/axios";

export const wordService = {
    // Lấy tất cả words với phân trang
    getAllWords: async (page = 1, limit = 9, topic = 'all', search = '') => {
        const res = await api.get('/words', {
            params: { 
              page, 
              limit,
              topic,    // <-- Gửi topic
              search    // <-- Gửi search
            }
        });
        return res.data; // Trả về { success, data, pagination }
    },

    // Lấy word theo ID
    getWordById: async (id) => {
        const res = await api.get(`/words/${id}`);
        return res.data;
    },

    // Lấy words theo topic
    // getWordsByTopic: async (topicName) => {
    //     const res = await api.get(`/words/${topicName}`);
    //     return res.data;
    // },

    // Thêm word mới
    addWord: async (word, pronunciation, translation, example, topic, imageFile, audioFile) => {
        const formData = new FormData();
        formData.append('word', word);
        formData.append('pronunciation', pronunciation);
        formData.append('translation', translation);
        formData.append('example', example);
        formData.append('topic', topic);
        formData.append('image', imageFile);
        formData.append('audio', audioFile);

        const res = await api.post('/words/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    }, 

    // Thêm nhiều words
    addMultipleWords: async (wordsArray) => {
        const formData = new FormData();

        // 1. Thêm tổng số lượng từ
        formData.append('count', wordsArray.length);

        // 2. Lặp qua mảng các từ và thêm vào FormData với chỉ số (index)
        wordsArray.forEach((wordData, index) => {
            formData.append(`word_${index}`, wordData.word);
            formData.append(`pronunciation_${index}`, wordData.pronunciation);
            formData.append(`translation_${index}`, wordData.translation);
            formData.append(`example_${index}`, wordData.example);
            formData.append(`topic_${index}`, wordData.topic);
            formData.append(`image_${index}`, wordData.imageFile);
            formData.append(`audio_${index}`, wordData.audioFile);
        });

        const res = await api.post('/words/addbulk', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    },

    // Cập nhật word
    updateWord: async (id, word, pronunciation, translation, example, topic, imageFile, audioFile) => {
        const formData = new FormData();
        formData.append('word', word);
        formData.append('pronunciation', pronunciation);
        formData.append('translation', translation);
        formData.append('example', example);
        formData.append('topic', topic);
        if (imageFile) {
            formData.append('image', imageFile);
        }
        if (audioFile) {
            formData.append('audio', audioFile);
        }

        const res = await api.put(`/words/update/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    },

    // Xoá word
    deleteWord: async (id) => {
        const res = await api.delete(`/words/delete/${id}`);
        return res.data;
    }
};