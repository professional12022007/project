import { get } from '@/lib/api/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WelfareScore = {
  score: number;
  currentBenefits: number;
  potentialBenefits: number;
  eligibilityCount?: number;
  claimedSchemes?: number;
};

export type MissedScheme = {
  id: string;
  name: string;
  benefitAmount: number;
  reason: string;
  description?: string;
  category?: string;
  governmentLevel?: string;
  officialUrl?: string;
  minAge?: number;
  maxAge?: number;
  maxIncome?: number;
};

export type MissedBenefits = {
  missedSchemes: MissedScheme[];
};

export type SchemeDocument = {
  id: string;
  name: string;
};

export type SchemeDetails = {
  id: string;
  name: string;
  description: string;
  benefitAmount: number;
  category: string;
  governmentLevel: string;
  officialUrl: string;
  minAge: number;
  maxAge: number;
  maxIncome: number;
  documents: SchemeDocument[];
  stages: string[];
  states: string[];
};

// ---------------------------------------------------------------------------
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
   * Fetch schemes claimed by the citizen.
   */
  getClaimedSchemes: (citizenId: string) =>
    get<{ claimedSchemes: { id: string; name: string; benefitAmount: number }[] }>(`/api/claimed-schemes/${citizenId}`),

  /**
   * Fetch detailed information for a single scheme.
   */
  getSchemeDetails: (schemeId: string) =>
    get<SchemeDetails>(`/api/scheme/${schemeId}`),
};
