import { useEffect, useState } from 'react';
import {
  Clock, CheckCircle, AlertCircle, RefreshCw,
  Mail, User, ShieldCheck, Search, X, Inbox, Zap,
} from 'lucide-react';
import { getInvitations, acceptInvitation } from '../../../services/adminAPI';

export default function PendingApprovals() {
  const [pending, setPending]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [approving, setApproving] = useState(null); // id of admin being approved
  const [toast, setToast]       = useState(null);

  /* ── Helpers ─────────────────────────────────── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Load pending invitations ────────────────── */
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInvitations();
      const items = res.data?.data || [];
      // Only show pending invitations
      setPending(items.filter(i => i.status === 'pending'));
    } catch {
      showToast('error', 'Failed to load pending invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* ── Force Approve ───────────────────────────── */
  const handleApprove = async (item) => {
    if (!item.token) {
      showToast('error', 'Invitation token missing. Cannot approve.');
      return;
    }
    setApproving(item.id);
    try {
      await acceptInvitation(item.token, 'KrishiPath@123');
      showToast('success', `${item.email} approved! Default password: KrishiPath@123`);
      await loadData();
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to approve invitation.';
      showToast('error', msg);
    } finally {
      setApproving(null);
    }
  };

  /* ── Filter ──────────────────────────────────── */
  const filtered = pending.filter(i => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (i.email || '').toLowerCase().includes(q) ||
      (i.firstName || '').toLowerCase().includes(q) ||
      (i.lastName || '').toLowerCase().includes(q)
    );
  });

  /* ── Time helper ─────────────────────────────── */
  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
          ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={24} className="text-orange-500" />
            Pending Approvals
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review and approve admin invitations that are waiting to be activated.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Badge count */}
          {pending.length > 0 && (
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded-full border border-orange-200">
              {pending.length} pending
            </span>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-white"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
        <Zap size={16} className="shrink-0 mt-0.5 text-orange-500" />
        <p>
          <strong>Force Approve</strong> will immediately activate the admin's account with a temporary password of <code className="bg-orange-100 px-1 rounded font-mono">KrishiPath@123</code>.
          The admin can change it after their first login.
        </p>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox size={24} className="text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700">
            {search ? 'No results found' : 'No pending invitations'}
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            {search
              ? 'Try a different search term.'
              : 'All invitations have been accepted or none have been sent yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-base shrink-0">
                {(item.firstName?.[0] || item.email?.[0] || '?').toUpperCase()}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 truncate">
                    {item.firstName || item.lastName
                      ? `${item.firstName || ''} ${item.lastName || ''}`.trim()
                      : 'No Name'}
                  </span>
                  <span className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 text-[11px] font-bold rounded-full uppercase tracking-wide">
                    Pending
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail size={11} /> {item.email}
                  </span>
                  {item.roleName && (
                    <span className="flex items-center gap-1">
                      <User size={11} /> {item.roleName}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> Invited {timeAgo(item.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => handleApprove(item)}
                disabled={approving === item.id}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition shrink-0"
              >
                {approving === item.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Approving…
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} />
                    Force Approve
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
