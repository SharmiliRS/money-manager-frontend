import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User, Mail, Lock, ArrowRight, Sparkles, Check, X, Shield } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    specialChar: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordValidations(validations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required!");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    if (!Object.values(passwordValidations).every(Boolean)) {
      setError("Password does not meet all requirements!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("https://money-manager-backend-1-8wqn.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success("Registration successful! Redirecting to login...");
      setError("");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#F5F5F5] flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#0B666A]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-black/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src="./logo_xpensify.jpg"
                  alt="Xpensify Logo"
                  className="h-16 w-16 rounded-full shadow-lg"
                />
                <div className="absolute -top-1 -right-1">
                  <div className="w-5 h-5 bg-gradient-to-r from-[#0B666A] to-emerald-400 rounded-full flex items-center justify-center">
                    <Sparkles size={12} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
           
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B666A]/20 focus:border-[#0B666A] outline-none transition-all duration-300"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B666A]/20 focus:border-[#0B666A] outline-none transition-all duration-300"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B666A]/20 focus:border-[#0B666A] outline-none transition-all duration-300"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  onFocus={() => setShowPasswordRules(true)}
                  onBlur={() => setTimeout(() => setShowPasswordRules(false), 200)}
                  required
                />
              </div>
              
              {/* Password Rules Popup */}
              {showPasswordRules && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Password Requirements</h4>
                  <ul className="space-y-1">
                    <li className={`flex items-center gap-2 text-sm ${passwordValidations.length ? 'text-green-600' : 'text-gray-600'}`}>
                      {passwordValidations.length ? <Check size={14} /> : <X size={14} />}
                      Minimum 8 characters
                    </li>
                    <li className={`flex items-center gap-2 text-sm ${passwordValidations.uppercase ? 'text-green-600' : 'text-gray-600'}`}>
                      {passwordValidations.uppercase ? <Check size={14} /> : <X size={14} />}
                      At least one uppercase letter
                    </li>
                    <li className={`flex items-center gap-2 text-sm ${passwordValidations.lowercase ? 'text-green-600' : 'text-gray-600'}`}>
                      {passwordValidations.lowercase ? <Check size={14} /> : <X size={14} />}
                      At least one lowercase letter
                    </li>
                    <li className={`flex items-center gap-2 text-sm ${passwordValidations.digit ? 'text-green-600' : 'text-gray-600'}`}>
                      {passwordValidations.digit ? <Check size={14} /> : <X size={14} />}
                      At least one digit
                    </li>
                    <li className={`flex items-center gap-2 text-sm ${passwordValidations.specialChar ? 'text-green-600' : 'text-gray-600'}`}>
                      {passwordValidations.specialChar ? <Check size={14} /> : <X size={14} />}
                      At least one special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                    confirmPassword && password !== confirmPassword 
                      ? 'border-red-300' 
                      : 'border-gray-300'
                  } rounded-xl focus:ring-2 focus:ring-[#0B666A]/20 focus:border-[#0B666A] outline-none transition-all duration-300`}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword && password === confirmPassword && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Check size={20} className="text-green-500" />
                  </div>
                )}
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !Object.values(passwordValidations).every(Boolean) || password !== confirmPassword}
              className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                isLoading || !Object.values(passwordValidations).every(Boolean) || password !== confirmPassword
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-black to-gray-900 hover:from-[#0B666A] hover:to-emerald-600 hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-[#0B666A] hover:text-[#095357] transition-colors"
              >
                Login here
              </a>
            </p>
          </div>

          {/* Security Badge */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2">
              <Shield size={16} className="text-green-500" />
              <span className="text-gray-500 text-sm">Your data is securely encrypted</span>
            </div>
          </div>
        </div>

        
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Register;