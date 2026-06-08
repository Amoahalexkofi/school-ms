import { redirect } from "next/navigation";

// Old URL shape — redirect to latest sub-invoice
export default async function OldReceiptPage({
  params,
}: {
  params: Promise<{ depositId: string }>;
}) {
  const { depositId } = await params;
  redirect(`/fees/receipt/${depositId}/1`);
}
