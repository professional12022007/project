const welfareQueries = require("../queries/welfareQueries");

exports.getWelfareScore = async (citizenId) => {
  const result = await welfareQueries.getWelfareScore(citizenId);

  if (!result || result.length === 0) {
    return { score: 0, currentBenefits: 0, potentialBenefits: 0, eligibilityCount: 0, claimedSchemes: 0 };
  }

  const { score, currentBenefits, potentialBenefits, eligibilityCount, claimedSchemes } = result[0];
  return {
    score: score || 0,
    currentBenefits: currentBenefits || 0,
    potentialBenefits: potentialBenefits || 0,
    eligibilityCount: eligibilityCount || 0,
    claimedSchemes: claimedSchemes || 0,
  };
};

exports.getMissedBenefits = async (citizenId) => {
  const rows = await welfareQueries.getMissedBenefits(citizenId);
  const missedSchemes = rows.map(row => ({
    id: row.id,
    name: row.name,
    benefitAmount: row.benefitAmount || 0,
    description: row.description || "",
    category: row.category || "",
    governmentLevel: row.governmentLevel || "",
    officialUrl: row.officialUrl || "",
    reason: row.reason || "Eligible but un-applied.",
  }));
  return { missedSchemes };
};

exports.getClaimedSchemes = async (citizenId) => {
  const rows = await welfareQueries.getClaimedSchemes(citizenId);
  const claimedSchemes = rows.map(row => ({
    id: row.id,
    name: row.name,
    benefitAmount: row.benefitAmount,
    ...(row.status !== undefined && { status: row.status }),
    ...(row.dateClaimed !== undefined && { dateClaimed: row.dateClaimed }),
  }));
  return { claimedSchemes };
};

exports.recalculateEligibility = (citizenId) =>
  welfareQueries.recalculateEligibility(citizenId);

exports.refreshRecommendationRelationships = (citizenId) =>
  welfareQueries.refreshRecommendationRelationships(citizenId);

exports.getExplainEligibility = async (citizenId, schemeId) => {
  const result = await welfareQueries.checkExplainableEligibility(citizenId, schemeId);
  return result[0] || { citizenId, schemeId, ageValid: false, incomeValid: false, stateValid: false, stageValid: false };
};

exports.getSimilarSchemes = async (schemeId) => {
  const similar = await welfareQueries.findSimilarSchemes(schemeId);
  return { similar };
};

exports.getSchemeDetails = async (schemeId) => {
  const result = await welfareQueries.getSchemeDetails(schemeId);
  if (!result || result.length === 0) {
    const err = new Error("Scheme not found");
    err.statusCode = 404;
    throw err;
  }
  return result[0];
};
