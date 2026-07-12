const citizenService = require("./citizenService");
const welfareService = require("./welfareService");
const roadmapService = require("./roadmapService");
const familyService = require("./familyService");
require("dotenv").config();

exports.generateAssistantResponse = async ({
  citizenId = "citizen_101",
  message,
  question,
  history = [],
}) => {
  const queryText = message || question;
  if (!queryText || !queryText.trim()) {
    return { answer: "Please ask a question so I can assist you." };
  }

  const safeHistory = Array.isArray(history)
    ? history
        .filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string")
        .slice(-8)
        .map((item) => ({
          role: item.role,
          content: item.content.trim().slice(0, 1200),
        }))
    : [];

  // 1. Intent Detection
  const msgLower = queryText.toLowerCase();
  const intents = [];
  if (msgLower.includes("score") || msgLower.includes("welfare") || msgLower.includes("points") || msgLower.includes("rating")) {
    intents.push("welfare-score");
  }
  if (msgLower.includes("missed") || msgLower.includes("eligible") || msgLower.includes("apply") || msgLower.includes("qualify") || msgLower.includes("recommend") || msgLower.includes("scheme")) {
    intents.push("missed-benefits");
  }
  if (msgLower.includes("roadmap") || msgLower.includes("future") || msgLower.includes("milestone") || msgLower.includes("stage") || msgLower.includes("next")) {
    intents.push("roadmap");
  }
  if (msgLower.includes("family") || msgLower.includes("household") || msgLower.includes("member") || msgLower.includes("father") || msgLower.includes("mother")) {
    intents.push("family-optimizer");
  }
  if (msgLower.includes("predict") || msgLower.includes("document") || msgLower.includes("missing") || msgLower.includes("upload")) {
    intents.push("predictive-eligibility");
  }

  if (intents.length === 0) {
    intents.push("welfare-score");
    intents.push("missed-benefits");
  }

  // 2. Context Retrieval — fetch data for each detected intent
  const contextData = {};

  // Always load citizen profile
  try {
    contextData.profile = await citizenService.getCitizenProfile(citizenId);
  } catch (err) {
    console.error("[Assistant] Failed to load citizen profile:", err.message);
  }

  // Fetch welfare score
  if (intents.includes("welfare-score")) {
    try {
      contextData.welfareScore = await welfareService.getWelfareScore(citizenId);
    } catch (err) {
      console.error("[Assistant] Failed to load welfare score:", err.message);
    }
  }

  // Fetch missed benefits / recommended schemes
  if (intents.includes("missed-benefits")) {
    try {
      const missed = await welfareService.getMissedBenefits(citizenId);
      contextData.missedBenefits = missed;
    } catch (err) {
      console.error("[Assistant] Failed to load missed benefits:", err.message);
    }
  }

  // Fetch roadmap
  if (intents.includes("roadmap")) {
    try {
      contextData.roadmap = await roadmapService.getRoadmap(citizenId);
    } catch (err) {
      console.error("[Assistant] Failed to load roadmap:", err.message);
    }
  }

  // Fetch family optimization data
  if (intents.includes("family-optimizer")) {
    try {
      contextData.family = await familyService.getFamilyOptimization(citizenId);
    } catch (err) {
      console.error("[Assistant] Failed to load family data:", err.message);
    }
  }

  // Fetch predictive eligibility
  if (intents.includes("predictive-eligibility")) {
    try {
      contextData.predictions = await citizenService.getPredictiveEligibility(citizenId);
    } catch (err) {
      console.error("[Assistant] Failed to load predictions:", err.message);
    }
  }

  // 3. Context Builder
  let contextString = `Citizen Profile:
- ID: ${contextData.profile?.id || citizenId}
- Name: ${contextData.profile?.name || "Unknown"}
- Age: ${contextData.profile?.age || "N/A"}
- Annual Income: \u20B9${contextData.profile?.income ?? "N/A"}
- State: ${contextData.profile?.state || "N/A"}
- Life Stage: ${contextData.profile?.stage || "N/A"}
`;

  if (contextData.welfareScore) {
    contextString += `\nWelfare Score Status:
- Health Score: ${contextData.welfareScore.score}/100
- Current Draw Value: \u20B9${contextData.welfareScore.currentBenefits}
- Potential Max Value: \u20B9${contextData.welfareScore.potentialBenefits}
`;
  }

  if (contextData.missedBenefits) {
    contextString += `\nMissed/Recommended Schemes:
${(contextData.missedBenefits?.missedSchemes ?? []).map((s, idx) => `${idx + 1}. ${s.name} (Amount: \u20B9${s.benefitAmount}). Reason: ${s.reason}`).join("\n") || "No missed schemes found."}
`;
  }

  if (contextData.roadmap) {
    contextString += `\nRoadmap Milestone:
- Current Stage: ${contextData.roadmap.currentStage}
- Next Stage Transition: ${contextData.roadmap.nextStage}
- Opportunities at Next Stage: ${(contextData.roadmap?.opportunities ?? []).join(", ") || "None"}
`;
  }

  if (contextData.family) {
    contextString += `\nFamily Members Optimization Matrix:
${(contextData.family?.familyUniverse ?? []).map((m) => `- Member (${m.familyMember}), Age: ${m.age}. Enrolled: [${(m.activeBenefits ?? []).join(", ")}], Potential: [${(m.optimizedRecommendations ?? []).join(", ")}] (Net Potential: \u20B9${m.potentialExtraValue})`).join("\n")}
`;
    if (contextData.family.householdOptimization) {
      const hh = contextData.family.householdOptimization;
      contextString += `- Household Level Recommendations: ${(hh.familyLevelRecommendations ?? []).join(", ") || "None"} (Joint Income Support Scheme Eligibility: ${hh.intergenerationalBonusEligible ? "Yes" : "No"})
`;
    }
  }

  if (contextData.predictions) {
    contextString += `\nPredictive Eligibility (Future Schemes if conditions change):
${(contextData.predictions?.predictions ?? []).map((p, idx) => `${idx + 1}. Scheme: ${p.schemeName} (\u20B9${p.benefitAmount}). Missing Requirements: ${(p.missingDocuments ?? []).length > 0 ? "Documents: " + (p.missingDocuments ?? []).join(", ") : ""} ${p.requiredLifestage ? "Transition to Stage: " + p.requiredLifestage : ""}`).join("\n") || "No predicted future schemes."}
`;
  }

  const systemPrompt = `You are the AI Welfare Twin, a personalized welfare intelligence agent.
You are helping a citizen understand their profile, eligibility, welfare score, missed schemes, and roadmap opportunities.
Use ONLY the following data retrieved from the database to answer the user's question.
Never make up or hallucinate any numbers, schemes, or requirements that are not in the context.
Your answers should be highly detailed, natural, multilingual (responsive in the user's language or mixed Hinglish if appropriate), and must include a clear bulleted explanation of the requirements and reasoning (e.g. checkmarks indicating income, age, residence, document requirements).

Context:
${contextString}`;

  // 4. Build request body for Sarvam API
  const targetModel = process.env.SARVAM_MODEL || "sarvam-30b";
  const requestBody = {
    model: targetModel,
    messages: [
      { role: "system", content: systemPrompt },
      ...safeHistory,
      { role: "user", content: queryText },
    ],
    temperature: 0.35,
    max_tokens: Number(process.env.SARVAM_MAX_TOKENS || 900),
  };

  // 5. Sarvam AI Chat completion call
  const sarvamKey = process.env.SARVAM_API_KEY;
  if (!sarvamKey) {
    return {
      answer: "The AI assistant is currently unavailable. Please try again later or contact support.",
    };
  }

  let attempts = 0;
  const maxAttempts = 3;
  let response;
  let lastErr = null;

  while (attempts < maxAttempts) {
    const controller = new AbortController();
    const timeoutVal = 35000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutVal);
    const startTime = Date.now();
    const targetUrl = "https://api.sarvam.ai/v1/chat/completions";

    try {
      response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": sarvamKey,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        break;
      }

      const statusText = response.statusText;
      const errBody = await response.text().catch(() => "");
      lastErr = new Error(`Status ${response.status} ${statusText}: ${errBody}`);
      console.warn(`[Sarvam AI] Attempt ${attempts + 1} failed (${duration}ms): ${lastErr.message}`);
    } catch (apiErr) {
      lastErr = apiErr;
      const duration = Date.now() - startTime;
      console.error(`[Sarvam AI] Exception (${duration}ms): ${apiErr.message}`);

      if (apiErr.name === "AbortError") {
        console.error(`[Sarvam AI] Request timed out after ${timeoutVal / 1000} seconds.`);
        break;
      }
    } finally {
      clearTimeout(timeoutId);
    }
    attempts++;
    if (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
    }
  }

  if (!response || !response.ok) {
    return {
      answer: "I'm unable to contact the AI service right now. Please try again in a few moments.",
    };
  }

  try {
    let data;
    try {
      data = await response.json();
    } catch {
      return { answer: "The AI service returned an unexpected response. Please try again later." };
    }
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Sarvam AI returned an empty completions choices array.");
    }

    const choice = data?.choices?.[0];
    return {
      answer: choice?.message?.content ?? "I couldn't generate a response at the moment.",
    };
  } catch (parseErr) {
    console.error("[Sarvam AI] Response parse error:", parseErr.message);
    return { answer: "Failed to process AI response. Please try again." };
  }
};

