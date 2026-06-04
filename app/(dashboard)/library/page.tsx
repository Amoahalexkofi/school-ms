import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, AlertCircle } from "lucide-react";

async function getLibraryData() {
  const [books, issues] = await Promise.all([
    (prisma as any).book.findMany({ orderBy: { title: "asc" } }),
    (prisma as any).bookIssue.findMany({
      where: { status: { in: ["ISSUED", "OVERDUE"] } },
      include: {
        book: true,
        student: true,
        staff: true,
      },
      orderBy: { issuedAt: "desc" },
    }),
  ]);
  return { books, issues };
}

export default async function LibraryPage() {
  const { books, issues } = await getLibraryData();

  const totalBooks = books.reduce((s: number, b: any) => s + b.quantity, 0);
  const totalAvailable = books.reduce((s: number, b: any) => s + b.available, 0);
  const overdueCount = issues.filter((i: any) => new Date(i.dueDate) < new Date()).length;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Library" />
      <main className="flex-1 p-6 space-y-8">

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Titles</p>
              <p className="text-3xl font-bold">{books.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Copies</p>
              <p className="text-3xl font-bold">{totalBooks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Available</p>
              <p className="text-3xl font-bold text-green-600">{totalAvailable}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Overdue</p>
              <p className={`text-3xl font-bold ${overdueCount > 0 ? "text-red-600" : "text-gray-800"}`}>{overdueCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Book catalog */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" /> Book Catalog
            </CardTitle>
          </CardHeader>
          <CardContent>
            {books.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No books in catalog yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Title</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Author</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">ISBN</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Category</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Qty</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {books.map((b: any) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-medium">{b.title}</td>
                        <td className="px-3 py-2.5 text-gray-600">{b.author}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{b.isbn ?? "—"}</td>
                        <td className="px-3 py-2.5 text-gray-500">{b.category ?? "—"}</td>
                        <td className="px-3 py-2.5 text-right">{b.quantity}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={`font-semibold ${b.available === 0 ? "text-red-600" : "text-green-600"}`}>
                            {b.available}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" /> Active Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No active book issues.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Book</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Issued To</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Issued</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Due</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {issues.map((i: any) => {
                      const isOverdue = new Date(i.dueDate) < new Date();
                      const name = i.student
                        ? `${i.student.firstName} ${i.student.lastName}`
                        : i.staff
                        ? `${i.staff.firstName} ${i.staff.lastName}`
                        : "—";
                      return (
                        <tr key={i.id} className={`hover:bg-gray-50 ${isOverdue ? "bg-red-50" : ""}`}>
                          <td className="px-3 py-2.5 font-medium">{i.book.title}</td>
                          <td className="px-3 py-2.5 text-gray-700">{name}</td>
                          <td className="px-3 py-2.5 text-gray-500 text-xs">{new Date(i.issuedAt).toLocaleDateString()}</td>
                          <td className="px-3 py-2.5 text-xs">
                            <span className={isOverdue ? "text-red-600 font-semibold" : "text-gray-500"}>
                              {new Date(i.dueDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isOverdue ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {isOverdue ? "OVERDUE" : "ISSUED"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
