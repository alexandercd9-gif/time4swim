"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "parents" | "club" | "coach" | "swimmer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const defaultUser: User = {
  id: "1",
  name: "Alexander Casaverde",
  email: "alexandercd9@gmail.com",
  role: "admin",
};

const UserContext = createContext<{ user: User; setUser: (u: User) => void }>({
  user: defaultUser,
  setUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
