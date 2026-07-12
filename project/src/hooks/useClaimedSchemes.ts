import { useCallback, useEffect, useState } from 'react';
import type { ClaimedSchemes } from '@/lib/api/services/welfareService';
import { welfareService } from '@/lib/api/services/welfareService';

type State = {
  data: ClaimedSchemes | null;
  isLoading: boolean;
  error: string | null;
};

export function useClaimedSchemes(citizenId: string) {
  const [state, setState] = useState<State>({ data: null, isLoading: true, error: null });

  const refetch = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await welfareService.getClaimedSchemes(citizenId);
      setState({ data, isLoading: false, error: null });
    } catch {
      setState({ data: null, isLoading: false, error: 'Failed to load claimed schemes.' });
    }
  }, [citizenId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}
