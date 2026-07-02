import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock, Ticket, Download } from "lucide-react";
import { formatDateTime, formatKES } from "@/lib/format";
import { QRCodeSVG } from "qrcode.react";

export const Route = createFileRoute("/bookings/$code")({
  head: () => ({
    meta: [
      { title: "Your Ticket — SafariGo" },
      { name: "description", content: "View your booking status and ticket." },
    ],
  }),
  component: BookingStatusPage,
});

function BookingStatusPage() {
  const { code } = Route.useParams();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          trips(
            departure_at,
            base_fare,
            routes(name, origin, destination),
            vehicles(plate_no, model)
          ),
          payments(status)
        `,
        )
        .eq("booking_code", code)
        .single();

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Poll for payment confirmation
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center space-y-4">
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-bold">Booking Not Found</h1>
          <p className="text-muted-foreground">
            We couldn't find a booking with the code {code}. Please check the code and try again.
          </p>
          <Button asChild className="w-full">
            <Link to="/search">Search for Trips</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const isConfirmed = booking.status === "confirmed";
  const trip = booking.trips;

  return (
    <div className="min-h-screen bg-secondary/30 py-12 px-4">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Booking Status</h1>
          <p className="text-muted-foreground">
            Code: <span className="font-mono font-bold text-foreground">{code}</span>
          </p>
        </div>

        <Card className="overflow-hidden shadow-lg">
          <div
            className={cn(
              "p-4 text-white flex items-center justify-between",
              isConfirmed ? "bg-green-600" : "bg-orange-500",
            )}
          >
            <div className="flex items-center gap-2">
              {isConfirmed ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              <span className="font-bold uppercase tracking-wider">{booking.status}</span>
            </div>
            <Badge variant="outline" className="bg-white/20 text-white border-none">
              {booking.seat_numbers.join(", ")} Seats
            </Badge>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Route</p>
                <p className="font-medium">{trip.routes.name}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Departure</p>
                <p className="font-medium">{formatDateTime(trip.departure_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">From</p>
                <p className="font-medium">{trip.routes.origin}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">To</p>
                <p className="font-medium">{trip.routes.destination}</p>
              </div>
            </div>

            <div className="border-t border-b py-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="font-bold text-lg">{formatKES(booking.total_amount)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Vehicle: {trip.vehicles.plate_no}</span>
                <span className="text-muted-foreground">{trip.vehicles.model}</span>
              </div>
            </div>

            {isConfirmed ? (
              <div className="flex flex-col items-center gap-4 p-4 bg-muted/50 rounded-xl border-2 border-dashed border-muted-foreground/30">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <QRCodeSVG value={code} size={160} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold">Your Digital Ticket</p>
                  <p className="text-xs text-muted-foreground">
                    Show this QR code at the boarding point
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.print()}
                >
                  <Download className="h-4 w-4" /> Download Ticket
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <p className="text-sm text-orange-800 font-medium">
                  Waiting for payment confirmation...
                </p>
                <p className="text-xs text-orange-600">
                  If you have already paid via M-Pesa, your ticket will appear here shortly.
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-center">
          <Button asChild variant="ghost" size="sm">
            <Link to="/search">Search More Trips</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
