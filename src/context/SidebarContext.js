import { createContext, useState, useEffect, useContext } from "react";

// Create Context
const SidebarContext = createContext();

// Custom Hook to use the Sidebar Context
export const useSidebar = () => useContext(SidebarContext);

// Provider Component
export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 1024;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Save to localStorage whenever sidebar state changes
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};