# Screen-by-Screen Parity Sweep — Skula vs Smart School v7.1.0

_2026-06-22. Done manually by reading the actual Smart School controllers + views
(`~/Downloads/smart-school-school-7.1.0 (1)/smart_school_src`) against our code.
Sub-agents were sandbox-blocked from the reference path, so this is hand-verified.
Scope: the four demo-critical modules — Students, Attendance, Exams/Marks, Fees._

Legend: ✅ match · 🟡 partial · ❌ missing

---

## STUDENTS

| Screen | Smart School has | Ours | Verdict |
|---|---|---|---|
_Updated 2026-07-02 (commit 03f8e8a): fresh two-sided audit + gap closure._

| Screen | Smart School has | Ours | Verdict |
|---|---|---|---|
| Student list / search | **Class + Section dropdowns** AND keyword; category & gender criteria | class + section + keyword; excludes disabled (like SS) | ✅ |
| List columns | adm no, name, class/section, roll, mobile, gender, DOB | adm no, name, class/section, roll, mobile, gender, status | ✅ |
| Row actions | view, edit, **collect fees**, phone, login detail, disable | view (edit/delete/disable on profile) | 🟡 no inline "collect fees" |
| Add / Edit student | full multi-section form | present (`/students/new`, `[id]`) | ✅ |
| Profile (studentShow) | tabbed profile | present (`/students/[id]`) | ✅ |
| Promote | pass/fail + continue/leave + → alumni (Stdtransfer) | same: per-student radios; fail repeats the class, leave flags isLeave+isAlumni on the current session (no new row); roster excludes already-promoted (438aa17) | ✅ |
| **CSV Import** | `import` screen + sample; creates student + parent logins | screen + sample; creates student + parent logins, temp passwords shown once | ✅ |
| **Disabled students** | list + disable-with-reason (master) + enable; **login blocked** | list + reason-master dropdown + date + note; manage-reasons UI; login blocked (User.isActive + Student.isActive in authorize) | ✅ |
| **Bulk delete / Bulk email** | both; delete cascades to users + orphan parents | both; same cascade; enrolled students skipped | ✅ |
| **Multi-class assign** | `multiclass` — multiple student_session rows per session | `/students/multiclass` + sync API; primary = defaultLogin; removal blocked if membership has attendance/fee records | ✅ |
| Profile field settings | `profilesetting` — which fields student/parent may self-edit in their portal | — | ❌ deferred: we have no portal self-edit feature for it to gate |

## ATTENDANCE

_Updated 2026-07-05 (commit 847bb26): fresh two-sided audit + gap closure._

| Screen | Smart School has | Ours | Verdict |
|---|---|---|---|
| Student attendance marking | Class + Section + Date → roster grid; status P/A/L/Half-day/Holiday | Session + Class/Section + Date → grid; same statuses; transactional save | ✅ |
| Save + SMS/email on absent | yes | notify-guardians toggle → SMS + WhatsApp | ✅ |
| Staff attendance | by date | present + now linked from /attendance header | ✅ |
| **Period (subject-wise) attendance** | Subjectattendence: class+section+date → timetable period → roster; absent notify with period context | `/attendance/subject` Mark tab: same flow off TimetableSlot; upsert (studentSession, slot, date); period-named absent SMS/WhatsApp | ✅ |
| Period attendance by-date report | students × periods matrix, letter per cell | By-Date Report tab, same matrix + legend | ✅ |
| Attendance report | summary + monthly 1–31 grid | both (Summary/Monthly tabs); % divisor now consistent across all three report paths | ✅ |
| **Student apply leave** | user/apply_leave (student portal) + admin approve (class/subject-teacher gated) | `/my-leave` self-apply (session-scoped) + existing staff `/leave` approve tab | ✅ |
| Day-wise vs period-wise mode toggle | sch_settings.attendence_type flips menus/portal | — both pages offered side by side | 🟡 deferred: no global mode switch; Ghana schools are day-wise-first and both screens coexist |
| Biometric / QR attendance | biometric endpoint + schedules (QR not shipped) | — | ❌ deferred (hardware-dependent; schedules table exists unused) |
| Period monthly reports (per-subject grid) | reportbymonth / reportbymonthstudent | — | 🟡 deferred: by-date matrix + day-wise monthly grid cover the demo need |

