import { connectToDatabase } from "@/lib/mongodb";
import EmployerVerification from "@/models/employer-verification";
import { type NextRequest } from "next/server";

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

    return Response.json({ success: true, count: verifications.length, verifications });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Could not load employer verifications",
      },
      { status: 500 }
    );
  }
}