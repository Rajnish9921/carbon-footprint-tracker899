import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Leaf, Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordInput, passwordStrength } from "@/components/password-input";

const searchSchema = z.object({ mode: z.enum(["login", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in or create an account — Verdant" },
      { name: "description", content: "Sign in to Verdant or create a free account to start tracking your carbon footprint." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: profile?.onboarded ? "/dashboard" : "/onboarding", replace: true });
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden bg-leaf-gradient text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur"><Leaf className="h-5 w-5" /></span>
          <span className="font-display text-xl font-semibold">Verdant</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-semibold leading-tight">A calmer, clearer way to lower your footprint.</h2>
          <p className="mt-4 max-w-md text-primary-foreground/85">Built for real life — not climate anxiety. Track what matters, celebrate progress, repeat.</p>
        </div>
        <p className="text-sm text-primary-foreground/70">© {new Date().getFullYear()} Verdant</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-leaf-gradient text-primary-foreground"><Leaf className="h-5 w-5" /></span>
              <span className="font-display text-xl font-semibold">Verdant</span>
            </Link>
          </div>
          <Tabs defaultValue={mode === "signup" ? "signup" : "login"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="login"><LoginForm /></TabsContent>
            <TabsContent value="signup"><SignupForm /></TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function GoogleButton({ label }: { label: string }) {
  const [busy, setBusy] = useState(false);
  async function onClick() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { toast.error(result.error.message || "Google sign-in failed"); setBusy(false); }
    // If redirected, the browser navigates away
  }
  return (
    <Button type="button" variant="outline" className="w-full h-11" onClick={onClick} disabled={busy}>
      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.3-1.66 3.8-5.5 3.8-3.31 0-6-2.74-6-6.1S8.69 5.7 12 5.7c1.88 0 3.14.8 3.87 1.48l2.64-2.55C16.95 3.18 14.69 2.2 12 2.2 6.92 2.2 2.8 6.32 2.8 11.4S6.92 20.6 12 20.6c6.93 0 9.2-4.86 9.2-7.34 0-.5-.06-.88-.13-1.26H12z"/>
        </svg>
      )}
      {label}
    </Button>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue tracking your impact.</p>
      </div>
      <GoogleButton label="Continue with Google" />
      <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot?</Link>
          </div>
          <PasswordInput id="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} /> Remember me
        </label>
        <Button type="submit" className="h-11 w-full" disabled={busy}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
        </Button>
      </form>
    </div>
  );
}

function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);

  const strength = passwordStrength(password);
  const strengthColors = ["bg-destructive", "bg-destructive", "bg-warning", "bg-warning", "bg-success", "bg-success"];
  const mismatch = confirm.length > 0 && password !== confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!terms) return toast.error("Please accept the Terms & Privacy Policy.");
    if (password !== confirm) return toast.error("Passwords don't match.");
    if (strength.score < 3) return toast.error("Please choose a stronger password.");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to verify your account.");
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Free forever. No credit card needed.</p>
      </div>
      <GoogleButton label="Sign up with Google" />
      <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-su">Email</Label>
          <Input id="email-su" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw-su">Password</Label>
          <PasswordInput id="pw-su" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex h-1.5 gap-1">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className={`flex-1 rounded-full ${i < strength.score ? strengthColors[strength.score] : "bg-muted"}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Password strength: <span className="font-medium text-foreground">{strength.label}</span></p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw-confirm">Confirm password</Label>
          <PasswordInput id="pw-confirm" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={mismatch} />
          {mismatch && <p className="text-xs text-destructive">Passwords don't match.</p>}
        </div>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox checked={terms} onCheckedChange={(v) => setTerms(!!v)} className="mt-0.5" />
          <span>I agree to the <a className="font-medium text-primary hover:underline" href="#">Terms</a> and <a className="font-medium text-primary hover:underline" href="#">Privacy Policy</a>.</span>
        </label>
        <Button type="submit" className="h-11 w-full" disabled={busy}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
        </Button>
      </form>
    </div>
  );
}