## EXAMS / MARKS

_Updated 2026-07-03 (commit 6b5d813): fresh two-sided audit + gap closure._

| Screen | Smart School has | Ours | Verdict |
|---|---|---|---|
| Exam groups / exams | CRUD | present | ✅ |
| Exam schedule | class/section/subject/date/room/marks | present (`exams/[id]`; roomNo PATCH fixed) | ✅ |
| Marks entry | exam+class+section+subject → grid (obtained, note) | present; GES SBA component mode | ✅ |
| Results | total, %, grade, rank, division, pass/fail; publish | all present (MarkDivision-driven division, GradeRange grades) | ✅ |
| **CSV mark import** | sample + upload adm_no,status,marks,note fills grid | same client-side flow; supports SBA component columns | ✅ |
| Grades / Mark divisions admin | dedicated pages w/ edit | `/settings/grading` add + **inline edit** + soft-delete | ✅ |
| Marksheet / Admit card print | designable templates + PDF + email | template designer + server PDF + email; screen now uses persisted ranks + TermReport remarks (matches PDF) | ✅ |
| Assign students to exam | roster subset per exam (exam_group_class_batch_exam_students) | `/exams/[id]/students` checkbox roster (ExamGroupStudent); no roster = whole class; filters marks + term report | ✅ |
| Persisted/editable rank | stored + admin override | StudentExamRank, editable on results grid | ✅ |
| Result SMS/email on publish | mailsms 'exam_result' announcement on publish | publish flip fires email + SMS/WhatsApp announcement to students+guardians | ✅ |
| Teacher remark | per-student per-exam textarea grid → marksheet | TermReport classTeacherRemark/headTeacherRemark grid → PDF + on-screen card | ✅ (equivalent) |
| Connect/weighted exams | link exams w/ weightages summing 100, combined % column | — | ❌ deferred: GES SBA weights already cover the weighted CA+exam use case for our market |

## FEES

| Screen | Smart School has | Ours | Verdict |
|---|---|---|---|
| Collect search | class+section roster AND keyword | **both** ✅ | ✅ |
| Collect page fields | amount, discount, fine, payment mode, date, note, balance, print | **all present** ✅ | ✅ |
| Per-fee-type line collection | each fee_groups_feetype collected separately | **per-type Collect + balance** ✅ | ✅ |
| Discount applied at collection | `student_applied_discounts` (discountIds) | **discount picker sends discountIds** ✅ | ✅ |
| Fee setup (type/group/master) | CRUD | present | ✅ |
| Discount assign | assign (NO approval in base v7.1.0 — earlier "approval" gap was a false alarm) | assign | ✅ |
| Fee reminder | config + sends | **config + tenant-aware sending cron** ✅ | ✅ |
| Carry forward | yes | present | ✅ |
| Reports | due, daily collection, balance, online-fees | **Balance/Due + Daily Collection** ✅; online-fees list still marginal (online shows in Daily by mode) | 🟡 (minor) |

**FEES MODULE: ~100% parity.** Only marginal remaining: a dedicated online-fees-only report (online payments already appear in the Daily report by payment mode).

---

## Ranked fix list (by demo impact)

1. **Students list: add Class + Section filter** — exact same omission as fees was; highest-visibility, recurring complaint. (quick — mirror the fees fix)
2. **Fees collect page: add Fine/late-fee + Discount selector (+ payment date)** — fees is the headline feature; fine & discount are core to real collection. (API already supports discountIds; add fine to API.)
3. **Exam results: show rank + division + grade** and wire the grade system to computation.
4. **Students: CSV import, disabled-students list (disable-reason/enable), bulk delete/email, multi-class.**
5. **Attendance: absent SMS/email toggle, monthly grid report, subject-wise attendance page.**
6. **Fees: discount approval workflow, reminder-sending cron, daily/class-wise/type-wise reports.**
