import { useMemo } from 'react';

const useAuth = () => {
  const token = localStorage.getItem('token');
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth?mode=login';
  };

  return {
    user,
    token,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!token,
    logout,
  };
};

export default useAuth;
