import { getProfileData } from '@/lib/actions/profile';
import { ProfileForm } from './ProfileForm';
import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

export default async function PerfilPage() {
  const profileData = await getProfileData();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[#111219]">Meu Perfil</h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie seus dados profissionais</p>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-black/[0.06]">
          <div className="w-12 h-12 bg-[#0C447C]/8 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-[#0C447C]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111219]">Dados Profissionais</p>
            <p className="text-xs text-slate-400">Estas informações ajudam a personalizar sua experiência</p>
          </div>
        </div>

        <ProfileForm initialData={profileData ?? { tipo_usuario: null, oab_numero: null, oab_uf: null, creci_numero: null, creci_uf: null }} />
      </div>
    </div>
  );
}
