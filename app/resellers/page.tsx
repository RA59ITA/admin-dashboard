import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Link from "next/link";
import DeleteResellerButton from "@/components/resellers/DeleteButton";

export const dynamic = 'force-dynamic';

export default async function ResellersPage() {
  const resellers = await prisma.reseller.findMany({
    include: {
      _count: {
        select: { orders: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 600 }}>Resellers</h2>
        <Link href="/resellers/new">
          <Button variant="primary">
            <Plus size={18} style={{ marginRight: "8px" }} /> Add Reseller
          </Button>
        </Link>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resellers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  No resellers found. 
                </TableCell>
              </TableRow>
            ) : (
              resellers.map(reseller => (
                <TableRow key={reseller.id}>
                  <TableCell>{reseller.name}</TableCell>
                  <TableCell>{reseller.whatsappNumber || "-"}</TableCell>
                  <TableCell>{reseller._count.orders}</TableCell>
                  <TableCell>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link href={`/resellers/${reseller.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                      <DeleteResellerButton id={reseller.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
