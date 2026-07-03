import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Ticket, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function MyTripsPage() {
  // Mock data for passenger's bookings
  const myBookings = [
    { 
      id: "BOK-9921", 
      route: "Nairobi $\rightarrow$ Mombasa", 
      date: "2026-07-10", 
      time: "08:00 AM", 
      seat: "12A", 
      status: "Confirmed",
      price: "KSh 45.00"
    },
    { 
      id: "BOK-8842", 
      route: "Nakuru $\rightarrow$ Nairobi", 
      date: "2026-06-15", 
      time: "02:00 PM", 
      seat: "05B", 
      status: "Completed",
      price: "KSh 20.00"
    },
    { 
      id: "BOK-7710", 
      route: "Mombasa $\rightarrow$ Nairobi", 
      date: "2026-06-01", 
      time: "10:00 AM", 
      seat: "21C", 
      status: "Cancelled",
      price: "KSh 40.00"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your upcoming and past trips.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {myBookings.filter(b => b.status === "Confirmed").map((booking) => (
          <Card key={booking.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge variant="default">{booking.status}</Badge>
                <span className="text-xs text-muted-foreground font-mono">{booking.id}</span>
              </div>
              <CardTitle className="text-lg mt-2">{booking.route}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" /> {booking.date}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" /> {booking.time}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> Main Terminal
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ticket className="h-4 w-4" /> Seat {booking.seat}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-bold text-lg">{booking.price}</span>
                <Button variant="outline" size="sm">View Ticket</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Seat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                  <TableCell>{booking.route}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.seat}</TableCell>
                  <TableCell>
                    <Badge variant={booking.status === "Completed" ? "outline" : booking.status === "Cancelled" ? "destructive" : "default"}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{booking.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
