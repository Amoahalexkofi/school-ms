import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/subject-groups/subjects?classSectionId=xxx
// Returns subjects from the SubjectGroup assigned to that class/section.
// Smart School: subject_timetable → subject_group_subjects → subjects
// filtered by subject_group_class_sections.class_section_id
export async function GET(req: NextRequest) {
  const classSectionId = req.nextUrl.searchParams.get("classSectionId");
  if (!classSectionId) {
    return NextResponse.json({ error: "classSectionId required" }, { status: 400 });
  }

  const db = await getDb();

  // Find SubjectGroupSections for this class section
  const groupSections = await (db as any).subjectGroupSection.findMany({
    where: { classSectionId, isActive: true },
    include: {
      subjectGroup: {
        include: {
          subjects: {
            include: {
              subject: { select: { id: true, name: true, code: true, type: true } },
            },
          },
        },
      },
    },
  });

  if (groupSections.length === 0) {
    // No SubjectGroup assigned — return empty with a flag so UI can show guidance
    return NextResponse.json({ subjects: [], hasGroup: false });
  }

  // Collect unique subjects across all assigned groups (usually just one)
  const seen = new Set<string>();
  const subjects: any[] = [];
  for (const gs of groupSections) {
    for (const sgs of gs.subjectGroup.subjects) {
      if (!seen.has(sgs.subject.id)) {
        seen.add(sgs.subject.id);
        subjects.push(sgs.subject);
      }
    }
  }

  subjects.sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json({ subjects, hasGroup: true });
}
