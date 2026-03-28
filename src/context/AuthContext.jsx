import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, logout as apiLogout, postAuthRequest } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser().then(setUser).catch(() => setUser(null));
  }, []);

  async function login(email, password) {
    await postAuthRequest('/api/auth/login', { email, password });
    const data = await getUser();
    setUser(data);
  }

  async function signup(name, email, password) {
    await postAuthRequest('/api/auth/create', { name, email, password });
    const data = await getUser();
    setUser(data);
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  function clearUser() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
