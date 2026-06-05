import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

const GROUPS = [
  { id: 1,  name: "Student Information",  shortCode: "student_information" },
  { id: 2,  name: "Fees Collection",       shortCode: "fees_collection" },
  { id: 3,  name: "Income",                shortCode: "income" },
  { id: 4,  name: "Expense",               shortCode: "expense" },
  { id: 5,  name: "Student Attendance",    shortCode: "student_attendance" },
  { id: 6,  name: "Examination",           shortCode: "examination" },
  { id: 7,  name: "Academics",             shortCode: "academics" },
  { id: 8,  name: "Download Center",       shortCode: "download_center" },
  { id: 9,  name: "Library",               shortCode: "library" },
  { id: 10, name: "Inventory",             shortCode: "inventory" },
  { id: 11, name: "Transport",             shortCode: "transport" },
  { id: 12, name: "Hostel",                shortCode: "hostel" },
  { id: 13, name: "Communicate",           shortCode: "communicate" },
  { id: 14, name: "Reports",               shortCode: "reports" },
  { id: 15, name: "System Settings",       shortCode: "system_settings" },
  { id: 17, name: "Front Office",          shortCode: "front_office" },
  { id: 18, name: "Human Resource",        shortCode: "human_resource" },
  { id: 19, name: "Homework",              shortCode: "homework" },
  { id: 20, name: "Certificate",           shortCode: "certificate" },
  { id: 21, name: "Calendar",              shortCode: "calendar_to_do_list" },
  { id: 22, name: "Dashboard & Widgets",   shortCode: "dashboard_and_widgets" },
  { id: 23, name: "Online Examination",    shortCode: "online_examination" },
  { id: 25, name: "Chat",                  shortCode: "chat" },
  { id: 28, name: "Alumni",                shortCode: "alumni" },
  { id: 29, name: "Lesson Plan",           shortCode: "lesson_plan" },
  { id: 30, name: "Annual Calendar",       shortCode: "annual_calendar" },
];

