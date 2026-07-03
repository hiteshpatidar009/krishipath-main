import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Bell, Search, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { notifications } from '../../data/mockData';

const breadcrumbMap: Record<string, { label: string; parent?: string }> = {
  '/': { label: 'Dashboard' },
  '/campaigns': { label: 'Campaigns' },
  '/campaigns/new': { label: 'New Campaign', parent: '/campaigns' },
  '/wallet': { label: 'Wallet' },
  '/leads': { label: 'Farmer Leads' },
  '/analytics': { label: 'Analytics' },
  '/targeting': { label: 'Farmer Targeting' },
  '/rewards': { label: 'Reward Settings' },
  '/notifications': { label: 'Notifications' },
  '/companies': { label: 'Company Directory' },
  '/team': { label: 'Team & Permissions' },
  '/settings': { label: 'Settings' },
  '/support': { label: 'Support' },
};

export function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;
  const current = breadcrumbMap[pathname] ?? { label: 'Page' };

  return (
    <header className="fixed top-0 left-[240px] right-0 h-[60px] bg-white border-b border-border flex items-center px-6 z-30 gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        <Link to="/" className="text-text-muted hover:text-text-primary transition-colors font-medium">Home</Link>
        {current.parent && (
          <>
            <ChevronRight size={14} className="text-text-muted" />
            <Link to={current.parent} className="text-text-muted hover:text-text-primary transition-colors font-medium">
              {breadcrumbMap[current.parent]?.label}
            </Link>
          </>
        )}
        <ChevronRight size={14} className="text-text-muted" />
        <span className="text-text-primary font-semibold">{current.label}</span>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-surface-alt border border-border rounded-lg px-3 py-1.5 w-56 group hover:border-primary-light transition-colors">
        <Search size={14} className="text-text-muted" />
        <input
          placeholder="Search…"
          className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none w-full"
          readOnly
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => navigate('/campaigns/new')}
          className="hidden md:inline-flex"
        >
          New Campaign
        </Button>

        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors cursor-pointer"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center">{unread}</span>
          )}
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold cursor-pointer ml-1">
          AG
        </div>
      </div>
    </header>
  );
}
