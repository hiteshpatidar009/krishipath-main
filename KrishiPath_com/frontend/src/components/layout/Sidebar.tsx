import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Megaphone, Wallet, Users, BarChart2,
  Bell, Target, Gift, HelpCircle, LogOut,
  Leaf, ChevronRight, Building2, UserCog,
} from 'lucide-react';
import { notifications } from '../../data/mockData';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: Megaphone, label: 'Campaigns', to: '/campaigns' },
  { icon: Wallet, label: 'Wallet', to: '/wallet' },
  { icon: Users, label: 'Farmer Leads', to: '/leads' },
  { icon: BarChart2, label: 'Analytics', to: '/analytics' },
  { icon: Target, label: 'Targeting', to: '/targeting' },
  { icon: Gift, label: 'Rewards', to: '/rewards' },
];

const adminItems = [
  { icon: Building2, label: 'Company List', to: '/companies' },
  { icon: UserCog, label: 'Team & Permissions', to: '/team' },
];

const bottomItems = [
  { icon: Bell, label: 'Notifications', to: '/notifications', comingSoon: true },
  { icon: HelpCircle, label: 'Support', to: '/support', comingSoon: true },
];

export function Sidebar() {
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-border flex flex-col z-40 shadow-[1px_0_8px_rgba(46,125,50,0.06)]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Leaf size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[15px] font-bold text-text-primary tracking-tight">KrishiPath</div>
            <div className="text-[10px] text-text-muted font-medium">Company Portal</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {/* Main Menu */}
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mb-2">Main Menu</p>
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 group relative',
                  isActive ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />}
                  <Icon size={17} strokeWidth={isActive ? 2 : 1.8} />
                  <span className="flex-1">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Admin */}
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mb-2">Admin</p>
          {adminItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 relative',
                  isActive ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />}
                  <Icon size={17} strokeWidth={isActive ? 2 : 1.8} />
                  <span className="flex-1">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* More */}
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mb-2">More</p>
          {bottomItems.map(({ icon: Icon, label, to, comingSoon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 relative',
                  isActive ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />}
                  <Icon size={17} strokeWidth={isActive ? 2 : 1.8} />
                  <span className="flex-1">{label}</span>
                  {label === 'Notifications' && unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
                  )}
                  {comingSoon && (
                    <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">SOON</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="px-3 py-3 border-t border-border shrink-0">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface-alt transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm font-bold shrink-0">
            AG
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-text-primary truncate">AgroGrow India Pvt.</div>
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-bold text-white bg-primary px-1 py-0.5 rounded">ROOT</span>
              <span className="text-[10px] text-text-muted truncate">admin@agrogrow.in</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <button
          onClick={() => navigate('/login')}
          className="mt-1.5 flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-text-muted hover:text-error hover:bg-red-50 w-full transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