exports.transcribeAudio = async (audioBase64, languageCode = "hi-IN") => {
  const sarvamKey = process.env.SARVAM_API_KEY;
  if (!sarvamKey) {
    throw new Error("Sarvam API key is not configured.");
  }
  if (!audioBase64) {
    throw new Error("No audio payload provided.");
  }

  const audioBuffer = Buffer.from(audioBase64, "base64");
  const fileBlob = new Blob([audioBuffer], { type: "audio/mp4" });
  const form = new FormData();
  form.append("file", fileBlob, "recording.m4a");
  form.append("model", "saaras:v3");
  form.append("language_code", languageCode);
  form.append("mode", "transcribe");

  let attempts = 0;
  const maxAttempts = 3;
  let lastErr = null;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch("https://api.sarvam.ai/speech-to-text", {
        method: "POST",
        headers: { "api-subscription-key": sarvamKey },
        body: form,
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        throw new Error(`STT API status ${response.status}: ${bodyText}`);
      }

      const data = await response.json();
      const transcript = data.transcript || data.text;
      if (!transcript) {
        throw new Error("Sarvam STT returned empty transcript.");
      }
      return transcript.trim();
    } catch (err) {
      lastErr = err;
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }
  }
  throw new Error(`Speech-to-Text transcription failed: ${lastErr.message}`);
};