const CATEGORIES = [
  // Student Information (1)
  { id: 1,   g: 1,  name: "Student",                        code: "student",                        v:1, a:1, e:1, d:1 },
  { id: 2,   g: 1,  name: "Import Student",                 code: "import_student",                 v:1, a:0, e:0, d:0 },
  { id: 3,   g: 1,  name: "Student Categories",             code: "student_categories",             v:1, a:1, e:1, d:1 },
  { id: 4,   g: 1,  name: "Student Houses",                 code: "student_houses",                 v:1, a:1, e:1, d:1 },
  { id: 107, g: 1,  name: "Disable Student",                code: "disable_student",                v:1, a:0, e:0, d:0 },
  // Fees Collection (2)
  { id: 5,   g: 2,  name: "Collect Fees",                   code: "collect_fees",                   v:1, a:1, e:0, d:1 },
  { id: 6,   g: 2,  name: "Fees Carry Forward",             code: "fees_carry_forward",             v:1, a:0, e:0, d:0 },
  { id: 7,   g: 2,  name: "Fees Master",                    code: "fees_master",                    v:1, a:1, e:1, d:1 },
  { id: 8,   g: 2,  name: "Fees Group",                     code: "fees_group",                     v:1, a:1, e:1, d:1 },
  { id: 68,  g: 2,  name: "Fees Group Assign",              code: "fees_group_assign",              v:1, a:0, e:0, d:0 },
  { id: 69,  g: 2,  name: "Fees Type",                      code: "fees_type",                      v:1, a:1, e:1, d:1 },
  { id: 70,  g: 2,  name: "Fees Discount",                  code: "fees_discount",                  v:1, a:1, e:1, d:1 },
  { id: 73,  g: 2,  name: "Search Fees Payment",            code: "search_fees_payment",            v:1, a:0, e:0, d:0 },
  { id: 74,  g: 2,  name: "Search Due Fees",                code: "search_due_fees",                v:1, a:0, e:0, d:0 },
  // Income (3)
  { id: 9,   g: 3,  name: "Income",                         code: "income",                         v:1, a:1, e:1, d:1 },
  { id: 10,  g: 3,  name: "Income Head",                    code: "income_head",                    v:1, a:1, e:1, d:1 },
  { id: 11,  g: 3,  name: "Search Income",                  code: "search_income",                  v:1, a:0, e:0, d:0 },
  // Expense (4)
  { id: 12,  g: 4,  name: "Expense",                        code: "expense",                        v:1, a:1, e:1, d:1 },
  { id: 13,  g: 4,  name: "Expense Head",                   code: "expense_head",                   v:1, a:1, e:1, d:1 },
  { id: 14,  g: 4,  name: "Search Expense",                 code: "search_expense",                 v:1, a:0, e:0, d:0 },
  // Student Attendance (5)
  { id: 15,  g: 5,  name: "Student Attendance",             code: "student_attendance",             v:1, a:1, e:1, d:0 },
  { id: 122, g: 5,  name: "Attendance By Date",             code: "attendance_by_date",             v:1, a:0, e:0, d:0 },
  // Examination (6)
  { id: 20,  g: 6,  name: "Marks Grade",                    code: "marks_grade",                    v:1, a:1, e:1, d:1 },
  { id: 137, g: 6,  name: "Exam Group",                     code: "exam_group",                     v:1, a:1, e:1, d:1 },
  { id: 141, g: 6,  name: "Design Admit Card",              code: "design_admit_card",              v:1, a:1, e:1, d:1 },
  { id: 142, g: 6,  name: "Print Admit Card",               code: "print_admit_card",               v:1, a:0, e:0, d:0 },
  { id: 143, g: 6,  name: "Design Marksheet",               code: "design_marksheet",               v:1, a:1, e:1, d:1 },
  { id: 144, g: 6,  name: "Print Marksheet",                code: "print_marksheet",                v:1, a:0, e:0, d:0 },
  // Academics (7)
  { id: 21,  g: 7,  name: "Class Timetable",                code: "class_timetable",                v:1, a:0, e:1, d:0 },
  { id: 23,  g: 7,  name: "Subject",                        code: "subject",                        v:1, a:1, e:1, d:1 },
  { id: 24,  g: 7,  name: "Class",                          code: "class",                          v:1, a:1, e:1, d:1 },
  { id: 25,  g: 7,  name: "Section",                        code: "section",                        v:1, a:1, e:1, d:1 },
  { id: 26,  g: 7,  name: "Promote Student",                code: "promote_student",                v:1, a:0, e:0, d:0 },
  { id: 77,  g: 7,  name: "Assign Class Teacher",           code: "assign_class_teacher",           v:1, a:1, e:1, d:1 },
  // Library (9)
  { id: 28,  g: 9,  name: "Books List",                     code: "books",                          v:1, a:1, e:1, d:1 },
  { id: 29,  g: 9,  name: "Issue Return",                   code: "issue_return",                   v:1, a:0, e:0, d:0 },
  // Inventory (10)
  { id: 31,  g: 10, name: "Issue Item",                     code: "issue_item",                     v:1, a:1, e:1, d:1 },
  { id: 32,  g: 10, name: "Add Item Stock",                 code: "item_stock",                     v:1, a:1, e:1, d:1 },
  { id: 33,  g: 10, name: "Add Item",                       code: "item",                           v:1, a:1, e:1, d:1 },
  { id: 34,  g: 10, name: "Item Store",                     code: "store",                          v:1, a:1, e:1, d:1 },
  { id: 35,  g: 10, name: "Item Supplier",                  code: "supplier",                       v:1, a:1, e:1, d:1 },
  { id: 104, g: 10, name: "Item Category",                  code: "item_category",                  v:1, a:1, e:1, d:1 },
  // Transport (11)
  { id: 37,  g: 11, name: "Routes",                         code: "routes",                         v:1, a:1, e:1, d:1 },
  { id: 38,  g: 11, name: "Vehicle",                        code: "vehicle",                        v:1, a:1, e:1, d:1 },
  { id: 39,  g: 11, name: "Assign Vehicle",                 code: "assign_vehicle",                 v:1, a:1, e:1, d:1 },
  // Hostel (12)
  { id: 40,  g: 12, name: "Hostel",                         code: "hostel",                         v:1, a:1, e:1, d:1 },
  { id: 41,  g: 12, name: "Room Type",                      code: "room_type",                      v:1, a:1, e:1, d:1 },
  { id: 42,  g: 12, name: "Hostel Rooms",                   code: "hostel_rooms",                   v:1, a:1, e:1, d:1 },
  // Communicate (13)
  { id: 43,  g: 13, name: "Notice Board",                   code: "notice_board",                   v:1, a:1, e:1, d:1 },
  { id: 44,  g: 13, name: "Email",                          code: "email",                          v:1, a:0, e:0, d:0 },
  { id: 46,  g: 13, name: "Email / SMS Log",                code: "email_sms_log",                  v:1, a:0, e:0, d:0 },
  // Reports (14)
  { id: 146, g: 14, name: "Student Report",                 code: "student_report",                 v:1, a:0, e:0, d:0 },
  { id: 147, g: 14, name: "Guardian Report",                code: "guardian_report",                v:1, a:0, e:0, d:0 },
  { id: 148, g: 14, name: "Student History",                code: "student_history",                v:1, a:0, e:0, d:0 },
  { id: 151, g: 14, name: "Admission Report",               code: "admission_report",               v:1, a:0, e:0, d:0 },
  // System Settings (15)
  { id: 54,  g: 15, name: "General Setting",                code: "general_setting",                v:1, a:0, e:1, d:0 },
  { id: 55,  g: 15, name: "Session Setting",                code: "session_setting",                v:1, a:1, e:1, d:1 },
  { id: 56,  g: 15, name: "Notification Setting",           code: "notification_setting",           v:1, a:0, e:1, d:0 },
  { id: 57,  g: 15, name: "SMS Setting",                    code: "sms_setting",                    v:1, a:0, e:1, d:0 },
  { id: 58,  g: 15, name: "Email Setting",                  code: "email_setting",                  v:1, a:0, e:1, d:0 },
  { id: 126, g: 15, name: "User Status",                    code: "user_status",                    v:1, a:0, e:0, d:0 },
  { id: 130, g: 15, name: "Backup",                         code: "backup",                         v:1, a:1, e:0, d:1 },
  // Front Office (17)
  { id: 78,  g: 17, name: "Admission Enquiry",              code: "admission_enquiry",              v:1, a:1, e:1, d:1 },
  { id: 80,  g: 17, name: "Visitor Book",                   code: "visitor_book",                   v:1, a:1, e:1, d:1 },
  { id: 81,  g: 17, name: "Phone Call Log",                 code: "phone_call_log",                 v:1, a:1, e:1, d:1 },
  { id: 82,  g: 17, name: "Postal Dispatch",                code: "postal_dispatch",                v:1, a:1, e:1, d:1 },
  { id: 83,  g: 17, name: "Postal Receive",                 code: "postal_receive",                 v:1, a:1, e:1, d:1 },
  { id: 84,  g: 17, name: "Complaint",                      code: "complaint",                      v:1, a:1, e:1, d:1 },
  { id: 85,  g: 17, name: "Setup Front Office",             code: "setup_font_office",              v:1, a:1, e:1, d:1 },
  // Human Resource (18)
  { id: 86,  g: 18, name: "Staff",                          code: "staff",                          v:1, a:1, e:1, d:1 },
  { id: 87,  g: 18, name: "Disable Staff",                  code: "disable_staff",                  v:1, a:0, e:0, d:0 },
  { id: 88,  g: 18, name: "Staff Attendance",               code: "staff_attendance",               v:1, a:1, e:1, d:0 },
  { id: 90,  g: 18, name: "Staff Payroll",                  code: "staff_payroll",                  v:1, a:1, e:0, d:1 },
  { id: 108, g: 18, name: "Approve Leave Request",          code: "approve_leave_request",          v:1, a:0, e:1, d:1 },
  { id: 109, g: 18, name: "Apply Leave",                    code: "apply_leave",                    v:1, a:1, e:0, d:0 },
  { id: 110, g: 18, name: "Leave Types",                    code: "leave_types",                    v:1, a:1, e:1, d:1 },
  { id: 111, g: 18, name: "Department",                     code: "department",                     v:1, a:1, e:1, d:1 },
  { id: 112, g: 18, name: "Designation",                    code: "designation",                    v:1, a:1, e:1, d:1 },
  // Homework (19)
  { id: 93,  g: 19, name: "Homework",                       code: "homework",                       v:1, a:1, e:1, d:1 },
  { id: 94,  g: 19, name: "Homework Evaluation",            code: "homework_evaluation",            v:1, a:1, e:0, d:0 },
  // Dashboard (22)
  { id: 106, g: 22, name: "Quick Session Change",           code: "quick_session_change",           v:1, a:0, e:0, d:0 },
  { id: 113, g: 22, name: "Fees Collection Monthly Chart",  code: "fees_collection_monthly_chart",  v:1, a:0, e:0, d:0 },
  { id: 117, g: 22, name: "Student Count Widget",           code: "student_count_widget",           v:1, a:0, e:0, d:0 },
  // Online Examination (23)
  { id: 200, g: 23, name: "Online Exam",                    code: "online_exam",                    v:1, a:1, e:1, d:1 },
  { id: 201, g: 23, name: "Question Bank",                  code: "question_bank",                  v:1, a:1, e:1, d:1 },
  // Chat (25)
  { id: 202, g: 25, name: "Chat",                           code: "chat",                           v:1, a:1, e:0, d:1 },
  // Alumni (28)
  { id: 203, g: 28, name: "Alumni",                         code: "alumni",                         v:1, a:1, e:1, d:1 },
  // Lesson Plan (29)
  { id: 204, g: 29, name: "Lesson Plan",                    code: "lesson_plan",                    v:1, a:1, e:1, d:1 },
  // Annual Calendar (30)
  { id: 205, g: 30, name: "Holiday",                        code: "holiday",                        v:1, a:1, e:1, d:1 },
];

