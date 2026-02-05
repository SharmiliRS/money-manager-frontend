import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Key, Lock, ArrowRight, Shield, ArrowLeft, RefreshCw, Check, X } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    specialChar: false,
  });

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

  const handleSendResetCode = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required!");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("A reset code has been sent to your email.");
      localStorage.setItem("resetEmail", email);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (!resetCode || resetCode.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("Code verified successfully! Enter your new password.");
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!Object.values(passwordValidations).every(Boolean)) {
      setError("Password does not meet all requirements!");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Enter Email", active: step === 1 },
    { number: 2, title: "Verify Code", active: step === 2 },
    { number: 3, title: "New Password", active: step === 3 },
  ];

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
                    <Shield size={12} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 1 ? "Reset Password" : step === 2 ? "Verify Code" : "New Password"}
            </h2>
            <p className="text-gray-600">
              {step === 1 
                ? "Enter your email to receive a reset code" 
                : step === 2 
                ? "Enter the 6-digit code sent to your email" 
                : "Create a new password for your account"}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
            {steps.map((stepItem) => (
              <div key={stepItem.number} className="flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stepItem.active 
                    ? 'bg-[#0B666A] text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepItem.number}
                </div>
                <span className={`text-xs mt-2 ${stepItem.active ? 'text-[#0B666A] font-medium' : 'text-gray-500'}`}>
                  {stepItem.title}
                </span>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-600 text-sm text-center">{message}</p>
            </div>
          )}

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendResetCode} className="space-y-6">
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

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-black to-gray-900 hover:from-[#0B666A] hover:to-emerald-600 hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Reset Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B666A]/20 focus:border-[#0B666A] outline-none transition-all duration-300 text-center tracking-widest text-xl font-mono"
                    placeholder="000000"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-gray-500 text-xs mt-2 text-center">
                  Enter the 6-digit code sent to {email}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl font-medium border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#0B666A] to-emerald-600 hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password with Validation */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="relative">
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B666A]/20 focus:border-[#0B666A] outline-none transition-all duration-300"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
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

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                      confirmPassword && newPassword !== confirmPassword 
                        ? 'border-red-300' 
                        : 'border-gray-300'
                    } rounded-xl focus:ring-2 focus:ring-[#0B666A]/20 focus:border-[#0B666A] outline-none transition-all duration-300`}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {confirmPassword && newPassword === confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Check size={20} className="text-green-500" />
                    </div>
                  )}
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl font-medium border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !Object.values(passwordValidations).every(Boolean) || newPassword !== confirmPassword}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                    loading || !Object.values(passwordValidations).every(Boolean) || newPassword !== confirmPassword
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#0B666A] to-emerald-600 hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <RefreshCw size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Remember Password Link */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Remember your password?{" "}
              <a
                href="/login"
                className="font-semibold text-[#0B666A] hover:text-[#095357] transition-colors"
              >
                Login here
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          For security reasons, reset codes expire in 10 minutes
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;