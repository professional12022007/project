import { useCallback, useEffect, useState } from 'react';
import type { DocumentReadiness } from '@/lib/api/services/welfareService';
import { welfareService } from '@/lib/api/services/welfareService';

type State = {
  data: DocumentReadiness | null;
  isLoading: boolean;
  error: string | null;
};

export function useDocumentReadiness(citizenId: string) {
  const [state, setState] = useState<State>({ data: null, isLoading: true, error: null });

  const refetch = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await welfareService.getDocumentReadiness(citizenId);
      setState({ data, isLoading: false, error: null });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Failed to load document readiness.';
      setState({ data: null, isLoading: false, error: msg });
    }
  }, [citizenId]);

  useEffect(() => {
    if (citizenId) {
      refetch();
    }
  }, [refetch]);

  return { ...state, refetch };
}
