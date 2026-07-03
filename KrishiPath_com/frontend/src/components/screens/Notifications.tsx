import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Wallet, Users, Settings, Bell, CheckCheck, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { notifications as initialNotifications, timeAgo } from '../../data/mockData';
import type { NotificationCategory } from '../../data/mockData';

const categoryConfig = {
  campaign: { label: 'Campaign', icon: Megaphone, color: 'text-primary', bg: 'bg-primary-50' },
  wallet: { label: 'Wallet', icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
  leads: { label: 'Leads', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  system: { label: 'System', icon: Settings, color: 'text-gray-500', bg: 'bg-gray-100' },
};

const tabs: { value: NotificationCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'leads', label: 'Leads' },
  { value: 'system', label: 'System' },
];

export function Notifications() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState<NotificationCategory | 'all'>('all');

  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  const filtered = activeTab === 'all' ? notifs : notifs.filter(n => n.category === activeTab);
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Notifications</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} · {notifs.length} total
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" leftIcon={<CheckCheck size={14} />} onClick={markAllRead}>
            Mark All Read
          </Button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 w-fit">
        {tabs.map(tab => {
          const count = tab.value === 'all' ? notifs.filter(n => !n.read).length : notifs.filter(n => n.category === tab.value && !n.read).length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                activeTab === tab.value ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt',
              ].join(' ')}
            >
              {tab.label}
              {count > 0 && (
                <span className={`min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${activeTab === tab.value ? 'bg-white/25 text-white' : 'bg-red-100 text-red-600'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <Card padding="none">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-8">
            <div className="w-14 h-14 rounded-2xl bg-surface-alt flex items-center justify-center mb-3">
              <Bell size={24} className="text-text-muted" />
            </div>
            <p className="text-[15px] font-semibold text-text-primary">No notifications here</p>
            <p className="text-sm text-text-secondary mt-1">When there's activity, you'll see it here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(notif => {
              const cfg = categoryConfig[notif.category];
              const Icon = cfg.icon;
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markRead(notif.id);
                    if (notif.link) navigate(notif.link);
                  }}
                  className={[
                    'flex items-start gap-4 px-5 py-4 cursor-pointer transition-all group',
                    notif.read ? 'hover:bg-surface-alt' : 'bg-primary-50/30 hover:bg-primary-50/50 border-l-2 border-l-primary',
                  ].join(' ')}
                >
                  <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${notif.read ? 'text-text-secondary' : 'text-text-primary'}`}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        <span className="text-[10px] text-text-muted whitespace-nowrap">{timeAgo(notif.timestamp)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed line-clamp-2">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      {notif.link && (
                        <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                          View <ChevronRight size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
