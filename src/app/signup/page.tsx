"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowLeft, Loader2, Eye, EyeOff, Car, GraduationCap, ShieldCheck } from "lucide-react";
import { GoogleLogo } from "@/components/BrandIcons";
import Logo from "@/components/Logo";

export default function SignUpPage() {
  const router = useRouter();
  const [accountRole, setAccountRole] = useState<"student" | "driver">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [vehicleType, setVehicleType] = useState<string>("Taxi / Car");
  const [driverIdNumber, setDriverIdNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to workspace
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then((res) => {
      if (res.data?.session) {
        router.push("/workspace");
      }
    });
  }, [router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const profileData = {
        full_name: fullName,
        role: accountRole,
        vehicle_type: accountRole === "driver" ? vehicleType : null,
        is_verified_driver: accountRole === "driver",
        student_id_number: driverIdNumber || "70012345",
      };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData,
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/login" : "",
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        if (data.user) {
          try {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              email,
              full_name: fullName,
              role: accountRole,
              vehicle_type: accountRole === "driver" ? vehicleType : null,
              student_id_number: driverIdNumber || "70012345",
              is_verified_driver: accountRole === "driver",
              is_available: true,
              updated_at: new Date().toISOString()
            });
          } catch (dbErr) {
            console.error("Database profile upsert:", dbErr);
          }
        }

        // Update local session profile cache
        if (typeof window !== "undefined") {
          localStorage.setItem("yenko_profile", JSON.stringify({
            id: data.user?.id || "mock-user-id",
            ...profileData,
            email,
          }));
        }

        if (data.session) {
          toast.success(`Account created successfully as ${accountRole === "driver" ? "Campus Driver" : "Student Commuter"}!`);
          router.push("/workspace");
        } else {
          toast.success("Registration successful! Check your email to verify your account.");
          router.push("/login");
        }
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      toast.error("Supabase is not configured yet.");
      return;
    }
    setIsGoogleLoading(true);
    try {
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/workspace` : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        toast.error("Google login failed: " + error.message);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      toast.error("Google login error: " + (err.message || "Failed to connect"));
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl -z-10" />

      {/* Top Navbar/Back Link */}
      <div className="absolute top-6 left-6 sm:left-12">
        <Link
          href="/"
          className="flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-6">
        {/* Branding Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-foreground font-sans">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface border border-border-mute py-8 px-6 sm:px-10 rounded-2xl shadow-xl backdrop-blur-md">
          
          {/* Account Role Selector (Student vs Driver) */}
          <div className="mb-6">
            <label className="block text-[10px] font-mono font-bold text-text-muted uppercase mb-2">
              Select Account Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-background border border-border-mute">
              <button
                type="button"
                onClick={() => setAccountRole("student")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  accountRole === "student"
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                Student Commuter
              </button>

              <button
                type="button"
                onClick={() => setAccountRole("driver")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  accountRole === "driver"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                <Car className="h-4 w-4" />
                Campus Driver
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSignUp}>
            {/* Full Name Input */}
            <div>
              <label htmlFor="name" className="block text-[10px] font-mono font-bold text-text-muted uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <User className="h-3.5 w-3.5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Carter"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-background border border-border-mute rounded-lg outline-none focus:border-emerald-500 transition-colors text-foreground"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-mono font-bold text-text-muted uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-background border border-border-mute rounded-lg outline-none focus:border-emerald-500 transition-colors text-foreground"
                />
              </div>
            </div>

            {/* Additional Fields for Campus Driver Registration */}
            {accountRole === "driver" && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="h-4 w-4" />
                  Campus Driver Clearance Setup
                </div>

                <div>
                  <label className="block text-[9px] font-mono font-bold uppercase text-text-muted mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="block w-full p-2 text-xs bg-background border border-border-mute rounded-lg outline-none text-foreground"
                  >
                    <option value="Taxi / Car">🚕 Taxi / Passenger Car</option>
                    <option value="Motorbike">🏍️ Motorbike Express</option>
                    <option value="Bus / Shuttle">🚌 Campus Shuttle Bus</option>
                    <option value="E-Bicycle">🚲 E-Bicycle Courier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono font-bold uppercase text-text-muted mb-1">
                    Student/Staff ID or Driver Permit #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UMaT-70012345"
                    value={driverIdNumber}
                    onChange={(e) => setDriverIdNumber(e.target.value)}
                    className="block w-full p-2 text-xs bg-background border border-border-mute rounded-lg outline-none text-foreground"
                  />
                </div>
              </div>
            )}

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-mono font-bold text-text-muted uppercase mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="block w-full pl-9 pr-10 py-2 text-xs bg-background border border-border-mute rounded-lg outline-none focus:border-emerald-500 transition-colors text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[10px] font-mono font-bold text-text-muted uppercase mb-1.5">
                Confirm Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="block w-full pl-9 pr-3 py-2 text-xs bg-background border border-border-mute rounded-lg outline-none focus:border-emerald-500 transition-colors text-foreground"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white transition-all focus:outline-none disabled:opacity-50 cursor-pointer ${
                  accountRole === "driver"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  accountRole === "driver" ? "Create Campus Driver Account" : "Create Student Account"
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-mute" />
              </div>
              <div className="relative flex justify-center text-[10px] font-mono font-bold uppercase">
                <span className="px-2 bg-surface text-text-muted">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-border-mute rounded-lg bg-surface hover:bg-background text-foreground text-xs font-semibold shadow-sm transition-all focus:outline-none cursor-pointer"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <GoogleLogo className="h-4 w-4" />
                    Sign up with Google
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Link to Login */}
          <div className="mt-6 text-center">
            <p className="text-xs text-text-muted">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
