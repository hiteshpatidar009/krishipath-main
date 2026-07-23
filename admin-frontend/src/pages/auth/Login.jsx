import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ShieldAlert, Leaf, Mail, Lock, LogIn, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import useAuthStore from "../../core/store/useAuthStore";
import { authAPI } from "../../services/authAPI";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const invitationToken = searchParams.get("invitationToken");
  const [success, setSuccess] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setSuccess("");

    if (invitationToken) {
      try {
        const { acceptInvitation } = await import("../../services/adminAPI");
        await acceptInvitation(invitationToken, data.password);
        setSuccess("Invitation accepted successfully! You can now log in.");
        // Remove token from URL
        setSearchParams({});
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error?.message || "Failed to accept invitation.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const response = await authAPI.loginAdmin({
        email: data.email,
        password: data.password,
        captchaToken: "dev-bypass", // Dummy token for development
        isRoot: true, // Login as super admin
      });

      const responseData = response.data;
      const authData = responseData.data; // Backend wraps in { success: true, data: { ... } }

      if (authData.incomplete) {
        setError("Your account setup is incomplete (MFA or Email Verification required). This is not yet supported in this UI.");
        setLoading(false);
        return;
      }

      // Successful login returns accessToken, user, role, etc.
      login({
        token: authData.accessToken,
        role: authData.user?.role || "ADMIN", // Fallback if role is not returned directly
        user: authData.user,
        permissions: authData.permissions || []
      });

      navigate("/app/sandbox");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        setError("An unexpected error occurred during login.");
      }
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
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg shadow-green-500/30">
            <Leaf size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">KrishiPath</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            {invitationToken ? "Accept your invitation & set a password" : "Please sign in to your account"}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {!invitationToken && (
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
                  {...register("email", { required: !invitationToken ? "Email is required" : false })}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1"><ShieldAlert size={12} />{errors.email.message}</p>}
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-green-600 hover:text-green-700 font-semibold transition-colors">Forgot password?</Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50/50 border ${errors.password ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900`}
                placeholder="••••••••"
                {...register("password", { required: "Password is required" })}
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1"><ShieldAlert size={12} />{errors.password.message}</p>}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2">
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{invitationToken ? "Accept Invitation" : "Sign In"}</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        {/* Note */}
        <div className="mt-8 bg-blue-50/80 backdrop-blur-sm border border-blue-100/50 rounded-xl p-4 flex gap-3 text-sm">
          <div className="text-blue-500 mt-0.5">ℹ️</div>
          <div className="text-blue-800 font-medium text-xs leading-relaxed">
            Hint: Use any email with <span className="font-bold bg-blue-200/50 px-1 rounded">super</span> to login as Super Admin. Other emails will login as Mandi Admin.
          </div>
        </div>
      </div>
    </div>
  );
}
