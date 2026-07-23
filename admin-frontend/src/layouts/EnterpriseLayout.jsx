import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import useUIStore from '../core/store/useUIStore';
import usePermissions from '../shared/hooks/usePermissions';
import {
  Menu, Search, Bell, UserCircle, Command, X,
  Globe, Building2, TrendingUp, Users,
  Leaf, Tag, Award, Ruler, Languages, UserPlus, Clock, Package, Video, HelpCircle, Newspaper, MessageSquare, Store, BrainCircuit
} from 'lucide-react';
import CommandPalette from '../shared/components/ui/CommandPalette';

export default function EnterpriseLayout() {
  const { sidebarOpen, toggleSidebar, theme } = useUIStore();
  const { isSuperAdmin } = usePermissions();

  return (
    <div className={`min-h-screen bg-slate-50 flex ${theme === 'dark' ? 'dark bg-slate-950' : ''}`}>

      {/* Dynamic Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-screen transition-all duration-300 bg-white border-r border-slate-200 shadow-sm
          ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}
        `}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
          <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${!sidebarOpen ? 'opacity-0 lg:opacity-100 lg:w-full lg:justify-center' : 'opacity-100 w-auto'}`}>
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-white font-bold">K</span>
            </div>
            <span className={`font-bold text-lg text-slate-800 whitespace-nowrap ${!sidebarOpen ? 'hidden' : 'block'}`}>KrishiPath OS</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-1 text-slate-500 hover:bg-slate-100 rounded-md">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Area */}
        <div className="p-3 overflow-y-auto h-[calc(100vh-64px)] pb-24">
          <nav className="space-y-1">
            <NavItem to="/app" icon={<Command size={20} />} label="Dashboard" isOpen={sidebarOpen} />

            {/* ─────────────────── SUPER ADMIN ONLY ─────────────────── */}
            {isSuperAdmin && (
              <>
                {/* MASTER DATA */}
                <SectionHeader label="Master Data" isOpen={sidebarOpen} />
                <NavItem to="/app/master/categories" icon={<Tag size={20} />} label="Crop Categories" isOpen={sidebarOpen} />
                <NavItem to="/app/master/crop-catalog" icon={<Leaf size={20} />} label="Crop Catalog" isOpen={sidebarOpen} />
                <NavItem to="/app/master/grades" icon={<Award size={20} />} label="Grades" isOpen={sidebarOpen} />
                <NavItem to="/app/master/units" icon={<Ruler size={20} />} label="Units" isOpen={sidebarOpen} />
                <NavItem to="/app/master/languages" icon={<Languages size={20} />} label="Languages" isOpen={sidebarOpen} />
                <NavItem to="/app/master/localization" icon={<Globe size={20} />} label="Translation Center" isOpen={sidebarOpen} />
                <NavItem to="/app/master/states" icon={<Globe size={20} />} label="States" isOpen={sidebarOpen} />
                <NavItem to="/app/master/districts" icon={<Globe size={20} />} label="Districts" isOpen={sidebarOpen} />

                {/* PRODUCTS */}
                <SectionHeader label="Products" isOpen={sidebarOpen} />
                <NavItem to="/app/master/products" icon={<Package size={20} />} label="Product Catalog" isOpen={sidebarOpen} />

                {/* MANDI */}
                <SectionHeader label="Mandi" isOpen={sidebarOpen} />
                <NavItem to="/app/mandi/directory" icon={<Building2 size={20} />} label="Mandi Directory" isOpen={sidebarOpen} />
                <NavItem to="/app/mandi/traders" icon={<Store size={20} />} label="Trader Registry" isOpen={sidebarOpen} />
                <NavItem to="/app/mandi/prices" icon={<TrendingUp size={20} />} label="Mandi Prices" isOpen={sidebarOpen} />
                <NavItem to="/app/mandi/insights" icon={<BrainCircuit size={20} />} label="Market Insights" isOpen={sidebarOpen} />

                {/* MARKET INTELLIGENCE */}
                <SectionHeader label="Market Intelligence" isOpen={sidebarOpen} />
                <NavItem to="/app/market-sources" icon={<MessageSquare size={20} />} label="Market Sources" isOpen={sidebarOpen} />



                {/* USER MANAGEMENT */}
                <SectionHeader label="User Management" isOpen={sidebarOpen} />
                <NavItem to="/app/users/admins" icon={<Users size={20} />} label="Admins & Permissions" isOpen={sidebarOpen} />
                <NavItem to="/app/users/admins/create" icon={<UserPlus size={20} />} label="Invite Admin" isOpen={sidebarOpen} />
                <NavItem to="/app/users/admins/pending" icon={<Clock size={20} />} label="Pending Approvals" isOpen={sidebarOpen} />
                <NavItem to="/app/users/farmers" icon={<Users size={20} />} label="Farmers" isOpen={sidebarOpen} />
              </>
            )}

            {/* ─────────────────── MANDI ADMIN / STAFF ─────────────────── */}
            {!isSuperAdmin && (
              <>
                <SectionHeader label="Operations" isOpen={sidebarOpen} />
                <NavItem to="/app/users/farmers" icon={<Users size={20} />} label="Farmers" isOpen={sidebarOpen} />
                <NavItem to="/app/mandi/directory" icon={<Building2 size={20} />} label="Mandi Directory" isOpen={sidebarOpen} />
                <NavItem to="/app/mandi/traders" icon={<Store size={20} />} label="Trader Registry" isOpen={sidebarOpen} />
                <NavItem to="/app/mandi/prices" icon={<TrendingUp size={20} />} label="Mandi Prices" isOpen={sidebarOpen} />
                <NavItem to="/app/mandi/insights" icon={<BrainCircuit size={20} />} label="Market Insights" isOpen={sidebarOpen} />

                <SectionHeader label="Products" isOpen={sidebarOpen} />
                <NavItem to="/app/master/products" icon={<Package size={20} />} label="Product Catalog" isOpen={sidebarOpen} />

                {/* CONTENT */}
                <SectionHeader label="Content Management" isOpen={sidebarOpen} />
                <NavItem to="/app/content/schemes" icon={<Newspaper size={20} />} label="Govt Schemes" isOpen={sidebarOpen} />
                <NavItem to="/app/content/predictions" icon={<TrendingUp size={20} />} label="Predictions" isOpen={sidebarOpen} />
                <NavItem to="/app/content/polls" icon={<HelpCircle size={20} />} label="Polls" isOpen={sidebarOpen} />
                <NavItem to="/app/content/creators" icon={<Users size={20} />} label="Creators" isOpen={sidebarOpen} />
                <NavItem to="/app/content/shorts" icon={<Video size={20} />} label="Shorts" isOpen={sidebarOpen} />
              </>
            )}

          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">

        {/* Top Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors">
              <Menu size={20} />
            </button>

            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-sm text-slate-500 transition-colors w-64 group">
              <Search size={16} className="text-slate-400 group-hover:text-slate-600" />
              <span>Search platform...</span>
              <kbd className="ml-auto text-[10px] font-semibold bg-white border border-slate-200 px-1.5 rounded text-slate-400">Ctrl K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <button className="flex items-center gap-2 p-1.5 pr-3 hover:bg-slate-50 rounded-full border border-transparent hover:border-slate-200 transition-colors">
              <UserCircle size={28} className="text-slate-400" />
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold text-slate-700 leading-none">Admin User</span>
                <span className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
                  {isSuperAdmin ? 'Super Admin' : 'Mandi Admin'}
                </span>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
}

// Section header helper
function SectionHeader({ label, isOpen }) {
  return (
    <div className={`pt-4 pb-1 ${!isOpen ? 'text-center' : 'pl-3'}`}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

// Nav item helper
function NavItem({ icon, label, isOpen, to }) {
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
        ${isActive ? 'bg-green-50 text-green-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'}
        ${!isOpen ? 'justify-center lg:justify-start lg:w-11 lg:overflow-hidden' : ''}
      `}
    >
      {({ isActive }) => (
        <>
          <span className={`shrink-0 ${isActive ? 'text-green-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {icon}
          </span>
          <span className={`whitespace-nowrap transition-opacity duration-200 ${!isOpen ? 'opacity-0 lg:opacity-100 lg:hidden' : 'opacity-100'}`}>
            {label}
          </span>

          {/* Tooltip for collapsed state */}
          {!isOpen && (
            <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden lg:block z-50 whitespace-nowrap">
              {label}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}
