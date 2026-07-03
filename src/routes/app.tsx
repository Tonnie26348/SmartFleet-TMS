import { useEffect } from "react";
import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  Bus,
  LayoutDashboard,
  Car,
  LogOut,
  Settings,
  Users,
  CalendarDays,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Redirect to specific dashboard based on role if we are at the root /app
      if (window.location.pathname === "/app") {
        if (user.role === "driver") {
          navigate({ to: "/app/drivers" });
        } else if (user.role === "super_admin" || user.role === "ops_manager") {
          navigate({ to: "/app" }); // Admin stays on dashboard
        } else {
          navigate({ to: "/app" }); // Passengers stay on dashboard
        }
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-secondary/20 flex flex-col">
        <div className="p-6 flex items-center gap-2 font-bold text-xl">
          <div className="grid h-8 w-8 place-items-center rounded-lg gradient-hero text-primary-foreground">
            <Bus className="h-5 w-5" />
          </div>
          <span>SmartFleet</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Button asChild variant="ghost" className="w-full justify-start gap-2">
            <Link to="/app">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          </Button>

          {/* Admin/Staff Only Links */}
          {(user.role === "super_admin" ||
            user.role === "ops_manager" ||
            user.role === "accountant") && (
            <>
              <Button asChild variant="ghost" className="w-full justify-start gap-2">
                <Link to="/app/vehicles">
                  <Car className="h-4 w-4" /> Vehicles
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start gap-2">
                <Link to="/app/routes">
                  <Navigation className="h-4 w-4" /> Routes
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start gap-2">
                <Link to="/app/trips">
                  <CalendarDays className="h-4 w-4" /> Trips
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start gap-2">
                <Link to="/app/drivers">
                  <Users className="h-4 w-4" /> Drivers
                </Link>
              </Button>
            </>
          )}

          {/* Driver Only Link (or Admin) */}
          {(user.role === "driver" || user.role === "super_admin") && (
            <Button asChild variant="ghost" className="w-full justify-start gap-2">
              <Link to="/app/drivers">
                <Users className="h-4 w-4" /> My Profile
              </Link>
            </Button>
          )}

          <Button asChild variant="ghost" className="w-full justify-start gap-2">
            <Link to="/app/settings">
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </Button>
        </nav>

        <div className="p-4 border-t">
          <Button
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b bg-background/80 backdrop-blur flex items-center justify-between px-8">
          <h2 className="font-semibold">Application</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {user.email ? user.email[0].toUpperCase() : "?"}
            </div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
