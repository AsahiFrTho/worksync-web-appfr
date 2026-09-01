import { connectToDatabase } from "@/lib/mongodb";
import Trainee from "@/models/trainee";
import { getFallbackProgramData } from "@/lib/seed-data";

export async function GET() {
  try {
    await connectToDatabase();

    const trainees = await Trainee.find()
      .sort({ createdAt: -1 })
      .lean();

    if (trainees.length === 0) {
      const fallback = getFallbackProgramData();
      return Response.json({ success: true, trainees: fallback.trainees });
    }

    return Response.json({ success: true, trainees });
  } catch {
    const fallback = getFallbackProgramData();
    return Response.json({ success: true, trainees: fallback.trainees });
  }
}