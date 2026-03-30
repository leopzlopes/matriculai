'use client';

import { useEffect, useState } from 'react';
import { AnalysisList } from '@/components/analysis/AnalysisList';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Analysis } from '@/types';
import { Loader2 } from 'lucide-react';

export function RealTimeAnalysisList() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAnalyses = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match Analysis type
        const transformedData: Analysis[] = (data || []).map(item => ({
          id: item.id,
          propertyName: item.property_name,
          registrationNumber: item.registration_number,
          pdfUrl: item.pdf_url ?? undefined,
          riskScore: item.risk_score ?? 0,
          status: (item.status as Analysis['status']) ?? 'pending',
          createdAt: item.created_at ?? '',
          updatedAt: item.updated_at ?? '',
        }));

        setAnalyses(transformedData);
      } catch (err) {
        setError('Erro ao carregar análises');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyses();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('analyses_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analyses',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchAnalyses();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">
        {analyses.length} análise{analyses.length !== 1 ? 's' : ''} encontrada{analyses.length !== 1 ? 's' : ''}
      </p>
      <AnalysisList analyses={analyses} />
    </div>
  );
}
