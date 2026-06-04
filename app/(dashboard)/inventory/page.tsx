import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

async function getInventoryData() {
  const [items, recentMovements] = await Promise.all([
    (prisma as any).item.findMany({
      include: { category: true, supplier: true, store: true },
      orderBy: { name: "asc" },
    }),
    (prisma as any).stockMovement.findMany({
      include: { item: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);
  return { items, recentMovements };
}

export default async function InventoryPage() {
  const { items, recentMovements } = await getInventoryData();

  const lowStock = items.filter((i: any) => i.quantity <= i.lowStockAlert);
  const totalItems = items.length;
  const outOfStock = items.filter((i: any) => i.quantity === 0).length;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Inventory" />
      <main className="flex-1 p-6 space-y-8">

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Items</p>
              <p className="text-3xl font-bold">{totalItems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Low Stock</p>
              <p className={`text-3xl font-bold ${lowStock.length > 0 ? "text-yellow-600" : "text-gray-800"}`}>
                {lowStock.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Out of Stock</p>
              <p className={`text-3xl font-bold ${outOfStock > 0 ? "text-red-600" : "text-gray-800"}`}>
                {outOfStock}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Recent Movements</p>
              <p className="text-3xl font-bold">{recentMovements.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Low stock alerts */}
        {lowStock.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-yellow-800 flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStock.map((i: any) => (
                <span key={i.id} className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-1 rounded">
                  {i.name} — {i.quantity} {i.unit ?? "units"} left
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Items table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" /> Item Catalog
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No items in inventory yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Item</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Category</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Store</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Supplier</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Qty</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Alert At</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item: any) => {
                      const isLow = item.quantity <= item.lowStockAlert;
                      const isOut = item.quantity === 0;
                      return (
                        <tr key={item.id} className={`hover:bg-gray-50 ${isOut ? "bg-red-50" : isLow ? "bg-yellow-50" : ""}`}>
                          <td className="px-3 py-2.5 font-medium">
                            {item.name}
                            {item.unit && <span className="text-gray-400 font-normal ml-1">({item.unit})</span>}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">{item.category?.name ?? "—"}</td>
                          <td className="px-3 py-2.5 text-gray-600">{item.store?.name ?? "—"}</td>
                          <td className="px-3 py-2.5 text-gray-500">{item.supplier?.name ?? "—"}</td>
                          <td className="px-3 py-2.5 text-right font-semibold">{item.quantity}</td>
                          <td className="px-3 py-2.5 text-right text-gray-400">{item.lowStockAlert}</td>
                          <td className="px-3 py-2.5">
                            {isOut ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Out of Stock</span>
                            ) : isLow ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Low Stock</span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">In Stock</span>
                            )}
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

        {/* Recent stock movements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" /> Recent Stock Movements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMovements.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No stock movements recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Date</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Item</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Type</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Qty</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentMovements.map((m: any) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 text-gray-500 text-xs">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2.5 font-medium">{m.item.name}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit ${
                            m.type === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {m.type === "IN" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {m.type}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold">{m.quantity}</td>
                        <td className="px-3 py-2.5 text-gray-500">{m.note ?? "—"}</td>
                      </tr>
                    ))}
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
