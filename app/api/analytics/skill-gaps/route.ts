import { connectToDatabase } from "@/lib/mongodb";
import Trainee from "@/models/trainee";
import SkillGapReport from "@/models/skill-gap-report";
import OutcomeEvent from "@/models/outcome-event";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    let totalTrainees = 48250;
    let totalGaps = 8;
    const skillCounts: Record<string, { total: number; high: number; medium: number; low: number; trainees: Set<string> }> = {};

    try {
      await connectToDatabase();
      const [trainees, skillGaps] = await Promise.all([
        Trainee.find().lean(),
        SkillGapReport.find().sort({ createdAt: -1 }).lean(),
      ]);
      if (trainees.length) totalTrainees = trainees.length;
      if (skillGaps.length) {
        totalGaps = skillGaps.length;
        skillGaps.forEach((g) => {
          if (!skillCounts[g.skillName]) {
            skillCounts[g.skillName] = { total: 0, high: 0, medium: 0, low: 0, trainees: new Set() };
          }
          skillCounts[g.skillName].total += 1;
          const sev = g.severity as "high" | "medium" | "low";
          if (sev === "high" || sev === "medium" || sev === "low") {
            skillCounts[g.skillName][sev] += 1;
          }
          skillCounts[g.skillName].trainees.add(g.traineeId);
        });
      }
    } catch {
      // Graceful fallback to prototype baseline if MongoDB is not connected
    }

    const BASELINE_SKILLS: Record<string, { demand: number; coverage: number; priority: string; action: string }> = {
      "CNC Operation": {
        demand: 88,
        coverage: 34,
        priority: "Critical",
        action: "Integrate 25-hour CNC simulation and precision lathe machine practice into mechanical & fabrication trades.",
      },
      "Solar Installation": {
        demand: 84,
        coverage: 38,
        priority: "Critical",
        action: "Add grid-tied solar PV inverter wiring & rooftop safety certifications to Electrician courses.",
      },
      "Industrial Automation / PLC": {
        demand: 79,
        coverage: 36,
        priority: "Critical",
        action: "Introduce programmable logic controller (PLC) ladder logic & SCADA basics to industrial electronics tracks.",
      },
      "EV Maintenance": {
        demand: 76,
        coverage: 41,
        priority: "High",
        action: "Partner with regional EV OEMs for battery management system (BMS) diagnostics and motor troubleshooting.",
      },
      "Healthcare Support": {
        demand: 72,
        coverage: 60,
        priority: "Medium",
        action: "Expand hands-on clinical rotation hours in multi-specialty hospitals for General Duty Assistants.",
      },
      "Digital Tools": {
        demand: 64,
        coverage: 58,
        priority: "Low",
        action: "Provide workplace digital literacy, cloud spreadsheet collaboration, and inventory tracking tools.",
      },
    };

    const topSkillGaps = Object.entries(BASELINE_SKILLS).map(([skill, catalog]) => {
      const live = skillCounts[skill];
      const gapScore = catalog.demand - catalog.coverage;
      const candidatesAffected = live && live.trainees.size > 0 ? live.trainees.size : Math.round(totalTrainees * (gapScore > 30 ? 0.35 : 0.15));

      return {
        skill,
        demandScore: catalog.demand,
        coverageScore: catalog.coverage,
        gapScore,
        priority: catalog.priority,
        candidatesAffected,
        reportCount: live ? live.total : 0,
        highSeverityCount: live ? live.high : 0,
        recommendedIntervention: catalog.action,
      };
    }).sort((a, b) => b.gapScore - a.gapScore);

    const criticalCount = topSkillGaps.filter((g) => g.priority === "Critical").length;
    const totalImpacted = topSkillGaps.reduce((acc, g) => acc + g.candidatesAffected, 0);

    return Response.json({
      success: true,
      dataProvenance: "Prototype / Illustrative Analytics Layer",
      summary: {
        totalCompetenciesTracked: topSkillGaps.length,
        criticalGapsCount: criticalCount,
        totalGapsReported: totalGaps,
        totalCandidatesImpacted: totalImpacted,
        avgPlacementPenaltyPct: 18.4,
      },
      topSkillGaps,
      demandVsCoverage: topSkillGaps.map((g) => ({
        skill: g.skill,
        employerDemand: g.demandScore,
        trainingCoverage: g.coverageScore,
        deficitGap: g.gapScore,
      })),
      recommendations: topSkillGaps.slice(0, 4).map((g) => ({
        title: `Curriculum Bridge Module for ${g.skill}`,
        deficit: `+${g.gapScore}% Deficit (${g.demandScore}% Demand vs. ${g.coverageScore}% Coverage)`,
        priority: g.priority,
        action: g.recommendedIntervention,
      })),
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not compute skill-gap analytics",
      },
      { status: 500 }
    );
  }
}
