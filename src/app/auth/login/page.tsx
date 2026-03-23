"use client";

import { useState, useTransition, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Building2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ─── VALIDATION ───────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── COMPONENT ────────────────────────────────────────────────────────────────

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const urlError = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(
    urlError === "CredentialsSignin"
      ? "Invalid email or password. Please try again."
      : null
  );
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    setAuthError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError("Invalid email or password. Please try again.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-[#0B1521] flex items-center justify-center p-4">
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,169,110,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,169,110,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgba(201,169,110,0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#C9A96E] rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#0B1521]" />
          </div>
          <span className="font-serif text-2xl font-semibold text-white tracking-tight">
            Homes<span className="text-[#C9A96E]">.</span>
          </span>
        </div>

        {/* Card */}
        <Card className="bg-[#12202E] border-white/[0.08] shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-white text-center">
              Welcome back
            </CardTitle>
            <CardDescription className="text-[#8A9BAE] text-center text-sm">
              Sign in to your admin dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error alert */}
            {authError && (
              <Alert className="mb-5 bg-red-500/10 border-red-500/30 text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300 text-sm ml-1">
                  {authError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs text-[#8A9BAE] uppercase tracking-wide"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@homes.in"
                  autoComplete="email"
                  disabled={isPending}
                  className="bg-white/[0.04] border-white/10 text-white placeholder:text-[#4A5E72] focus:border-[#C9A96E] focus:ring-0 h-11"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs text-[#8A9BAE] uppercase tracking-wide"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isPending}
                    className="bg-white/[0.04] border-white/10 text-white placeholder:text-[#4A5E72] focus:border-[#C9A96E] focus:ring-0 h-11 pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5E72] hover:text-[#8A9BAE] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-[#C9A96E] hover:bg-[#E2C99A] text-[#0B1521] font-semibold text-sm transition-colors mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>

            {/* Divider + info */}
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <p className="text-center text-xs text-[#4A5E72]">
                This portal is for authorised Homes agents and administrators
                only. Unauthorised access attempts are logged.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-[#2A3E52] mt-6">
          © {new Date().getFullYear()} Homes. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1521] flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
