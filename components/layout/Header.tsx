'use client';

import { Building2, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">MatriculAI</h1>
            <p className="text-xs text-slate-500">Due Diligence Imobiliária</p>
          </div>
        </div>
        <nav className="flex items-center gap-6">
          <a href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            Dashboard
          </a>
          <a href="/analysis" className="text-sm font-medium text-slate-500 hover:text-slate-900">
            Análises
          </a>
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
