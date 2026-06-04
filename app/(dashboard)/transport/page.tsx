import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, MapPin, Users } from "lucide-react";

async function getTransportData() {
  const [routes, vehicles] = await Promise.all([
    (prisma as any).route.findMany({
      include: {
        vehicle: true,
        pickupPoints: { orderBy: { order: "asc" } },
        students: { include: { student: true } },
      },
      orderBy: { name: "asc" },
    }),
    (prisma as any).vehicle.findMany({ orderBy: { number: "asc" } }),
  ]);
  return { routes, vehicles };
}

export default async function TransportPage() {
  const { routes, vehicles } = await getTransportData();

  const totalStudents = routes.reduce((s: number, r: any) => s + r.students.length, 0);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Transport" />
      <main className="flex-1 p-6 space-y-8">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Vehicles</p>
              <p className="text-3xl font-bold">{vehicles.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Routes</p>
              <p className="text-3xl font-bold">{routes.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Students on Transport</p>
              <p className="text-3xl font-bold">{totalStudents}</p>
            </CardContent>
          </Card>
        </div>

        {/* Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bus className="h-4 w-4 text-blue-600" /> Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No vehicles registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Number</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Type</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Capacity</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Driver</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Driver Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {vehicles.map((v: any) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-mono font-medium">{v.number}</td>
                        <td className="px-3 py-2.5 text-gray-600">{v.type}</td>
                        <td className="px-3 py-2.5">{v.capacity}</td>
                        <td className="px-3 py-2.5 text-gray-600">{v.driverName ?? "—"}</td>
                        <td className="px-3 py-2.5 text-gray-500">{v.driverPhone ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Routes */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" /> Routes
          </h2>
          {routes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-gray-500">No routes defined yet.</CardContent>
            </Card>
          ) : (
            routes.map((r: any) => (
              <Card key={r.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      {r.vehicle && (
                        <p className="text-xs text-gray-500">Vehicle: {r.vehicle.number} ({r.vehicle.type})</p>
                      )}
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {r.students.length} students
                    </span>
                  </div>

                  {r.pickupPoints.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Pickup Points</p>
                      <div className="flex flex-wrap gap-2">
                        {r.pickupPoints.map((pp: any) => (
                          <span key={pp.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {pp.name}{pp.timing ? ` (${pp.timing})` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {r.students.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Users className="h-3 w-3" /> Students
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {r.students.map((sr: any) => (
                          <span key={sr.id} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded">
                            {sr.student.firstName} {sr.student.lastName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
