"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let mounted = true;

    async function prepareRecoverySession() {
      const supabase = createClient();
      const code = searchParams.get("code");
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error && mounted) setError(error.message);
        window.history.replaceState(null, "", "/auth/update-password");
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && mounted) setError(error.message);
        else router.replace("/auth/update-password");
      }

      if (mounted) setIsCheckingLink(false);
    }

    prepareRecoverySession();
    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  async function handleUpdate(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirm_password") as string;
      if (!password) {
        setError("Password is required");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) setError(error.message);
      else {
        setSuccess("Password updated! Redirecting to login...");
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2">Set a new password</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          {isCheckingLink ? "Checking your reset link..." : "Enter your new password below."}
        </p>
        <form action={handleUpdate} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}
          {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded">{success}</div>}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-1">New Password</label>
            <Input id="password" name="password" type="password" required minLength={8} placeholder="Enter new password" disabled={isCheckingLink} />
          </div>
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-semibold mb-1">Confirm Password</label>
            <Input id="confirm_password" name="confirm_password" type="password" required minLength={8} placeholder="Confirm new password" disabled={isCheckingLink} />
          </div>
          <Button type="submit" disabled={isPending || isCheckingLink} className="w-full">
            {isPending ? "Updating..." : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense>
      <UpdatePasswordForm />
    </Suspense>
  );
}
