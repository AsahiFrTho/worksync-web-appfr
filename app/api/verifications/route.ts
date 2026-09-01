import { connectToDatabase } from "@/lib/mongodb";
import EmployerVerification from "@/models/employer-verification";
import { type NextRequest } from "next/server";
import { getFallbackProgramData } from "@/lib/seed-data";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const traineeId = request.nextUrl.searchParams.get("traineeId");
    const status = request.nextUrl.searchParams.get("status");
    const query: Record<string, unknown> = {};
    if (traineeId) query.traineeId = traineeId.trim();
    if (status) query.verificationStatus = status.trim();

    const verifications = await EmployerVerification.find(query)
      .sort({ startDate: -1, createdAt: -1 })
      .lean();

    if (verifications.length === 0 && Object.keys(query).length === 0) {
      const fallback = getFallbackProgramData();
      return Response.json({ success: true, count: fallback.verifications.length, verifications: fallback.verifications });
    }

    return Response.json({ success: true, count: verifications.length, verifications });
  } catch {
    const fallback = getFallbackProgramData();
    return Response.json({ success: true, count: fallback.verifications.length, verifications: fallback.verifications });
  }
}