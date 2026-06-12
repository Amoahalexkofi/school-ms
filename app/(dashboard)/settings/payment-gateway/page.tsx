import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { PaymentGatewayClient } from "./PaymentGatewayClient";

export default async function PaymentGatewayPage() {
  const db = await getDb();
  const gateways = await (db as any).paymentGateway.findMany({ orderBy: { paymentType: "asc" } });
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Payment Gateway" />
      <PaymentGatewayClient gateways={gateways} />
    </div>
  );
}
