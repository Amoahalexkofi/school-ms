import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, BedDouble, Users } from "lucide-react";

async function getHostelData() {
  return (prisma as any).hostel.findMany({
    include: {
      rooms: {
        include: {
          allocations: { include: { student: true } },
        },
        orderBy: { roomNumber: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export default async function HostelPage() {
  const hostels = await getHostelData();

  const totalRooms = hostels.reduce((s: number, h: any) => s + h.rooms.length, 0);
  const totalCapacity = hostels.reduce((s: number, h: any) =>
    s + h.rooms.reduce((rs: number, r: any) => rs + r.capacity, 0), 0);
  const totalOccupied = hostels.reduce((s: number, h: any) =>
    s + h.rooms.reduce((rs: number, r: any) => rs + r.allocations.length, 0), 0);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Hostel" />
      <main className="flex-1 p-6 space-y-8">

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Hostels</p>
              <p className="text-3xl font-bold">{hostels.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Rooms</p>
              <p className="text-3xl font-bold">{totalRooms}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Capacity</p>
              <p className="text-3xl font-bold">{totalCapacity}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Occupied</p>
              <p className={`text-3xl font-bold ${totalOccupied >= totalCapacity && totalCapacity > 0 ? "text-red-600" : "text-green-600"}`}>
                {totalOccupied}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hostels */}
        {hostels.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-gray-500">
              No hostels configured yet.
            </CardContent>
          </Card>
        ) : (
          hostels.map((h: any) => {
            const hostelOccupied = h.rooms.reduce((s: number, r: any) => s + r.allocations.length, 0);
            const hostelCapacity = h.rooms.reduce((s: number, r: any) => s + r.capacity, 0);
            return (
              <Card key={h.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-indigo-600" />
                      {h.name}
                      {h.type && <span className="text-xs text-gray-500 font-normal">({h.type})</span>}
                    </span>
                    <span className="text-sm font-normal text-gray-500">
                      {hostelOccupied}/{hostelCapacity} occupied
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {h.rooms.length === 0 ? (
                    <p className="text-sm text-gray-500">No rooms added.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {h.rooms.map((r: any) => {
                        const isFull = r.allocations.length >= r.capacity;
                        return (
                          <div key={r.id} className={`border rounded-lg p-3 ${isFull ? "bg-red-50 border-red-200" : "bg-gray-50"}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                <BedDouble className="h-3.5 w-3.5 text-gray-500" />
                                <span className="font-medium text-sm">{r.roomNumber}</span>
                              </div>
                              <span className={`text-xs ${isFull ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                                {r.allocations.length}/{r.capacity}
                              </span>
                            </div>
                            {r.type && <p className="text-xs text-gray-400 mb-1">{r.type}</p>}
                            {r.allocations.length > 0 ? (
                              <div className="space-y-1">
                                {r.allocations.map((a: any) => (
                                  <p key={a.id} className="text-xs text-gray-600 flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {a.student.firstName} {a.student.lastName}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-green-600">Available</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
}
