import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Leaf, Sparkles, Target } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Verdant — Know your footprint, grow your impact" },
      { name: "description", content: "Verdant turns your daily habits into a personalized carbon score with clear, achievable goals." },
      { property: "og:title", content: "Verdant — Personal carbon tracking" },
      { property: "og:description", content: "Know your footprint, grow your impact." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-hero-gradient">
          <div className="pointer-events-none absolute inset-0 opacity-30"
            style={{ backgroundImage: "radial-gradient(circle at 20% 20%, oklch(0.6 0.15 150 / 0.4), transparent 50%), radial-gradient(circle at 80% 60%, oklch(0.75 0.13 95 / 0.4), transparent 50%)" }} />
          <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1 text-xs font-medium text-primary shadow-soft backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Personal carbon intelligence
              </span>
              <h1 className="mt-6 font-display text-5xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
                Know your footprint.<br />Grow your impact.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Verdant turns your daily habits into a personalized carbon score, clear goals, and gentle nudges that actually stick.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="h-12 px-6 text-base shadow-glow">
                  <Link to="/auth" search={{ mode: user ? "login" : "signup" }}>
                    {user ? "Go to dashboard" : "Start free"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
                  <a href="#how">See how it works</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Leaf, title: "Honest measurement", body: "A 2-minute onboarding turns transport, energy and lifestyle into a transparent CO₂ estimate." },
              { icon: Target, title: "Goals that fit you", body: "Personal targets based on your starting point, not a generic benchmark." },
              { icon: BarChart3, title: "Track progress", body: "Watch your footprint shrink across months with clear breakdowns and tips." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:shadow-glow">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-24">
          <div className="rounded-3xl bg-leaf-gradient p-10 text-center text-primary-foreground shadow-glow">
            <h2 className="font-display text-3xl font-semibold">Ready to see your number?</h2>
            <p className="mt-3 text-primary-foreground/85">Sign up free and complete onboarding in under two minutes.</p>
            <Button asChild size="lg" variant="secondary" className="mt-6 h-12 px-6 text-base">
              <Link to="/auth" search={{ mode: "signup" }}>Create your account</Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Verdant. Built with care for the planet.
      </footer>
    </div>
  );
}
