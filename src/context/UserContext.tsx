import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';


interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (name: string, email: string, phone: string) => void;
  logout: () => void;
  addWinnings: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('arham_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (name: string, email: string, phone: string) => {
    const newUser: User = { 
      id: Date.now().toString(),
      name, 
      email, 
      phone, 
      walletBalance: 0,
      tier: 'silver',
      points: 450, // Welcome points
      joinedDate: new Date().toISOString()
    };
    setUser(newUser);
    localStorage.setItem('arham_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('arham_user');
  };

  const addWinnings = (amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, walletBalance: prev.walletBalance + amount };
      localStorage.setItem('arham_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn: !!user, login, logout, addWinnings }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
