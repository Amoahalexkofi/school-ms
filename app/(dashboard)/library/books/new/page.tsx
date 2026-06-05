import { Topbar } from "@/components/Topbar";
import { AddBookForm } from "./AddBookForm";

export default async function AddBookPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Book" />
      <AddBookForm />
    </div>
  );
}
