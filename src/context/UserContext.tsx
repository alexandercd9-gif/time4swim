"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserRole = "admin" | "parents" | "club" | "coach" | "swimmer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | string; // allow API to send roles like 'PARENT'
  profilePhoto?: string | null;
  // Trial fields (opcional)
  isTrialAccount?: boolean;
  accountStatus?: string;
  trialExpiresAt?: string | null;
}

// Usuario vacío por defecto
const defaultUser: User = {
  id: "",
  name: "",
  email: "",
  role: "parents",
};

const UserContext = createContext<{ 
  user: User; 
  setUser: (u: User) => void;
  loading: boolean;
  refetchUser: () => void;
}>({
  user: defaultUser,
  setUser: () => {},
  loading: true,
  refetchUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);
  const [loading, setLoading] = useState(true);

  const refetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
  const data = await response.json();
  setUser(data.user); // incluye campos de trial si vienen del backend
      } else {
        // 401 es esperado cuando no hay sesión, no es un error
        setUser(defaultUser);
      }
    } catch (error) {
      // Solo loggear errores que no sean de red/autenticación
      // console.log("Error loading user:", error);
      setUser(defaultUser);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, refetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}