const truncateForTts = (text, maxLength = Number(process.env.SARVAM_TTS_MAX_CHARS || 900)) => {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  const clipped = trimmed.slice(0, maxLength);
  const lastSentence = Math.max(clipped.lastIndexOf("."), clipped.lastIndexOf("\n"), clipped.lastIndexOf("\u0964"));
  return `${clipped.slice(0, lastSentence > 240 ? lastSentence + 1 : maxLength).trim()} Summary truncated for voice playback.`;
};

exports.synthesizeSpeech = async (text, targetLanguageCode = "hi-IN") => {
  const sarvamKey = process.env.SARVAM_API_KEY;
  if (!sarvamKey) {
    throw new Error("Sarvam API key is not configured.");
  }
  if (!text || !text.trim()) {
    throw new Error("Cannot synthesize empty text.");
  }

  let attempts = 0;
  const maxAttempts = 3;
  let lastErr = null;
  const ttsText = truncateForTts(text);

  while (attempts < maxAttempts) {
    try {
      const response = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
          "api-subscription-key": sarvamKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: ttsText,
          target_language_code: targetLanguageCode,
          model: "bulbul:v3",
          output_audio_codec: "wav",
        }),
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        throw new Error(`TTS API status ${response.status}: ${bodyText}`);
      }

      const data = await response.json();
      const audioBase64 = data.audios && data.audios[0];
      if (!audioBase64) {
        throw new Error("Sarvam TTS returned no audio data.");
      }
      return audioBase64;
    } catch (err) {
      lastErr = err;
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }
  }
  throw new Error(`Text-to-Speech synthesis failed: ${lastErr.message}`);
};
