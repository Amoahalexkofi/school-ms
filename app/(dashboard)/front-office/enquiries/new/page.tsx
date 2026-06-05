import { Topbar } from "@/components/Topbar";
import { AddEnquiryForm } from "./AddEnquiryForm";

export default async function NewEnquiryPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Enquiry" />
      <AddEnquiryForm />
    </div>
  );
}
