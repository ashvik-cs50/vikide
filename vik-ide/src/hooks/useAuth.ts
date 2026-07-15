import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'https://vikide-api.vikco.workers.dev';

const STORAGE_KEY_TOKEN = 'vik_token';
const STORAGE_KEY_USER = 'vik_user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEY_USER);
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
      setUser(data.user);
      return data;
    },
    []
  );

  const loginAnon = useCallback(async () => {
    const res = await fetch(`${API_BASE}/auth/anonymous`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Anonymous login failed');
    const data = await res.json();
    localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    setUser(null);
  }, []);

  const token = localStorage.getItem(STORAGE_KEY_TOKEN);

  return { user, loading, token, login, register, loginAnon, logout };
}
