const db = require("../config/db");
const citizenService = require("./citizenService");
const welfareService = require("./welfareService");
const roadmapService = require("./roadmapService");
const notificationQueries = require("../queries/notificationQueries");

exports.runRecalculationWorkflowForCitizen = async (citizenId) => {
  console.log(`[Workflow] Starting welfare recalculation for citizen: ${citizenId}`);

  // 1. Fetch current eligible schemes before recalculation
  const missedBefore = await welfareService.getMissedBenefits(citizenId).catch(() => ({ missedSchemes: [] }));
  const beforeIds = new Set(missedBefore.missedSchemes.map(s => s.id));

  // 2. Perform graph mutations & refresh relationships
  await citizenService.recalculateEligibility(citizenId);
  await citizenService.refreshRoadmapRelationships(citizenId);
  await citizenService.refreshRecommendationRelationships(citizenId);

  // 3. Fetch eligible schemes after recalculation
  const missedAfter = await welfareService.getMissedBenefits(citizenId).catch(() => ({ missedSchemes: [] }));
  const afterSchemes = missedAfter.missedSchemes;

  // 4. Identify newly unlocked/eligible schemes
  let newNotifsCount = 0;
  for (const scheme of afterSchemes) {
    if (!beforeIds.has(scheme.id)) {
      await notificationQueries.createNotification(citizenId, {
        type: "newly_eligible",
        title: "New Scheme Available",
        message: `You are now eligible to apply for "${scheme.name}" representing \u20B9${(scheme.benefitAmount || 0).toLocaleString()} in potential benefits.`,
      }).catch(err => console.error("[Workflow] Failed to save newly_eligible notification:", err.message));
      newNotifsCount++;
    }
  }

  // 5. Check for missing documents and trigger warnings
  const readiness = await citizenService.getDocumentReadiness(citizenId).catch(() => null);
  if (readiness && readiness.missing) {
    for (const doc of readiness.missing) {
      await notificationQueries.createNotification(citizenId, {
        type: "missing_documents",
        title: "Missing Document Alert",
        message: `Upload your verified "${doc.name}" to unlock additional government welfare schemes.`,
      }).catch(err => console.error("[Workflow] Failed to save missing_documents notification:", err.message));
      newNotifsCount++;
    }
  }

  // 6. Check profile completeness
  const profile = await citizenService.getCitizenProfile(citizenId).catch(() => null);
  if (profile) {
    const missingFields = [];
    if (!profile.profession) missingFields.push("profession");
    if (!profile.income) missingFields.push("income");
    if (!profile.state) missingFields.push("state");
    if (missingFields.length > 0) {
      await notificationQueries.createNotification(citizenId, {
        type: "profile_incomplete",
        title: "Profile Incomplete",
        message: `Complete your profile by adding: ${missingFields.join(", ")}. A complete profile ensures accurate scheme recommendations.`,
      }).catch(err => console.error("[Workflow] Failed to save profile_incomplete notification:", err.message));
      newNotifsCount++;
    }
  }

  // 7. Roadmap milestone notification
  const roadmap = await roadmapService.getRoadmap(citizenId).catch(() => null);
  if (roadmap && roadmap.nextStage && roadmap.nextStage !== "Terminal State") {
    const opportunities = roadmap.opportunities || [];
    if (opportunities.length > 0) {
      await notificationQueries.createNotification(citizenId, {
        type: "roadmap_milestone",
        title: "Upcoming Life Stage Transition",
        message: `Your next life stage "${roadmap.nextStage}" has ${opportunities.length} scheme(s) available. Check your roadmap for details.`,
      }).catch(err => console.error("[Workflow] Failed to save roadmap_milestone notification:", err.message));
      newNotifsCount++;
    }
  }

  console.log(`[Workflow] Completed successfully for ${citizenId}. Generated ${newNotifsCount} notifications.`);
  return { status: "Success", citizenId, notificationsGenerated: newNotifsCount };
};

exports.runGlobalRecalculationWorkflow = async () => {
  console.log("[Workflow] Starting Global Recalculation Engine background job...");
  const logEntries = [];

  let citizens = [];
  try {
    citizens = await db.runQuery("MATCH (c:Citizen) RETURN c.id as id");
  } catch (err) {
    console.error("[Workflow] Failed to fetch citizens list from Neo4j:", err.message);
    throw err;
  }

  const results = [];
  for (const c of citizens) {
    const citizenId = c.id;
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    let result = null;

    while (attempts < maxAttempts && !success) {
      try {
        result = await exports.runRecalculationWorkflowForCitizen(citizenId);
        success = true;
        results.push(result);
        logEntries.push(`[Success] Citizen ${citizenId}: recals completed.`);
      } catch (err) {
        attempts++;
        console.warn(`[Workflow] Attempt ${attempts} failed for citizen ${citizenId}: ${err.message}`);
        if (attempts >= maxAttempts) {
          logEntries.push(`[Failure] Citizen ${citizenId}: failed after 3 retries. Error: ${err.message}`);
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    }
  }

  console.log(`[Workflow] Global run complete. Processed ${results.length}/${citizens.length} citizens successfully.`);
  return {
    status: "Completed",
    totalCitizens: citizens.length,
    processed: results.length,
    logs: logEntries
  };
};
