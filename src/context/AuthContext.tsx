import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getUser, logout as apiLogout, postAuthRequest } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    getUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsAuthLoading(false));
  }, []);

  async function login(email: string, password: string): Promise<void> {
    await postAuthRequest('/api/auth/login', { email, password });
    const data = await getUser();
    setUser(data);
  }

  async function signup(name: string, email: string, password: string): Promise<void> {
    await postAuthRequest('/api/auth/create', { name, email, password });
    const data = await getUser();
    setUser(data);
  }

  async function logout(): Promise<void> {
    await apiLogout();
    setUser(null);
  }

  function clearUser(): void {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, login, signup, logout, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
