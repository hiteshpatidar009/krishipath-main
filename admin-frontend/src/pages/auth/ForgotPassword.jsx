import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldAlert, Leaf, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { authAPI } from "../../services/authAPI";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request, 2: Validate OTP, 3: Reset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resetData, setResetData] = useState({ email: "", sessionId: "" });
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleRequestOTP = async (data) => {
    setLoading(true);
    setError("");
    try {
      await authAPI.requestPasswordReset(data.email);
      setResetData({ ...resetData, email: data.email });
      setSuccessMsg("If your email is registered, you will receive an OTP shortly.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error?.message || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateOTP = async (data) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await authAPI.validatePasswordResetToken(data.otp);
      const sessionId = res.data?.data?.sessionId || res.data?.sessionId; 
      setResetData({ ...resetData, sessionId, token: data.otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data) => {
    setLoading(true);
    setError("");
    try {
      await authAPI.completePasswordReset(resetData.token, data.password);
      setSuccessMsg("Password successfully reset! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-green-300/40 to-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-teal-300/30 to-emerald-500/10 blur-3xl" />

      <div className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-green-900/10 w-full max-w-md border border-white relative z-10">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg shadow-green-500/30">
            <Leaf size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium text-center">
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the 6-digit OTP sent to your email"}
            {step === 3 && "Create a new password"}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2">
            <ShieldAlert size={16} />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSubmit(handleRequestOTP)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50/50 border ${errors.email ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900`}
                  placeholder="admin@krishipath.com"
                  {...register("email", { required: "Email is required" })}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all active:scale-[0.98]"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(handleValidateOTP)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">6-Digit OTP</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50/50 border ${errors.otp ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900 text-center tracking-widest text-lg`}
                  placeholder="000000"
                  {...register("otp", { 
                    required: "OTP is required", 
                    pattern: { value: /^[0-9]{6}$/, message: "Must be 6 digits" } 
                  })}
                />
              </div>
              {errors.otp && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">{errors.otp.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all active:scale-[0.98]"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50/50 border ${errors.password ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900`}
                  placeholder="••••••••"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                  })}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all active:scale-[0.98]"
            >
              {loading ? "Resetting..." : "Set New Password"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-green-600 transition-colors flex items-center justify-center gap-1">
            <ArrowRight size={16} className="rotate-180" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
