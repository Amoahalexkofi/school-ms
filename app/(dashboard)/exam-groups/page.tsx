import { redirect } from "next/navigation";

// The exam management flow lives at /exams (list, create, schedules, marks,
// results). This legacy route now redirects there.
export default function ExamGroupsRedirect() {
  redirect("/exams");
}
