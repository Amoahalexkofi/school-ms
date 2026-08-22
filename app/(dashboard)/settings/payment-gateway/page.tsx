import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { redactList } from "@/lib/config-secrets";
import { PaymentGatewayClient } from "./PaymentGatewayClient";

const SECRET_FIELDS = ["apiSecretKey", "apiPassword", "apiSignature"];

export default async function PaymentGatewayPage() {
  const db = await getDb();
  const rows = await (db as any).paymentGateway.findMany({ orderBy: { paymentType: "asc" } });
  // Raw rows carry encrypted secret keys straight from the DB — redact
  // before they ever reach the client, same as the /api/payment-gateways GET route does.
  const gateways = redactList(rows, SECRET_FIELDS);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Payment Gateway" />
      <PaymentGatewayClient gateways={gateways} />
    </div>
  );
}
