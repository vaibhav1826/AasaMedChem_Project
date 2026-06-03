"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials");
      } else {
        // We need to fetch the session to know the role, or we can just let middleware route us correctly.
        // The prompt says: "if role === 'seller' redirect to /dashboard/seller, if role === 'buyer' redirect to /dashboard/buyer"
        // But the middleware already handles redirecting the root `/` to the correct dashboard if authenticated.
        // So we can simply redirect to `/` and let middleware do its job, or we can hit `/api/auth/session` to get the role.
        // Let's fetch session to be explicit as requested.
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        
        if (sessionData?.user?.role === "seller") {
          router.push("/dashboard/seller");
        } else if (sessionData?.user?.role === "buyer") {
          router.push("/dashboard/buyer");
        } else {
          // Fallback
          router.push("/");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">AasaMedChem</CardTitle>
            <CardDescription className="text-center font-medium">Seller / Buyer Login</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm">
          <p className="font-semibold mb-2 text-zinc-700 dark:text-zinc-300">Test Credentials:</p>
          <div className="grid grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-400 font-mono">
            <div className="font-bold text-xs text-zinc-500 uppercase tracking-wider col-span-2 mt-2">Seller</div>
            <div>seller@test.com</div>
            <div>seller123</div>
            <div className="font-bold text-xs text-zinc-500 uppercase tracking-wider col-span-2 mt-2">Buyer</div>
            <div>buyer@test.com</div>
            <div>buyer123</div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-zinc-500">
            New seller account?{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Register here
            </Link>
          </p>
          <Link href="/admin/login" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 font-medium transition-colors block">
            Admin? Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
