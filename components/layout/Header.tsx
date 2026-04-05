'use client';

import { Building2, LogOut, User, LayoutDashboard, ClipboardList, ShieldCheck, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  isAdmin?: boolean;
}

export function Header({ isAdmin }: HeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="bg-[#0C447C] text-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">MatriculAI</span>
            <p className="text-xs text-white/60 leading-none mt-0.5">Due Diligence Imobiliária</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            Análises
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Link>
          )}

          {user && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
              <Link
                href="/perfil"
                className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 px-2 py-1.5 rounded-lg transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                <span className="hidden md:inline">{user.email}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
