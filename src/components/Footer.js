const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black py-10 border-t border-gray-800">
      <div className="max-w-4xl mx-auto px-4 text-center">
        
        {/* Brand Section */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="./logo_xpensify.jpg"
              alt="Xpensify Logo"
              className="h-12 w-12 rounded-full shadow-lg"
            />
            <h2 className="text-3xl font-bold text-white">
              Xpensify
            </h2>
          </div>
          <p className="text-xl text-gray-300">
            Know Your Spend, Grow Your Savings
          </p>
        </div>

        {/* Divider */}
        <div className="w-24 h-1 bg-gradient-to-r from-[#0B666A] to-emerald-500 mx-auto mb-8 rounded-full"></div>

        {/* Copyright */}
        <div className="space-y-4">
          <p className="text-gray-400 text-lg">
            © {new Date().getFullYear()} Xpensify. All rights reserved.
          </p>
          <p className="text-gray-500">
            Made with ❤️ for financial freedom everywhere
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;