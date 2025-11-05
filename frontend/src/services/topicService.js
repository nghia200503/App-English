import api from "../libs/axios";

export const topicService = {
    // Lấy tất cả topics với phân trang
    getAllTopics: async (page = 1, limit = 5) => {
        const res = await api.get('/topics/list', {
            params: { page, limit }
        });
        return res.data; // Trả về { success, data, pagination }
    },

    // Lấy tất cả topics để hiển thị dropdown
    getAllTopicsDropdown: async () => {
        const res = await api.get('/topics/topicdropdown');
        return res.data; 
    },

    // Lấy topic theo ID
    getTopicById: async (id) => {
        const res = await api.get(`/topics/${id}`);
        return res.data;
    },

    // Thêm topic mới
    addTopic: async (nameTopic, meaning, pronunciation, imageFile) => {
        const formData = new FormData();
        formData.append('nameTopic', nameTopic);
        formData.append('meaning', meaning);
        formData.append('pronunciation', pronunciation);
        formData.append('image', imageFile);

        const res = await api.post('/topics/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    }, 

    // Cập nhật topic
    updateTopic: async (id, nameTopic, meaning, pronunciation, imageFile) => {
        const formData = new FormData();
        formData.append('nameTopic', nameTopic);
        formData.append('meaning', meaning);
        formData.append('pronunciation', pronunciation);
        if (imageFile) {
        formData.append('image', imageFile);
        }

        const res = await api.put(`/topics/update/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
        });
        return res.data;
    },

    // Xoá topic
    deleteTopic: async (id) => {
        const res = await api.delete(`/topics/delete/${id}`);
        return res.data;
    }
};