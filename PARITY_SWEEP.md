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
| Student list / search | **Class + Section dropdowns** AND keyword; category & gender criteria | keyword search **only** | 🟡 **no class/section filter** |
| List columns | adm no, name, class/section, roll, mobile, gender, DOB | adm no, name, class/section, roll, mobile, gender, status | ✅ |
| Row actions | view, edit, **collect fees**, phone, login detail, disable | view (edit/delete on profile) | 🟡 no inline "collect fees"/disable |
| Add / Edit student | full multi-section form | present (`/students/new`, `[id]`) | ✅ |
| Profile (studentShow) | tabbed profile | present (`/students/[id]`) | ✅ |
| Promote | pass/fail + continue/leave + → alumni | plain class move | 🟡 (known) |
| **CSV Import** | `import` screen + sample | — | ❌ missing |
| **Disabled students** | list + disable-with-reason + enable | — | ❌ missing |
| **Bulk delete / Bulk email** | both | — | ❌ missing |
| **Multi-class assign** | `multiclass` | — | ❌ missing |
| Profile field settings | `profilesetting` | — | ❌ missing |

## ATTENDANCE

| Screen | Smart School has | Ours | Verdict |
|---|---|---|---|
| Student attendance marking | Class + Section + Date → roster grid; status P/A/L/Half-day/Holiday | Session + Class/Section + Date → grid; same statuses | ✅ |
| Save + **SMS/email on absent** | yes | save only, **no notify toggle** | 🟡 |
| Staff attendance | by date | present (`/attendance/staff`) | ✅ |
| **Subject-wise attendance** | dedicated screen | API only, **no page** | ❌ no UI |
| Attendance report | monthly 1–31 per-student grid + filters | basic report (half-day % now consistent) | 🟡 no monthly grid |

## EXAMS / MARKS

| Screen | Smart School has | Ours | Verdict |
|---|---|---|---|
| Exam groups / exams | CRUD | present | ✅ |
| Exam schedule | class/section/subject/date/room/marks | present (`exams/[id]`: session, class/section, subject, date, room, times, full/passing) | ✅ |
| Marks entry | exam+class+section+subject → grid (obtained, note) | present (class/section/subject) | ✅ |
| Results | columns: total, %, **grade, rank, division, pass/fail**; publish | total/%/publish; **no rank, no division, grade system disconnected** | 🟡 |
| **CSV mark import** | yes (download sample + upload adm_no,attendance,marks,note) | — | ❌ |
| Grades / Mark divisions admin | dedicated pages | API only, **no page**; divisions hardcoded `80/60/45/33`, DB table unused | ❌ inert/fake |
| Marksheet / Admit card print | designable templates + PDF + email | single hardcoded layout, browser print | 🟡 |
| Assign students to exam | pick who sits the exam | auto-enroll all | ❌ no screen |
| Persisted/editable rank | stored + admin override | recomputed by % each load | 🟡 |
| Result SMS/email on publish | yes | flag flip only | ❌ |
| Connect/weighted exams, teacher remark, rank report | yes | — | ❌ |

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
