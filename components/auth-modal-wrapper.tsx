"use client";

import { AuthModal } from "@/components/auth-modal";
import { useAuthModal } from "@/contexts/auth-modal-context";

export function AuthModalWrapper() {
  const { isOpen, closeModal, mode } = useAuthModal();

  return <AuthModal isOpen={isOpen} onClose={closeModal} initialMode={mode} />;
}


