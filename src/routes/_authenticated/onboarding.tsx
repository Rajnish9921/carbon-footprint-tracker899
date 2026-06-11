import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Bike, Home, Leaf, Loader2, Sparkles, Utensils } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { estimateCarbon, type OnboardingInput } from "@/lib/carbon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — Verdant" }] }),
  component: Onboarding,
});

const steps = [
  { id: "transport", icon: Bike, title: "How you move", desc: "Daily travel makes up a huge slice of personal emissions." },
  { id: "energy", icon: Home, title: "Your home energy", desc: "Help us estimate your household energy footprint." },
  { id: "lifestyle", icon: Utensils, title: "Food & lifestyle", desc: "What you eat and buy is the next biggest factor." },
  { id: "habits", icon: Leaf, title: "Sustainability habits", desc: "Small habits that compound over time." },
] as const;

function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [data, setData] = useState<OnboardingInput>({
    car_km_per_week: 50,
    car_fuel_type: "petrol",
    flights_per_year: 1,
    public_transport_km_per_week: 20,
    household_size: 2,
    electricity_kwh_per_month: 250,
    renewable_energy: false,
    heating_type: "gas",
    diet: "omnivore",
    shopping_frequency: "medium",
    recycles: true,
    composts: false,
  });

  const set = <K extends keyof OnboardingInput>(k: K, v: OnboardingInput[K]) => setData((d) => ({ ...d, [k]: v }));
  const pct = ((step + 1) / steps.length) * 100;

  async function finish() {
    if (!user) return;
    setBusy(true);
    const breakdown = estimateCarbon(data);
    const [{ error: e1 }, { error: e2 }, { error: e3 }] = await Promise.all([
      supabase.from("onboarding_responses").upsert({ user_id: user.id, ...data }, { onConflict: "user_id" }),
      supabase.from("carbon_assessments").insert({ user_id: user.id, ...breakdown }),
      supabase.from("profiles").update({ onboarded: true }).eq("id", user.id),
    ]);
    setBusy(false);
    const err = e1 || e2 || e3;
    if (err) return toast.error(err.message);
    toast.success("Welcome to Verdant 🌱");
    await refreshProfile();
    navigate({ to: "/dashboard", replace: true });
  }

  const StepIcon = steps[step].icon;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {step + 1} of {steps.length}</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <Progress value={pct} className="mt-2 h-2" />
      </div>

      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><StepIcon className="h-5 w-5" /></span>
          <div>
            <h1 className="font-display text-2xl font-semibold">{steps[step].title}</h1>
            <p className="text-sm text-muted-foreground">{steps[step].desc}</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {step === 0 && (
            <>
              <Field label="Car kilometres per week">
                <Input type="number" min={0} value={data.car_km_per_week} onChange={(e) => set("car_km_per_week", +e.target.value)} />
              </Field>
              <Field label="Car fuel type">
                <RadioGroup value={data.car_fuel_type} onValueChange={(v) => set("car_fuel_type", v as OnboardingInput["car_fuel_type"])} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {(["petrol","diesel","hybrid","electric","none"] as const).map((f) => (
                    <label key={f} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm capitalize has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <RadioGroupItem value={f} /> {f}
                    </label>
                  ))}
                </RadioGroup>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Flights per year">
                  <Input type="number" min={0} value={data.flights_per_year} onChange={(e) => set("flights_per_year", +e.target.value)} />
                </Field>
                <Field label="Public transport km/week">
                  <Input type="number" min={0} value={data.public_transport_km_per_week} onChange={(e) => set("public_transport_km_per_week", +e.target.value)} />
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Household size">
                  <Input type="number" min={1} value={data.household_size} onChange={(e) => set("household_size", +e.target.value)} />
                </Field>
                <Field label="Electricity kWh/month">
                  <Input type="number" min={0} value={data.electricity_kwh_per_month} onChange={(e) => set("electricity_kwh_per_month", +e.target.value)} />
                </Field>
              </div>
              <Field label="Heating type">
                <RadioGroup value={data.heating_type} onValueChange={(v) => set("heating_type", v as OnboardingInput["heating_type"])} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {(["gas","electric","oil","heatpump","none"] as const).map((f) => (
                    <label key={f} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm capitalize has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <RadioGroupItem value={f} /> {f === "heatpump" ? "heat pump" : f}
                    </label>
                  ))}
                </RadioGroup>
              </Field>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                <div>
                  <p className="font-medium">Renewable electricity tariff</p>
                  <p className="text-sm text-muted-foreground">Wind, solar or certified green energy.</p>
                </div>
                <Switch checked={data.renewable_energy} onCheckedChange={(v) => set("renewable_energy", v)} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Typical diet">
                <RadioGroup value={data.diet} onValueChange={(v) => set("diet", v as OnboardingInput["diet"])} className="grid gap-2 sm:grid-cols-2">
                  {([
                    ["vegan","Vegan"],["vegetarian","Vegetarian"],["pescatarian","Pescatarian"],
                    ["omnivore","Omnivore"],["heavy_meat","Meat with most meals"],
                  ] as const).map(([v, l]) => (
                    <label key={v} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <RadioGroupItem value={v} /> {l}
                    </label>
                  ))}
                </RadioGroup>
              </Field>
              <Field label="Shopping frequency (clothes, gadgets, household)">
                <RadioGroup value={data.shopping_frequency} onValueChange={(v) => set("shopping_frequency", v as OnboardingInput["shopping_frequency"])} className="grid grid-cols-3 gap-2">
                  {(["low","medium","high"] as const).map((f) => (
                    <label key={f} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm capitalize has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <RadioGroupItem value={f} /> {f}
                    </label>
                  ))}
                </RadioGroup>
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                <div>
                  <p className="font-medium">I recycle regularly</p>
                  <p className="text-sm text-muted-foreground">Paper, plastic, glass, metal.</p>
                </div>
                <Switch checked={data.recycles} onCheckedChange={(v) => set("recycles", v)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                <div>
                  <p className="font-medium">I compost food scraps</p>
                  <p className="text-sm text-muted-foreground">At home or via municipal pickup.</p>
                </div>
                <Switch checked={data.composts} onCheckedChange={(v) => set("composts", v)} />
              </div>
              <div className="rounded-2xl bg-primary/5 p-4 text-sm text-muted-foreground">
                <Sparkles className="mb-2 h-4 w-4 text-primary" />
                We'll use these answers to estimate your annual CO₂ and personalize your dashboard.
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || busy}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Next <ArrowRight className="ml-1 h-4 w-4" /></Button>
          ) : (
            <Button onClick={finish} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Finish & see my score
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
