import type { TeamMember } from '../types';

// ─── Team Members ─────────────────────────────────────────────────────────────

export const teamMembers: TeamMember[] = [
  {
    id: 'tm-001',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@agrogrow.in',
    role: 'root',
    phone: '+91 98765 43210',
    joinedAt: '2026-01-15',
    lastActive: '2026-07-02T09:30:00',
    status: 'active',
    permissions: ['all'],
  },
  {
    id: 'tm-002',
    name: 'Priya Sharma',
    email: 'priya.sharma@agrogrow.in',
    role: 'admin',
    phone: '+91 98765 11223',
    joinedAt: '2026-02-01',
    lastActive: '2026-07-02T08:15:00',
    status: 'active',
    permissions: ['campaigns', 'leads', 'analytics', 'team', 'wallet'],
  },
  {
    id: 'tm-003',
    name: 'Rohit Desai',
    email: 'rohit.desai@agrogrow.in',
    role: 'member',
    joinedAt: '2026-03-10',
    lastActive: '2026-07-01T17:45:00',
    status: 'active',
    permissions: ['campaigns', 'leads', 'analytics'],
  },
  {
    id: 'tm-004',
    name: 'Sunita Patel',
    email: 'sunita.patel@agrogrow.in',
    role: 'member',
    joinedAt: '2026-04-05',
    lastActive: '2026-06-29T11:20:00',
    status: 'active',
    permissions: ['campaigns', 'leads'],
  },
  {
    id: 'tm-005',
    name: 'Karan Joshi',
    email: 'karan.joshi@agrogrow.in',
    role: 'viewer',
    joinedAt: '2026-05-20',
    lastActive: '2026-06-25T14:00:00',
    status: 'invited',
    permissions: ['analytics'],
  },
];
