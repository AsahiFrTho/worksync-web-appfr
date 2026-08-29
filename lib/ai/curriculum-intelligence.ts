import "server-only";
import { Type } from "@google/genai";
import { getGeminiClient } from "./gemini";
import { getCurriculumInsights } from "./curriculum-evidence";
import type { ICurriculumPolicyMemo } from "./types";
import type { CurriculumInsight } from "@/lib/compute";

const curriculumIntelligenceSchema = {
  type: Type.OBJECT,
  properties: {
    course: {
      type: Type.STRING,
      description: "Exact course/trade name matching the input, e.g. Electrician.",
    },
    generatedAt: {
      type: Type.STRING,
      description: "ISO 8601 timestamp string when the analysis was performed.",
    },
    headline: {
      type: Type.STRING,
      description: "One-sentence summary a policymaker scanning many courses would read first.",
    },
    diagnosis: {
      type: Type.STRING,
      description: "Why this course was flagged, citing the exact reported skill and the exact employment/wage numbers provided.",
    },
    recommendedAction: {
      type: Type.STRING,
      description: "A concrete, specific curriculum fix a training provider could implement -- not generic advice.",
    },
    predictedImpact: {
      type: Type.STRING,
      description: "Plain-language framing of the employment-rate and wage deltas as the upside of fixing the gap.",
    },
    confidence: {
      type: Type.STRING,
      enum: ["High", "Medium", "Low"],
      description: "How much weight to put on this insight given how many learners and reports it's based on.",
    },
    evidenceUsed: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of the explicit input fields and values actually used to write this memo.",
    },
  },
  required: [
    "course",
    "generatedAt",
    "headline",
    "diagnosis",
    "recommendedAction",
    "predictedImpact",
    "confidence",
    "evidenceUsed",
  ],
};

const VALID_CONFIDENCE = ["High", "Medium", "Low"] as const;

// Deliberately the ONLY place Gemini is given the evidence. The model is
// handed the exact CurriculumInsight object our own deterministic engine
// (lib/compute.ts's generateCurriculumInsights()) already computed --
// never raw database rows, and never asked to compute the deltas itself.
// That keeps Gemini's job strictly "write clearly about numbers we already
// trust", not "produce numbers we then have to trust blindly".
function buildPrompt(insight: CurriculumInsight): string {
  return `You are the WorkSync AI Curriculum Intelligence Engine for vocational skilling policy in Maharashtra.
A deterministic analysis engine (not you) has already computed the following verified, aggregate statistics
by cross-referencing employer/learner/trainer-reported skill-gap complaints against real employment and wage outcomes:

${JSON.stringify(insight, null, 2)}

CRITICAL GROUNDING RULES:
1. The provided JSON is authoritative, pre-computed aggregate statistics -- not opinions, and not raw personal data.
2. DO NOT invent, hallucinate, or extrapolate any skill name, course name, number, or percentage not present in the input.
3. Every specific number you cite (reportCount, employmentRateDelta, wageDelta, etc.) MUST match the input exactly.
4. If affectedLearners or reportCount is small (roughly under 5), reflect that with "Medium" or "Low" confidence rather than "High".
5. Frame predictedImpact constructively: describe the employment/wage gap as what could be GAINED by fixing it, not just a deficit.
6. The output must strictly follow the requested JSON schema.
7. Return ONLY valid JSON matching the schema with no extra commentary or markdown text outside JSON.`;
}

function sanitizeResult(
  raw: any,
  fallbackCourse: string,
  source: "gemini" | "evidence-fallback" = "gemini"
): ICurriculumPolicyMemo {
  const course =
    typeof raw?.course === "string" && raw.course.trim() ? raw.course.trim() : fallbackCourse;

  const generatedAt =
    typeof raw?.generatedAt === "string" && !isNaN(Date.parse(raw.generatedAt))
      ? raw.generatedAt
      : new Date().toISOString();

  const headline =
    typeof raw?.headline === "string" && raw.headline.trim()
      ? raw.headline.trim()
      : `${course} has a reported skill gap worth reviewing.`;

  const diagnosis =
    typeof raw?.diagnosis === "string" && raw.diagnosis.trim()
      ? raw.diagnosis.trim()
      : "Diagnosis synthesized from reported skill gaps and outcome data.";

  const recommendedAction =
    typeof raw?.recommendedAction === "string" && raw.recommendedAction.trim()
      ? raw.recommendedAction.trim()
      : "Review the curriculum module most closely tied to the reported skill.";

  const predictedImpact =
    typeof raw?.predictedImpact === "string" && raw.predictedImpact.trim()
      ? raw.predictedImpact.trim()
      : "Closing this gap is expected to improve employment and wage outcomes for this course's learners.";

  const confidence = VALID_CONFIDENCE.includes(raw?.confidence) ? raw.confidence : "Medium";

  const evidenceUsed: string[] = Array.isArray(raw?.evidenceUsed)
    ? raw.evidenceUsed.filter((item: any) => typeof item === "string" && item.trim().length > 0)
    : ["topSkillGap", "employmentRateDelta", "wageDelta"];

  return {
    course,
    generatedAt,
    headline,
    diagnosis,
    recommendedAction,
    predictedImpact,
    confidence,
    evidenceUsed,
    source,
  };
}

/**
 * Deterministically builds a Curriculum Policy Memo straight from the
 * CurriculumInsight our own compute engine already produced, with zero
 * dependency on Gemini. Used when the API key is missing or Gemini is
 * rate-limited/unavailable -- the "wow feature" degrades to plain,
 * still-accurate sentences instead of failing on stage.
 */
