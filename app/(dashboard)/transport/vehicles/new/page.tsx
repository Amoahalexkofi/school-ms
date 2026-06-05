import { Topbar } from "@/components/Topbar";
import { AddVehicleForm } from "./AddVehicleForm";

export default async function AddVehiclePage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Vehicle" />
      <AddVehicleForm />
    </div>
  );
}
