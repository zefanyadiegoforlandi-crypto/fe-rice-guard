import api from '@/lib/api';

export const authAPI = {
  login: (data) =>
    api.post('/auth/login', data),

  register: (data) =>
    api.post('/auth/register', data),

  getMe: () =>
    api.get('/auth/me'),

  updateName: (name) =>
    api.put('/auth/update-name', { name }),

  changePassword: (newPassword) =>
    api.put('/auth/change-password', {
      new_password: newPassword,
    }),
};