export function generateCurriculumFallback(insight: CurriculumInsight): ICurriculumPolicyMemo {
  const { course, topSkillGap, severity, reportCount, affectedLearners, employmentRateDelta, wageDelta } =
    insight;

  const headline =
    severity === "high"
      ? `${course}: "${topSkillGap}" gap is measurably hurting outcomes -- act this term.`
      : severity === "medium"
        ? `${course}: "${topSkillGap}" gap is worth a curriculum review.`
        : `${course}: "${topSkillGap}" is reported but not yet hurting outcomes.`;

  const impactParts: string[] = [];
  if (employmentRateDelta < 0) {
    impactParts.push(`${Math.abs(employmentRateDelta)} percentage points lower employment`);
  }
  if (wageDelta < 0) {
    impactParts.push(`₹${Math.abs(wageDelta).toLocaleString("en-IN")} lower average monthly wage`);
  }
  const diagnosis = impactParts.length
    ? `${affectedLearners} tracked learners in ${course} report "${topSkillGap}" missing ${reportCount} time${reportCount === 1 ? "" : "s"}. This course currently shows ${impactParts.join(" and ")} than the rest of the tracked cohort.`
    : `${affectedLearners} tracked learners in ${course} report "${topSkillGap}" missing ${reportCount} time${reportCount === 1 ? "" : "s"}, though no measurable outcome gap has appeared yet.`;

  const predictedImpact = impactParts.length
    ? `Closing this gap could realistically bring ${course} back in line with the rest of the cohort -- roughly ${Math.abs(employmentRateDelta)} employment points and ₹${Math.abs(wageDelta).toLocaleString("en-IN")}/month in upside per learner, based on current tracked data.`
    : `No outcome upside is measurable yet, but fixing this now is a low-cost way to prevent one from appearing as more batches graduate.`;

  const confidence: ICurriculumPolicyMemo["confidence"] =
    affectedLearners >= 8 && reportCount >= 5 ? "High" : affectedLearners >= 4 && reportCount >= 3 ? "Medium" : "Low";

  return {
    course,
    generatedAt: new Date().toISOString(),
    headline,
    diagnosis,
    recommendedAction: insight.recommendedFix,
    predictedImpact,
    confidence,
    evidenceUsed: [
      `topSkillGap: ${topSkillGap} (${reportCount} reports, severity ${severity})`,
      `affectedLearners: ${affectedLearners}`,
      `employmentRateDelta: ${employmentRateDelta} pts vs. rest of cohort`,
      `wageDelta: \u20b9${wageDelta} vs. rest of cohort`,
    ],
    source: "evidence-fallback",
  };
}

/**
 * Generates a plain-English Curriculum Policy Memo for a given course.
 *
 * Resilience architecture (identical shape to generateCareerIntelligence()
 * in lib/ai/career-intelligence.ts, deliberately -- one pattern for every
 * AI feature in this app):
 * 1. Reads authoritative CurriculumInsight[] from the deterministic engine.
 * 2. Primary Path: Calls Gemini with structured JSON Schema, grounded only
 *    in the one insight object for the requested course.
 * 3. Fallback Path: if Gemini fails (missing key, rate limit, quota,
 *    provider error), generates the same memo shape deterministically.
 *
 * @param courseName Course/trade name, e.g. "Electrician"
 * @returns Structured memo and source metadata, or null if that course has
 *          no curriculum insight (e.g. too few learners, or no gaps reported)
 */
export async function generateCurriculumIntelligence(
  courseName: string
): Promise<{ result: ICurriculumPolicyMemo | null; notFound: boolean; source: "gemini" | "evidence-fallback" }> {
  if (!courseName || typeof courseName !== "string" || !courseName.trim()) {
    return { result: null, notFound: true, source: "gemini" };
  }

  const normalizedCourse = courseName.trim();

  // 1. Fetch the deterministic insight for this course (Read-Only)
  const insights = await getCurriculumInsights();
  const insight = insights.find((i) => i.course.toLowerCase() === normalizedCourse.toLowerCase());
  if (!insight) {
    return { result: null, notFound: true, source: "gemini" };
  }

  // 2. Try Primary Gemini Integration
  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = buildPrompt(insight);

      const response = await client.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: curriculumIntelligenceSchema,
          temperature: 0.1,
        },
      });

      const responseText = response.text;
      if (responseText && responseText.trim()) {
        const cleanJson = responseText
          .replace(/^\`\`\`json\s*/i, "")
          .replace(/^\`\`\`\s*/i, "")
          .replace(/\s*\`\`\`$/i, "")
          .trim();

        const parsedData = JSON.parse(cleanJson);
        const sanitized = sanitizeResult(parsedData, insight.course, "gemini");
        return { result: sanitized, notFound: false, source: "gemini" };
      }
    } catch (error) {
      const safeErrorMessage = error instanceof Error ? error.message : "Unknown Gemini API error";

      const isQuotaExceeded =
        safeErrorMessage.includes("429") ||
        safeErrorMessage.includes("RESOURCE_EXHAUSTED") ||
        safeErrorMessage.includes("quota") ||
        safeErrorMessage.includes("rate");

      console.warn(
        `[CurriculumIntelligence] Gemini API ${isQuotaExceeded ? "Quota Limit (429)" : "error"} for course ${normalizedCourse}: ${safeErrorMessage}. Engaging deterministic fallback.`
      );
    }
  } else {
    console.info(
      `[CurriculumIntelligence] GEMINI_API_KEY not configured. Generating deterministic fallback for course ${normalizedCourse}.`
    );
  }

  // 3. Fallback Path: deterministic memo straight from the compute engine's own numbers
  const fallbackResult = generateCurriculumFallback(insight);
  return { result: fallbackResult, notFound: false, source: "evidence-fallback" };
}
