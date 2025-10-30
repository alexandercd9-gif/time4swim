"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserRole = "admin" | "parents" | "club" | "coach" | "swimmer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountStatus?: string;
  isTrialAccount?: boolean;
  trialExpiresAt?: Date;
}

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
}>({
  user: defaultUser,
  setUser: () => {},
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde tu API /api/auth/me
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(defaultUser);
        }
      } catch (error) {
        console.log("Error loading user:", error);
        setUser(defaultUser);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}