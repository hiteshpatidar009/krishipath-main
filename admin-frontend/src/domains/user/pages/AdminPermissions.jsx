import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Shield, Trash2, UserCheck, UserX, Search, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getAdmins, updateAdmin, deactivateAdmin, getRoles, acceptInvitation } from '../../../services/adminAPI';

const STATUS_STYLES = {
  active:    'bg-green-50 text-green-700 border-green-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  inactive:  'bg-gray-50 text-gray-600 border-gray-200',
  pending:   'bg-orange-50 text-orange-700 border-orange-200',
};

export default function AdminPermissions() {
  const navigate = useNavigate();
  const [admins, setAdmins]       = useState([]);
  const [roles, setRoles]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [toast, setToast]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  /* ── helpers ─────────────────────────────────── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── data loading ─────────────────────────────── */
  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsRes, rolesRes, invitationsRes] = await Promise.all([
        getAdmins({ search: search || undefined }),
        getRoles(),
        import('../../../services/adminAPI').then(m => m.getInvitations())
      ]);
      const activeAdmins = adminsRes.data?.data?.users || adminsRes.data?.data?.items || (Array.isArray(adminsRes.data?.data) ? adminsRes.data?.data : []);
      const pendingInvitations = invitationsRes.data?.data || [];
      
      // Combine active admins and pending invitations
      setAdmins([...activeAdmins, ...pendingInvitations]);
      
      setRoles(
        rolesRes.data?.data?.roles ||
        (Array.isArray(rolesRes.data?.data) ? rolesRes.data?.data : [])
      );
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* ── toggle status ────────────────────────────── */
  const toggleStatus = async (admin) => {
    const newStatus = admin.status === 'active' ? 'suspended' : 'active';
    try {
      await updateAdmin(admin.id, { status: newStatus });
      showToast('success', `Admin ${newStatus === 'active' ? 'activated' : 'suspended'}`);
      loadData();
    } catch (e) {
      showToast('error', 'Failed to update status');
    }
  };

  /* ── deactivate ───────────────────────────────── */
  const handleDeactivate = async () => {
    if (!confirmDelete) return;
    try {
      await deactivateAdmin(confirmDelete.id);
      setConfirmDelete(null);
      showToast('success', 'Admin deactivated');
      loadData();
    } catch (e) {
      showToast('error', 'Failed to deactivate admin');
    }
  };

  /* ── force approve ────────────────────────────── */
  const forceApprove = async (admin) => {
    if (!window.confirm(`Force approve ${admin.email}? They will be able to log in with password 'KrishiPath@123'`)) return;
    try {
      await acceptInvitation(admin.token, 'KrishiPath@123');
      showToast('success', 'Admin force approved successfully');
      loadData();
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Failed to force approve admin');
    }
  };

  const filtered = admins.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (a.email || '').toLowerCase().includes(q) ||
      (a.firstName || '').toLowerCase().includes(q) ||
      (a.displayName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
          ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield size={24} className="text-green-600" />
            Admins & Permissions
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create admin accounts and manage their access levels from a single screen.
          </p>
        </div>
        <button
          onClick={() => navigate('/app/users/admins/create')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus size={16} /> Add Admin
        </button>
      </div>

      {/* ── Search bar ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button onClick={loadData} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* ── Admin Table ── */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Admin</th>
              <th className="p-4 font-semibold">Contact</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Last Login</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
                    Loading admins…
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  {search ? 'No admins matching your search.' : 'No admin users yet. Click "Add Admin" to create one.'}
                </td>
              </tr>
            ) : (
              filtered.map(admin => (
                <tr key={admin.id} className={`border-t border-slate-100 transition-colors ${admin.userType === 'superadmin' ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                        {(admin.firstName?.[0] || admin.displayName?.[0] || admin.email?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          {admin.displayName || `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || '—'}
                          {admin.userType === 'superadmin' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] uppercase font-bold tracking-wider">Superadmin</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{admin.id?.slice(0, 8)}…</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{admin.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[admin.status] || STATUS_STYLES.inactive}`}>
                      {(admin.status || 'unknown').charAt(0).toUpperCase() + (admin.status || 'unknown').slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">
                    {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => admin.status === 'pending' ? forceApprove(admin) : toggleStatus(admin)}
                        disabled={admin.userType === 'superadmin'}
                        title={admin.userType === 'superadmin' ? 'Cannot modify superadmin' : admin.status === 'pending' ? 'Force Approve' : admin.status === 'active' ? 'Suspend' : 'Activate'}
                        className={`p-1.5 rounded-md transition ${
                          admin.userType === 'superadmin'
                            ? 'text-slate-300 cursor-not-allowed'
                            : admin.status === 'pending'
                              ? 'text-blue-600 hover:bg-blue-50'
                              : admin.status === 'active'
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {admin.status === 'pending' ? <CheckCircle size={16} /> : admin.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(admin)}
                        disabled={admin.userType === 'superadmin' || admin.status === 'pending'}
                        title={admin.userType === 'superadmin' ? 'Cannot deactivate superadmin' : admin.status === 'pending' ? 'Cannot deactivate pending invitation' : 'Deactivate'}
                        className={`p-1.5 rounded-md transition ${
                          admin.userType === 'superadmin' ? 'text-slate-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Confirm Deactivate Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Deactivate Admin</h2>
                <p className="text-sm text-slate-500">This will suspend the admin account.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to deactivate <strong>{confirmDelete.displayName || confirmDelete.email}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">
                Cancel
              </button>
              <button onClick={handleDeactivate} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition">
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
