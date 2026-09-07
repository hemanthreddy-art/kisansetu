'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type DemoRole = 'FARMER' | 'BUYER' | 'TRANSPORTER';

export interface DemoUser {
  id: string;
  role: DemoRole;
  fullName: string;
  organization?: string;
  phone: string;
  email: string;
  location: string;
  district: string;
  portalPath: string;
  isDemo: boolean;
}

export const DEMO_USERS: Record<DemoRole, DemoUser> = {
  FARMER: {
    id: 'farmer-demo-ramesh',
    role: 'FARMER',
    fullName: 'Ramesh Patil (रमेश पाटील)',
    organization: 'Sahyadri Farmer Producer Co.',
    phone: '+919822012345',
    email: 'ramesh.patil@demo.kisansetu.in',
    district: 'Nashik',
    location: 'Niphad, Nashik',
    portalPath: '/farmer',
    isDemo: true,
  },
  BUYER: {
    id: 'buyer-demo-abcfoods',
    role: 'BUYER',
    fullName: 'Anand Deshmukh (आनंद देशमुख)',
    organization: 'ABC Foods Pvt Ltd [Prototype Demo]',
    phone: '+919822110001',
    email: 'procurement@abcfoods.demo.kisansetu.in',
    district: 'Pune',
    location: 'Pune, Maharashtra',
    portalPath: '/buyer',
    isDemo: true,
  },
  TRANSPORTER: {
    id: 'transporter-demo-sahyadri',
    role: 'TRANSPORTER',
    fullName: 'Sanjay Deshmukh (संजय देशमुख)',
    organization: 'Sahyadri Agri Logistics [Demo]',
    phone: '+919822330001',
    email: 'dispatch@sahyadrilogistics.demo.kisansetu.in',
    district: 'Nashik',
    location: 'Nashik, Maharashtra',
    portalPath: '/transporter',
    isDemo: true,
  },
};

interface AuthContextType {
  user: DemoUser | null;
  role: DemoRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: DemoRole, customPhone?: string) => void;
  logout: () => void;
  switchRole: (newRole: DemoRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('kisansetu_demo_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr) as DemoUser;
        if (parsed && parsed.role && DEMO_USERS[parsed.role]) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved demo user:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (targetRole: DemoRole, customPhone?: string) => {
    const defaultProfile = DEMO_USERS[targetRole];
    const loggedUser: DemoUser = {
      ...defaultProfile,
      phone: customPhone && customPhone.trim().length > 0 ? customPhone.trim() : defaultProfile.phone,
    };
    setUser(loggedUser);
    try {
      localStorage.setItem('kisansetu_demo_user', JSON.stringify(loggedUser));
    } catch (e) {
      console.warn('Failed to save demo user to localStorage:', e);
    }
    router.push(loggedUser.portalPath);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('kisansetu_demo_user');
    } catch (e) {
      console.warn('Failed to remove demo user from localStorage:', e);
    }
    router.push('/login');
  };

  const switchRole = (newRole: DemoRole) => {
    const targetUser = DEMO_USERS[newRole];
    setUser(targetUser);
    try {
      localStorage.setItem('kisansetu_demo_user', JSON.stringify(targetUser));
    } catch (e) {
      console.warn('Failed to update demo user in localStorage:', e);
    }
    router.push(targetUser.portalPath);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
