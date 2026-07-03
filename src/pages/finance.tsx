import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Download 
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function FinancePage() {
  // Mock data for financial overview
  const financialStats = [
    { title: "Total Revenue", value: "$124,500", icon: DollarSign, trend: "+12%", positive: true },
    { title: "Operating Costs", value: "$45,200", icon: TrendingDown, trend: "-5%", positive: true },
    { title: "Net Profit", value: "$79,300", icon: TrendingUp, trend: "+18%", positive: true },
    { title: "Pending Invoices", value: "12", icon: FileText, trend: "3 overdue", positive: false },
  ];

  const transactions = [
    { id: "TX1001", date: "2026-07-01", entity: "Trip #442 - Nairobi to Mombasa", amount: 1250.00, status: "Paid" },
    { id: "TX1002", date: "2026-07-01", entity: "Fuel Refill - Station A", amount: -450.00, status: "Completed" },
    { id: "TX1003", date: "2026-06-30", entity: "Trip #441 - Nakuru to Nairobi", amount: 800.00, status: "Pending" },
    { id: "TX1004", date: "2026-06-30", entity: "Driver Salary - John Doe", amount: -1200.00, status: "Completed" },
    { id: "TX1005", date: "2026-06-29", entity: "Insurance Premium", amount: -2500.00, status: "Completed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-muted-foreground">Manage fleet revenue and operational expenses.</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {financialStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.positive ? "text-green-500" : "text-red-500"}`}>
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{tx.entity}</TableCell>
                  <TableCell className={`text-right font-medium ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {tx.amount > 0 ? `+$${tx.amount}` : `-$${Math.abs(tx.amount)}`}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                      tx.status === "Paid" ? "bg-green-100 text-green-700" : 
                      tx.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {tx.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
