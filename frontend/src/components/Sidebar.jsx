import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  PlusCircle, 
  Building2, 
  Package, 
  BarChart3, 
  Users, 
  X,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasRole } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Purchase Orders', path: '/orders', icon: ShoppingCart },
    { name: 'Create PO', path: '/orders/create', icon: PlusCircle, roles: ['admin', 'purchaser'] },
    { name: 'Vendors', path: '/vendors', icon: Building2 },
    { name: 'Products Catalog', path: '/products', icon: Package },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'User Management', path: '/users', icon: Users, roles: ['admin'] },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <FileCheck2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                ERP Purchase
                <span className="text-[10px] uppercase font-semibold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-400/30">PRO</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">PO & Vendor System</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Pill */}
        <div className="p-4 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                user?.role === 'admin' ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50' :
                user?.role === 'approver' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' :
                'bg-blue-900/60 text-blue-300 border border-blue-700/50'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Procurement Menu
          </div>

          {navItems.map((item) => {
            if (item.roles && !item.roles.includes(user?.role)) {
              return null;
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/orders'}
                onClick={() => onClose && onClose()}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom AI & Help Callout */}
        <div className="p-4 m-3 bg-gradient-to-br from-indigo-950/80 to-slate-900 rounded-xl border border-indigo-900/50">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Catalog Extension</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Auto-generate professional product descriptions inside Products module.
          </p>
        </div>

        {/* Footer info */}
        <div className="p-3 text-center border-t border-slate-800 text-[11px] text-slate-500">
          ERP System v1.0 • Academic Edition
        </div>
      </aside>
    </>
  );
};
