import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingDown, Leaf, Zap, Car, ShoppingBag, Utensils } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { carbonScore, tipsFor, type OnboardingInput, type CarbonBreakdown } from "@/lib/carbon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Verdant" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: latest }, { data: onboarding }] = await Promise.all([
        supabase.from("carbon_assessments").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("onboarding_responses").select("*").eq("user_id", user!.id).maybeSingle(),
      ]);
      return { latest: latest as CarbonBreakdown | null, onboarding: onboarding as OnboardingInput | null };
    },
  });

  if (isLoading || !data?.latest || !data.onboarding) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-muted-foreground">Loading your dashboard…</p>
      </main>
    );
  }

  const { latest, onboarding } = data;
  const score = carbonScore(latest.total_kg);
  const tips = tipsFor(onboarding, latest);
  const firstName = (profile?.full_name || "").split(" ")[0] || "there";

  const breakdown = [
    { key: "transport_kg", label: "Transport", icon: Car, value: latest.transport_kg, color: "bg-chart-1" },
    { key: "energy_kg", label: "Energy", icon: Zap, value: latest.energy_kg, color: "bg-chart-2" },
    { key: "food_kg", label: "Food", icon: Utensils, value: latest.food_kg, color: "bg-chart-3" },
    { key: "goods_kg", label: "Goods", icon: ShoppingBag, value: latest.goods_kg, color: "bg-chart-4" },
  ];
  const total = latest.total_kg || 1;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Hi {firstName} 👋</h1>
          <p className="text-muted-foreground">Here's how your footprint is shaping up.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/onboarding">Update my answers</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score */}
        <div className="lg:col-span-1 rounded-3xl bg-leaf-gradient p-8 text-primary-foreground shadow-glow">
          <p className="text-sm uppercase tracking-wider text-primary-foreground/80">Your carbon score</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-7xl font-semibold">{score}</span>
            <span className="text-primary-foreground/80">/ 100</span>
          </div>
          <p className="mt-3 text-sm text-primary-foreground/85">
            {score >= 70 ? "Excellent — well below average." : score >= 50 ? "Solid start, room to improve." : "Plenty of opportunity to make a dent."}
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm">
            <Leaf className="h-4 w-4" />
            {latest.total_kg.toLocaleString()} kg CO₂ / year
          </div>
        </div>

        {/* Breakdown */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-8 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Footprint breakdown</h2>
          <p className="text-sm text-muted-foreground">Annual estimate based on your onboarding answers.</p>
          <div className="mt-6 space-y-5">
            {breakdown.map((b) => {
              const pct = Math.round((b.value / total) * 100);
              return (
                <div key={b.key}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary"><b.icon className="h-3.5 w-3.5" /></span>
                      <span className="font-medium">{b.label}</span>
                    </div>
                    <span className="text-muted-foreground">{b.value.toLocaleString()} kg · {pct}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${b.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tips & goals */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" /> <span className="text-xs font-semibold uppercase tracking-wider">Personal tips</span>
          </div>
          <h2 className="mt-2 font-display text-xl font-semibold">Where you can save the most</h2>
          <ul className="mt-4 space-y-3">
            {tips.map((t, i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-muted/50 p-3 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{i + 1}</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center gap-2 text-primary">
            <TrendingDown className="h-4 w-4" /> <span className="text-xs font-semibold uppercase tracking-wider">Your goal</span>
          </div>
          <h2 className="mt-2 font-display text-xl font-semibold">Aim to reduce 15% this year</h2>
          <p className="mt-2 text-sm text-muted-foreground">A realistic first-year target. Small, consistent changes add up fast.</p>
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className="text-muted-foreground">0%</span>
            </div>
            <Progress value={0} className="mt-2 h-2" />
            <p className="mt-3 text-xs text-muted-foreground">Re-take the assessment in 3 months to track progress.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
