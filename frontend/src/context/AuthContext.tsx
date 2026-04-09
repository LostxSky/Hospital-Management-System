import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, UserRole } from '../types';
import { authAPI, patientAPI } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: number;
  role: string; // 'Patient' | 'Doctor' | 'Admin' from backend
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
  age?: number;
  gender?: string;
  contact?: string;
  address?: string;
  blood_group?: string;
  specialization?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('shms_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const token = res.data.token;

    const decoded = jwtDecode<JwtPayload>(token);
    const role: UserRole = decoded.role.toLowerCase() as UserRole;

    localStorage.setItem('shms_token', token);

    let name = email;
    try {
      if (role === 'patient') {
        const profileRes = await patientAPI.getMyProfile();
        name = profileRes.data.data?.name || email;
      }
    } catch {
      name = email;
    }

    const loggedInUser: AuthUser = {
      user_id: decoded.id,
      role,
      email,
      name,
    };

    localStorage.setItem('shms_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const register = async (data: RegisterData) => {
    const backendRole = data.role === 'patient' ? 'Patient' : 'Doctor';
    await authAPI.register({
      email: data.email,
      password: data.password,
      role: backendRole,
      name: data.name,
      age: data.age,
      gender: data.gender,
      contact: data.contact,
      address: data.address,
      blood_group: data.blood_group,
      specialization: data.specialization,
    });
  };

  const logout = () => {
    localStorage.removeItem('shms_user');
    localStorage.removeItem('shms_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

/*
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, UserRole } from '../types';

interface JwtPayload {
  id: number;
  role: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
  age?: number;
  gender?: string;
  contact?: string;
  address?: string;
  blood_group?: string;
  specialization?: string;
}

// ── Mock users (remove when backend is ready) ──
const MOCK_USERS: AuthUser[] = [
  { user_id: 1, role: 'patient', email: 'patient@test.com', name: 'Priyanshu Roy' },
  { user_id: 2, role: 'doctor',  email: 'doctor@test.com',  name: 'Dr. Anjali Sharma' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('shms_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, _password: string) => {
    // ── TODO: swap this block with real API when backend is running ──
    // const res = await authAPI.login({ email, password });
    // const token = res.data.token;
    // const decoded = jwtDecode<JwtPayload>(token);
    // const role: UserRole = decoded.role.toLowerCase() as UserRole;
    // const loggedInUser: AuthUser = { user_id: decoded.id, role, email, name: email };
    // localStorage.setItem('shms_token', token);
    // localStorage.setItem('shms_user', JSON.stringify(loggedInUser));
    // setUser(loggedInUser);

    const found = MOCK_USERS.find(u => u.email === email);
    if (!found) throw new Error('Invalid credentials');
    localStorage.setItem('shms_user', JSON.stringify(found));
    setUser(found);
  };

  const register = async (_data: RegisterData) => {
    // ── TODO: swap with real API when backend is running ──
    // const backendRole = data.role === 'patient' ? 'Patient' : 'Doctor';
    // await authAPI.register({ ...data, role: backendRole });
    return Promise.resolve();
  };

  const logout = () => {
    localStorage.removeItem('shms_user');
    localStorage.removeItem('shms_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
*/