import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  const allUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Platform Users</h1>

      <div className="rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">ID</TableHead>
              <TableHead className="text-zinc-400">Email</TableHead>
              <TableHead className="text-zinc-400">Role</TableHead>
              <TableHead className="text-right text-zinc-400">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUsers.map((user) => {
              let badgeColor = "bg-zinc-700 text-zinc-100";
              if (user.role === "admin") badgeColor = "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
              if (user.role === "buyer") badgeColor = "bg-purple-500/20 text-purple-400 border-purple-500/30";
              if (user.role === "seller") badgeColor = "bg-blue-500/20 text-blue-400 border-blue-500/30";

              return (
                <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell className="font-mono text-xs text-zinc-500">
                    {user.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`uppercase text-[10px] ${badgeColor}`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-zinc-400">
                    {new Date(user.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
            {allUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-zinc-500">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
