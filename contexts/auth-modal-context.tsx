"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthModalContextType {
  isOpen: boolean;
  openModal: (mode?: "login" | "signup") => void;
  closeModal: () => void;
  mode: "login" | "signup";
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const openModal = (newMode?: "login" | "signup") => {
    if (newMode) {
      setMode(newMode);
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal, mode }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}








