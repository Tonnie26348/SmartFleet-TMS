import { useVehicles } from "@/hooks/use-vehicles";

export const VehicleManagementPage = () => {
  const { vehicles, loading } = useVehicles();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Vehicle Management</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">Plate Number</th>
            <th className="border p-2">Model</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id}>
              <td className="border p-2">{v.plate_number}</td>
              <td className="border p-2">{v.model}</td>
              <td className="border p-2">{v.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
