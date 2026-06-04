import api from '@/lib/api';

export const detectionAPI = {
  scan: (file, imageName) => {
    const formData = new FormData();
    formData.append('file', file);
    if (imageName) {
      formData.append('image_name', imageName);
    }
    return api.post('/detection/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getHistory: (params = {}) =>
    api.get('/detection/history', { params }),

  getStats: () =>
    api.get('/detection/stats'),

  renameDetection: (id, imageName) =>
    api.patch(`/detection/history/${id}/rename`, { image_name: imageName }),

  deleteOne: (id) =>
    api.delete(`/detection/history/${id}`),

  deleteAll: () =>
    api.delete('/detection/history'),
};
