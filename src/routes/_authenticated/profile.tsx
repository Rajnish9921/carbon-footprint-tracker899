import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput, passwordStrength } from "@/components/password-input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Verdant" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [savingName, setSavingName] = useState(false);

  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingName(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    setSavingName(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    await refreshProfile();
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pwConfirm) return toast.error("Passwords don't match.");
    if (passwordStrength(pw).score < 3) return toast.error("Choose a stronger password.");
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSavingPw(false);
    if (error) return toast.error(error.message);
    setPw(""); setPwConfirm("");
    toast.success("Password changed");
  }

  async function deleteAccount() {
    if (!user) return;
    // Soft "delete": sign out + clear profile. Hard delete requires admin API.
    const { error } = await supabase.from("profiles").update({ full_name: "[deleted]", onboarded: false }).eq("id", user.id);
    if (error) return toast.error(error.message);
    await signOut();
    toast.success("Account data cleared. Contact support to fully remove your account.");
    navigate({ to: "/", replace: true });
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Profile</h1>
      <p className="mt-1 text-muted-foreground">Manage your account and preferences.</p>

      <Section title="Account">
        <form onSubmit={saveName} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full">Full name</Label>
            <Input id="full" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <Button type="submit" disabled={savingName}>
            {savingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save changes
          </Button>
        </form>
      </Section>

      <Section title="Change password">
        <form onSubmit={changePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="np">New password</Label>
            <PasswordInput id="np" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="npc">Confirm new password</Label>
            <PasswordInput id="npc" autoComplete="new-password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} />
          </div>
          <Button type="submit" disabled={savingPw || !pw}>
            {savingPw && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update password
          </Button>
        </form>
      </Section>

      <Section title="Sustainability preferences">
        <p className="text-sm text-muted-foreground">Want to update your transport, energy or lifestyle answers?</p>
        <Button variant="outline" onClick={() => navigate({ to: "/onboarding" })}>Re-take assessment</Button>
      </Section>

      <Section title="Danger zone" tone="danger">
        <p className="text-sm text-muted-foreground">Permanently clear your profile data and sign out.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete account data</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account data?</AlertDialogTitle>
              <AlertDialogDescription>
                This clears your profile and signs you out. Your saved assessments will remain associated with your user record until fully removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>
    </main>
  );
}

function Section({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "danger" }) {
  return (
    <section className={`mt-8 rounded-2xl border bg-card p-6 shadow-soft ${tone === "danger" ? "border-destructive/30" : "border-border"}`}>
      <h2 className={`font-display text-lg font-semibold ${tone === "danger" ? "text-destructive" : ""}`}>{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
