import Cookies from 'js-cookie';

export const authUtils = {
  setToken: (token) => {
    Cookies.set('access_token', token, { expires: 7 });
  },

  getToken: () => {
    return Cookies.get('access_token');
  },

  removeToken: () => {
    Cookies.remove('access_token');
  },

  setUser: (user) => {
    Cookies.set('user', JSON.stringify(user), { expires: 7 });
  },

  getUser: () => {
    const user = Cookies.get('user');
    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    Cookies.remove('user');
  },

  isLoggedIn: () => {
    return !!Cookies.get('access_token');
  },

  logout: () => {
    Cookies.remove('access_token');
    Cookies.remove('user');
  },
};
