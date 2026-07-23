import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, ArrowLeft, CheckCircle, AlertCircle,
  Mail, User, Phone, Shield, Info,
} from 'lucide-react';
import { createAdmin, getRoles } from '../../../services/adminAPI';

const BLANK = { firstName: '', lastName: '', email: '', phone: '', roleId: '' };

const ROLE_DESCRIPTIONS = {
  'Mandi Admin':    'Can manage mandi listings, prices, and trader data.',
  'Content Admin':  'Can manage crops, grades, units, and translation content.',
  'Support Staff':  'Can view farmer profiles and handle support queries.',
  'Data Analyst':   'Read-only access to all platform data and reports.',
};

export default function CreateAdmin() {
  const navigate = useNavigate();
  const [form, setForm]         = useState(BLANK);
  const [roles, setRoles]       = useState([]);
  const [submitting, setSub]    = useState(false);
  const [toast, setToast]       = useState(null);
  const [success, setSuccess]   = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [successRole, setSuccessRole]   = useState('');
  const [loadingRoles, setLoadingRoles] = useState(true);

  /* ── Load Roles ─────────────────────────────── */
  useEffect(() => {
    getRoles()
      .then(res => {
        const list =
          res.data?.data?.roles ??
          (Array.isArray(res.data?.data) ? res.data?.data : []);
        setRoles(list);
      })
      .catch(() => showToast('error', 'Could not load roles'))
      .finally(() => setLoadingRoles(false));
  }, []);

  /* ── Helpers ─────────────────────────────────── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const selectedRole = roles.find(r => r.id === form.roleId);

  /* ── Submit ──────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim() || !form.roleId) {
      showToast('error', 'First name, email and role are all required.');
      return;
    }
    setSub(true);
    try {
      await createAdmin({
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim() || 'Admin',
        email:     form.email.trim(),
        phone:     form.phone.trim() || undefined,
        roleId:    form.roleId,
        warehouseAccess: { all: true },
      });
      setSuccessEmail(form.email.trim());
      setSuccessRole(selectedRole?.name || '');
      setSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to send invitation.';
      showToast('error', msg);
    } finally {
      setSub(false);
    }
  };

  /* ── Success Screen ──────────────────────────── */
  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Invitation Sent!</h2>
            <p className="text-slate-500 text-sm mt-2">
              An invite has been sent to <span className="font-semibold text-slate-700">{successEmail}</span>.
              They will receive an email with instructions to set up their account.
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-left text-sm space-y-2 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Name</span>
              <span className="font-semibold text-slate-800">{form.firstName} {form.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email</span>
              <span className="font-semibold text-slate-800">{successEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Role</span>
              <span className="font-semibold text-slate-800">{successRole || '—'}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setSuccess(false); setForm(BLANK); }}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Invite Another
            </button>
            <button
              onClick={() => navigate('/app/users/admins')}
              className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
            >
              View All Admins
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form Screen ─────────────────────────────── */
  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
          ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserPlus size={22} className="text-green-600" />
            Invite New Admin
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Fill in the details below. An invitation email will be sent to the provided address.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Card header */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-sm">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">New Admin Account</p>
            <p className="text-xs text-slate-500">The invited user will receive a setup link via email</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="text"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Aarav"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Last Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Sharma"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="admin@krishipath.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Assign Role <span className="text-red-500">*</span>
            </label>
            {loadingRoles ? (
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roles.map(role => (
                  <label
                    key={role.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      form.roleId === role.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="roleId"
                      value={role.id}
                      checked={form.roleId === role.id}
                      onChange={() => setForm({ ...form, roleId: role.id })}
                      className="mt-0.5 accent-green-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{role.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {ROLE_DESCRIPTIONS[role.name] || role.description || 'Platform admin access.'}
                      </p>
                    </div>
                  </label>
                ))}
                {roles.length === 0 && (
                  <p className="text-sm text-slate-400 col-span-2 text-center py-3">
                    No roles found. Please seed roles first.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-sm text-blue-800">
            <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
            <p>
              A secure invitation link will be emailed to this address. Until they accept the invite,
              their account will show as <strong>Pending</strong> in the Admin list.
              Superadmin can force-approve any pending invitation.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.roleId}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Mail size={16} />
                  Send Invitation
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
