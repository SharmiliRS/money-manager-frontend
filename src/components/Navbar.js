import { useState } from "react";
import { Menu, X, ChevronRight, Sparkles } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 md:h-20 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <img
                src="./logo_xpensify.jpg"
                alt="Xpensify Logo"
                className="h-10 w-10 md:h-12 md:w-12 rounded-full shadow-lg group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -top-1 -right-1">
                <div className="w-4 h-4 bg-gradient-to-r from-[#0B666A] to-emerald-400 rounded-full flex items-center justify-center">
                  <Sparkles size={10} className="text-white" />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
                Xpensify
              </span>
             
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Features Link with Hover Effect */}
            <a
              href="#features"
              className="group relative text-gray-700 font-medium text-lg no-underline transition-all duration-300 hover:text-[#0B666A]"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0B666A] to-emerald-500 group-hover:w-full transition-all duration-300"></span>
            </a>

            {/* Login Button - More Professional */}
            <a
              href="/login"
              className="group px-6 py-2.5 rounded-xl text-gray-800 font-medium border border-gray-300 
                         hover:border-[#0B666A] hover:text-[#0B666A] transition-all duration-300 
                         hover:shadow-sm flex items-center gap-2 no-underline"
            >
              <span>Login</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Get Started Button - Enhanced */}
            <a
              href="/register"
              className="group px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0B666A] to-emerald-600 text-white font-medium
                         hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 
                         flex items-center gap-2 no-underline"
            >
              <span>Get Started</span>
              <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-white border-t border-gray-100 ${
            open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 space-y-1">
            {/* Features Link */}
            <a
              href="#features"
              className="flex items-center justify-between px-6 py-4 text-gray-800 font-medium no-underline hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <span>Features</span>
              <ChevronRight size={18} />
            </a>

            {/* Login Button */}
            <a
              href="/login"
              className="flex items-center justify-between px-6 py-4 text-gray-800 font-medium no-underline hover:bg-gray-50 border-t border-gray-100"
              onClick={() => setOpen(false)}
            >
              <span>Login</span>
              <ChevronRight size={18} />
            </a>

            {/* Get Started Button */}
            <a
              href="/register"
              className="mx-6 my-4 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0B666A] to-emerald-600 text-white font-medium shadow no-underline text-center flex items-center justify-center gap-2"
              onClick={() => setOpen(false)}
            >
              <span>Get Started</span>
              <Sparkles size={16} />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;