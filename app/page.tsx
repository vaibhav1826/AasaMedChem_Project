import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role === "admin") {
    redirect("/admin");
  } else if (session.user?.role === "seller") {
    redirect("/dashboard/seller");
  } else if (session.user?.role === "buyer") {
    redirect("/dashboard/buyer");
  }

  redirect("/login");
}
