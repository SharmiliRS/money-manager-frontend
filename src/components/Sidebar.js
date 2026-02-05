import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  Wallet,
  ShoppingCart,
  History,
  LogOut,
  User,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/desktop and handle sidebar state
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile) {
        setIsSidebarOpen(false); // Close sidebar on mobile by default
      } else {
        const saved = localStorage.getItem('sidebarOpen');
        setIsSidebarOpen(saved !== null ? JSON.parse(saved) : true);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [setIsSidebarOpen]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      // Save the current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore the scroll position when sidebar closes
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      };
    }
  }, [isMobile, isSidebarOpen]);

  const menuItems = [
    { icon: <Home size={22} />, text: "Dashboard", path: "/dashboard" },
    { icon: <Wallet size={22} />, text: "Income", path: "/income" },
    { icon: <ShoppingCart size={22} />, text: "Expenses", path: "/expenses" },
    { icon: <History size={22} />, text: "Transactions", path: "/transactions" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  // Check if menu item is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out flex flex-col ${
          isSidebarOpen
            ? "w-72 translate-x-0"
            : isMobile
              ? "-translate-x-full"
              : "w-20 -translate-x-0"
        }`}
        style={{
          maxWidth: isSidebarOpen ? "90vw" : "5rem",
          minWidth: isSidebarOpen ? "18rem" : "5rem",
        }}
      >
        <div
          className={`flex items-center justify-between border-b py-6 border-gray-200 min-h-[70px] ${
            isSidebarOpen ? "px-4" : "px-2"
          }`}
        >
          {/* Logo - Always visible and same size */}
          <div className="flex items-center gap-3">
            <img
              src="./logo_xpensify.jpg"
              alt="Xpensify Logo"
              className="h-10 w-10 rounded-full shadow flex-shrink-0"
            />

            {/* Text section - Only shows when sidebar is open */}
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">
                  Xpensify
                </h2>
                <p className="text-xs text-gray-500 -mt-1 whitespace-nowrap">
                  Financial Dashboard
                </p>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          {!isMobile && (
            <button
              onClick={() => {
                const newState = !isSidebarOpen;
                setIsSidebarOpen(newState);
                localStorage.setItem('sidebarOpen', JSON.stringify(newState));
              }}
              className={`flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ${
                isSidebarOpen ? "w-8 h-8" : "w-7 h-7"
              }`}
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? (
                <ChevronLeft size={18} className="text-gray-600" />
              ) : (
                <ChevronRight size={16} className="text-gray-600" />
              )}
            </button>
          )}

          {/* Close Button inside Sidebar for Mobile */}
          {isMobile && isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 w-8 h-8 lg:hidden"
              aria-label="Close menu"
            >
              <X size={18} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* User Profile - Only show when sidebar is open */}
        {isSidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0B666A] to-emerald-500 rounded-full flex items-center justify-center shadow">
                <User size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-sm">
                  {localStorage.getItem("userEmail")?.split("@")[0] || "Welcome"}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {localStorage.getItem("userEmail") || "user@example.com"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items with Scroll */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => isMobile && setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-[#0B666A]/10 to-emerald-50 text-[#0B666A] border-l-4 border-[#0B666A]"
                    : "text-gray-700 hover:bg-gray-100 hover:text-[#0B666A]"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 flex items-center justify-center ${
                    isActive(item.path) ? "text-[#0B666A]" : "text-gray-500"
                  }`}
                >
                  {item.icon}
                </div>
                {isSidebarOpen && (
                  <span className="font-medium text-sm truncate">
                    {item.text}
                  </span>
                )}
                {isSidebarOpen && isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-[#0B666A] rounded-full"></div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isSidebarOpen ? "justify-start gap-3 px-4" : "justify-center"
            } py-3 rounded-lg bg-gradient-to-r from-black to-gray-900 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-300 group`}
          >
            <LogOut size={20} />
            {isSidebarOpen && (
              <span className="font-semibold text-sm">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Hamburger Button */}
      {isMobile && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed top-6 left-6 z-[9999] w-12 h-12 bg-gradient-to-r from-[#0B666A] to-emerald-600 rounded-full shadow-xl flex items-center justify-center text-white hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open menu"
          style={{ 
            willChange: 'transform',
            transform: 'translateZ(0)' // Hardware acceleration for smoothness
          }}
        >
          <Menu size={24} />
        </button>
      )}
    </>
  );
};

export default Sidebar;