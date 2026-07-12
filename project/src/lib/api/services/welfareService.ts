import { get } from '@/lib/api/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WelfareScore = {
  score: number;
  currentBenefits: number;
  potentialBenefits: number;
};

export type MissedScheme = {
  id: string;
  name: string;
  benefitAmount: number;
  reason: string;
};

export type MissedBenefits = {
  missedSchemes: MissedScheme[];
};

export type ClaimedScheme = {
  id: string;
  name: string;
  benefitAmount: number;
  status: string;
  dateClaimed: string | null;
};

export type ClaimedSchemes = {
  claimedSchemes: ClaimedScheme[];
};

// ---------------------------------------------------------------------------
export type DocumentReadiness = {
  readinessPercentage: number;
  available: { name: string; verified: boolean }[];
  missing: { name: string; actionRequired: string }[];
};

// Service
// ---------------------------------------------------------------------------

export const welfareService = {
  /**
   * Fetch the welfare score for a citizen.
   */
  getWelfareScore: (citizenId: string) =>
    get<WelfareScore>(`/api/welfare-score/${citizenId}`),

  /**
   * Fetch missed benefit schemes for a citizen.
   */
  getMissedBenefits: (citizenId: string) =>
    get<MissedBenefits>(`/api/missed-benefits/${citizenId}`),

  /**
   * Fetch claimed schemes for a citizen.
   */
  getClaimedSchemes: (citizenId: string) =>
    get<ClaimedSchemes>(`/api/claimed-schemes/${citizenId}`),
  /**
   * Fetch document readiness data for a citizen.
   */
  getDocumentReadiness: (citizenId: string) =>
    get<DocumentReadiness>(`/api/document-readiness/${citizenId}`),
};
