import { Sidebar } from '@/components/layout/Sidebar';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserPlanInfo } from '@/lib/actions/profile';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const planInfo = await getUserPlanInfo();

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar
        userEmail={user.email ?? ''}
        plan={planInfo?.plan ?? 'freemium'}
        isAdmin={planInfo?.plan === 'admin'}
      />
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
