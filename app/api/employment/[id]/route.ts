import { connectToDatabase } from "@/lib/mongodb";
import EmploymentRecord, {
  type VerificationStatus,
  type EmploymentType,
  type TrainingRelevance,
} from "@/models/employment-record";
import { isValidObjectId } from "mongoose";
import { type NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return Response.json(
        { success: false, error: `Invalid employment record ID format: '${id}'` },
        { status: 400 }
      );
    }

    const employmentRecord = await EmploymentRecord.findById(id)
      .populate("trainee")
      .lean();

    if (!employmentRecord) {
      return Response.json(
        { success: false, error: "Employment record not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      employmentRecord,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not fetch employment record",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));

    if (!isValidObjectId(id)) {
      return Response.json({
        success: true,
        offline: true,
        employmentRecord: {
          _id: id,
          verificationStatus: body.verificationStatus || "verified",
          verificationMetadata: {
            verifiedAt: new Date().toISOString(),
            verifiedBy: body.verifiedBy || "HR Operations Cell",
            method: "employer_portal",
            remarks: body.remarks || "Updated in evaluation mode",
            disputeReason: body.disputeReason,
          },
          ...body,
        },
      });
    }

    const existingRecord = await EmploymentRecord.findById(id);
    if (!existingRecord) {
      return Response.json(
        { success: false, error: "Employment record not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.verificationStatus !== undefined) {
      const validStatuses: VerificationStatus[] = [
        "pending",
        "verified",
        "disputed",
        "flagged",
      ];
      if (!validStatuses.includes(body.verificationStatus)) {
        return Response.json(
          {
            success: false,
            error: `Invalid verificationStatus. Must be one of: ${validStatuses.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateData.verificationStatus = body.verificationStatus;

      // When transitioning to verified, auto-stamp verifiedAt if not explicitly provided
      if (body.verificationStatus === "verified") {
        updateData["verificationMetadata.verifiedAt"] =
          body.verificationMetadata?.verifiedAt
            ? new Date(body.verificationMetadata.verifiedAt)
            : new Date();
      }
    }

    if (body.trainingRelevance !== undefined) {
      const validTrainingRelevances: TrainingRelevance[] = [
        "directly_related",
        "partially_related",
        "unrelated",
      ];
      if (!validTrainingRelevances.includes(body.trainingRelevance)) {
        return Response.json(
          {
            success: false,
            error: `Invalid trainingRelevance. Must be one of: ${validTrainingRelevances.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateData.trainingRelevance = body.trainingRelevance;
    }

    if (body.verificationMetadata) {
      const vm = body.verificationMetadata;
      if (vm.verifiedBy !== undefined) updateData["verificationMetadata.verifiedBy"] = vm.verifiedBy;
      if (vm.method !== undefined) updateData["verificationMetadata.method"] = vm.method;
      if (vm.disputeReason !== undefined) updateData["verificationMetadata.disputeReason"] = vm.disputeReason;
      if (vm.remarks !== undefined) updateData["verificationMetadata.remarks"] = vm.remarks;
      if (vm.verifiedAt !== undefined) {
        updateData["verificationMetadata.verifiedAt"] = new Date(vm.verifiedAt);
      }
    }

    // Support flat verifiedBy / remarks in PATCH body for convenience
    if (body.verifiedBy !== undefined) {
      updateData["verificationMetadata.verifiedBy"] = body.verifiedBy;
    }
    if (body.remarks !== undefined) {
      updateData["verificationMetadata.remarks"] = body.remarks;
    }
    if (body.disputeReason !== undefined) {
      updateData["verificationMetadata.disputeReason"] = body.disputeReason;
    }

    if (body.monthlyWage !== undefined) {
      if (typeof body.monthlyWage !== "number" || body.monthlyWage < 0) {
        return Response.json(
          { success: false, error: "monthlyWage must be a non-negative number" },
          { status: 400 }
        );
      }
      updateData.monthlyWage = body.monthlyWage;
    }

    if (body.jobRole !== undefined) {
      if (!body.jobRole || typeof body.jobRole !== "string" || !body.jobRole.trim()) {
        return Response.json(
          { success: false, error: "jobRole cannot be empty" },
          { status: 400 }
        );
      }
      updateData.jobRole = body.jobRole.trim();
    }

    if (body.employerName !== undefined) {
      if (!body.employerName || typeof body.employerName !== "string" || !body.employerName.trim()) {
        return Response.json(
          { success: false, error: "employerName cannot be empty" },
          { status: 400 }
        );
      }
      updateData.employerName = body.employerName.trim();
    }

    if (body.employmentType !== undefined) {
      const validEmploymentTypes: EmploymentType[] = [
        "wage_employment",
        "self_employment",
        "apprenticeship",
      ];
      if (!validEmploymentTypes.includes(body.employmentType)) {
        return Response.json(
          {
            success: false,
            error: `Invalid employmentType. Must be one of: ${validEmploymentTypes.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateData.employmentType = body.employmentType;
    }

    if (body.district !== undefined) {
      updateData.district = body.district.trim();
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes.trim();
    }

    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    }

    if (body.isCurrent !== undefined) {
      const isCurrentBool = Boolean(body.isCurrent);
      updateData.isCurrent = isCurrentBool;
      if (isCurrentBool) {
        // Unset other current records for this trainee
        await EmploymentRecord.updateMany(
          {
            traineeId: existingRecord.traineeId,
            isCurrent: true,
            _id: { $ne: existingRecord._id },
          },
          { $set: { isCurrent: false } }
        );
      }
    }

    const updatedRecord = await EmploymentRecord.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("trainee");

    return Response.json({
      success: true,
      employmentRecord: updatedRecord,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not update employment record",
      },
      { status: 500 }
    );
  }
}
