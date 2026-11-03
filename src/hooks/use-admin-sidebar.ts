"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface AdminSidebarState {
  isOpenMobile: boolean;
  isCollapsedDesktop: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleCollapsedDesktop: () => void;
}

export const AdminSidebarContext = createContext<AdminSidebarState>({
  isOpenMobile: false,
  isCollapsedDesktop: false,
  setOpenMobile: () => undefined,
  toggleCollapsedDesktop: () => undefined,
});

export function useAdminSidebarState(): AdminSidebarState {
  const [isOpenMobile, setOpenMobile] = useState(false);
  const [isCollapsedDesktop, setCollapsedDesktop] = useState(false);

  const toggleCollapsedDesktop = useCallback(() => {
    setCollapsedDesktop((prev) => !prev);
  }, []);

  return {
    isOpenMobile,
    isCollapsedDesktop,
    setOpenMobile,
    toggleCollapsedDesktop,
  };
}

export function useAdminSidebar() {
  return useContext(AdminSidebarContext);
}

