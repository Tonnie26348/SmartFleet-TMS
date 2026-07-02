import { useDrivers } from "@/hooks/use-drivers";
import { useRoutes } from "@/hooks/use-routes";
import { useTrips } from "@/hooks/use-trips";

export const TMSDashboard = () => {
  const { drivers } = useDrivers();
  const { routes } = useRoutes();
  const { trips } = useTrips();

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">TMS Overview</h1>

      <section>
        <h2 className="text-xl font-semibold">Drivers ({drivers.length})</h2>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Routes ({routes.length})</h2>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Trips ({trips.length})</h2>
      </section>
    </div>
  );
};