// Default permissions per system role
const DEFAULT_ROLE_PERMS: Record<string, number[]> = {
  Admin:      CATEGORIES.map(c => c.id), // all
  Teacher:    [1, 15, 21, 23, 93, 94, 204, 43, 202, 145], // student view, attendance, timetable, homework, notice, chat, lesson plan
  Accountant: [9, 10, 11, 12, 13, 14, 5, 6, 73, 74, 146, 147, 148, 151], // finance + fees reports
  Librarian:  [28, 29, 123], // library
};

async function main() {
  console.log("Seeding permission groups...");
  for (const g of GROUPS) {
    await (prisma as any).permissionGroup.upsert({
      where: { id: g.id },
      update: { name: g.name, shortCode: g.shortCode },
      create: { id: g.id, name: g.name, shortCode: g.shortCode, isSystem: true },
    });
  }

  console.log("Seeding permission categories...");
  for (const c of CATEGORIES) {
    await (prisma as any).permissionCategory.upsert({
      where: { id: c.id },
      update: { name: c.name, shortCode: c.code, permGroupId: c.g, enableView: !!c.v, enableAdd: !!c.a, enableEdit: !!c.e, enableDelete: !!c.d },
      create: { id: c.id, permGroupId: c.g, name: c.name, shortCode: c.code, enableView: !!c.v, enableAdd: !!c.a, enableEdit: !!c.e, enableDelete: !!c.d },
    });
  }

  console.log("Seeding default roles...");
  const systemRoles = [
    { name: "Admin",      isSuperAdmin: false, isSystem: true },
    { name: "Teacher",    isSuperAdmin: false, isSystem: true },
    { name: "Accountant", isSuperAdmin: false, isSystem: true },
    { name: "Librarian",  isSuperAdmin: false, isSystem: true },
    { name: "Super Admin",isSuperAdmin: true,  isSystem: true },
  ];

  for (const r of systemRoles) {
    const role = await (prisma as any).appRole.upsert({
      where: { name: r.name },
      update: { isSuperAdmin: r.isSuperAdmin, isSystem: r.isSystem },
      create: { name: r.name, isSuperAdmin: r.isSuperAdmin, isSystem: r.isSystem },
    });

    if (r.isSuperAdmin) continue; // super admin has all perms, no need to store

    const permCatIds = DEFAULT_ROLE_PERMS[r.name] ?? [];
    for (const catId of permCatIds) {
      const cat = CATEGORIES.find(c => c.id === catId);
      if (!cat) continue;
      await (prisma as any).rolePermission.upsert({
        where: { roleId_permCatId: { roleId: role.id, permCatId: catId } },
        update: { canView: !!cat.v, canAdd: !!cat.a, canEdit: !!cat.e, canDelete: !!cat.d },
        create: { roleId: role.id, permCatId: catId, canView: !!cat.v, canAdd: !!cat.a, canEdit: !!cat.e, canDelete: !!cat.d },
      });
    }
    console.log(`  ${r.name}: ${permCatIds.length} permissions seeded`);
  }

  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
