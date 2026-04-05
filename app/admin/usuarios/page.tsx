import { getAllUsers } from '@/lib/actions/admin';
import { ChangePlanButton } from './ChangePlanButton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users } from 'lucide-react';

const TIPO_BADGE: Record<string, { label: string; className: string }> = {
  advogado: { label: 'Advogado', className: 'bg-blue-100 text-blue-700' },
  corretor: { label: 'Corretor', className: 'bg-green-100 text-green-700' },
  comprador: { label: 'Comprador', className: 'bg-slate-100 text-slate-600' },
  credor: { label: 'Credor', className: 'bg-orange-100 text-orange-700' },
};

export default async function AdminUsuarios() {
  const users = await getAllUsers();

  const totals = {
    freemium: users.filter(u => u.plan === 'freemium').length,
    standard: users.filter(u => u.plan === 'standard').length,
    admin: users.filter(u => u.plan === 'admin').length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111219]">Usuários</h1>
        <p className="text-sm text-slate-400 mt-1">
          {users.length} cadastros — {totals.freemium} freemium · {totals.standard} standard · {totals.admin} admin
        </p>
      </div>

      <div className="bg-white rounded-xl border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-black/[0.06] text-xs font-semibold text-slate-400 uppercase tracking-wide">
          <span>Email</span>
          <span className="w-32">Perfil</span>
          <span className="w-24 text-center">Análises</span>
          <span className="w-28 text-right">Cadastro</span>
          <span className="w-28 text-right">Plano</span>
        </div>

        {/* Rows */}
        {users.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum usuário encontrado</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.04]">
            {users.map(user => (
              <div key={user.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                <span className="text-sm text-[#111219] truncate font-medium">{user.email}</span>
                <div className="w-32">
                  {user.tipoUsuario && TIPO_BADGE[user.tipoUsuario] ? (
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${TIPO_BADGE[user.tipoUsuario].className}`}>
                        {TIPO_BADGE[user.tipoUsuario].label}
                      </span>
                      {user.tipoUsuario === 'advogado' && user.oabNumero && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          OAB {user.oabNumero}{user.oabUf ? `/${user.oabUf}` : ''}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </div>
                <span className="w-24 text-center text-sm text-slate-500">{user.analysisCount}</span>
                <span className="w-28 text-right text-xs text-slate-400">
                  {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
                <div className="w-28 flex justify-end">
                  <ChangePlanButton userId={user.id} currentPlan={user.plan} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
