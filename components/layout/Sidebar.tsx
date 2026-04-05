'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  FileSearch,
  FileText,
  Scale,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  userEmail: string;
  plan: string;
  isAdmin: boolean;
}

const PLAN_BADGE: Record<string, { label: string; className: string }> = {
  freemium: { label: 'Freemium', className: 'bg-slate-100 text-slate-600' },
  standard: { label: 'Standard', className: 'bg-[#0C447C]/10 text-[#0C447C]' },
  admin: { label: 'Admin', className: 'bg-violet-100 text-violet-700' },
};

const NAV_LINKS = [
  { href: '/', label: 'Análises', icon: FileSearch, exact: true },
  { href: '/documentos', label: 'Documentos', icon: FileText, exact: false },
];

export function Sidebar({ userEmail, plan, isAdmin }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const planBadge = PLAN_BADGE[plan] ?? PLAN_BADGE.freemium;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0C447C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-[#0C447C]" />
          </div>
          <div>
            <span className="text-base font-bold text-[#111219] tracking-tight">MatriculAI</span>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Due Diligence Imobiliária</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#E6F1FB] text-[#0C447C] font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#0C447C]' : 'text-slate-400'}`} />
              {label}
            </Link>
          );
        })}

        {/* Processos — Em breve */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 cursor-not-allowed select-none">
          <Scale className="w-4 h-4 flex-shrink-0 text-slate-300" />
          Processos
          <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-full">
            Em breve
          </span>
        </div>

        {isAdmin && (
          <>
            <hr className="my-2 border-[#e2e8f0]" />
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith('/admin')
                  ? 'bg-[#E6F1FB] text-[#0C447C] font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 flex-shrink-0 ${pathname.startsWith('/admin') ? 'text-[#0C447C]' : 'text-slate-400'}`} />
              Admin
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#e2e8f0] space-y-1">
        {/* Plan badge */}
        <div className="px-3 py-1.5 mb-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${planBadge.className}`}>
            {planBadge.label}
          </span>
        </div>

        {/* Email */}
        <div className="px-3 py-1 mb-1">
          <p className="text-xs text-slate-400 truncate max-w-[180px]">{userEmail}</p>
        </div>

        {/* Perfil */}
        <Link
          href="/perfil"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === '/perfil'
              ? 'bg-[#E6F1FB] text-[#0C447C] font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <User className={`w-4 h-4 flex-shrink-0 ${pathname === '/perfil' ? 'text-[#0C447C]' : 'text-slate-400'}`} />
          Perfil
        </Link>

        {/* Sair */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-slate-400" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#e2e8f0] z-30 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#0C447C]" />
          <span className="text-sm font-bold text-[#111219]">MatriculAI</span>
        </div>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed left-0 top-0 h-full w-60 bg-white border-r border-[#e2e8f0] flex flex-col z-40 transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Fechar menu"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {sidebarContent}
      </aside>
    </>
  );
}
