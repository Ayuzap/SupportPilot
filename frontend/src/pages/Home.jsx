import { ArrowRight, Bot, FileText, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { mockProducts } from "@/lib/mockData";

const featureCards = [
  {
    title: "Centralized product support",
    description:
      "Give every product one clean support surface for diagnostics, docs, and issue triage.",
    icon: Wrench,
  },
  {
    title: "AI-guided troubleshooting",
    description:
      "Help customers self-serve with contextual suggestions grounded in your documentation.",
    icon: Bot,
  },
  {
    title: "Trust and traceability",
    description:
      "Show the exact source documents behind a recommendation so support stays transparent.",
    icon: ShieldCheck,
  },
];

function Home() {
  const { role, user } = useAuth();

  return (
    <div className="space-y-16">
      <section className="page-container">
        <div className="grid gap-8 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">
              <FileText className="h-4 w-4 text-indigo-500" />
              Support that feels modern, not buried in tickets
            </div>
             <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Help users diagnose product issues faster with SupportPilot.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-500">
                SupportPilot is a product support portal where companies publish product
                knowledge and customers get AI-powered diagnostic guidance backed
                by real documentation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to={user ? (role === "customer" ? "/customer" : "/dashboard") : "/register/company"}>
                  {user ? "Open workspace" : "Create company workspace"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={user ? (role === "customer" ? "/customer" : "/dashboard") : "/register/customer"}>
                  {user ? "Continue" : "Customer sign up"}
                </Link>
              </Button>
            </div>
          </div>

          <Card className="border-slate-200 bg-slate-50/70">
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Live support summary</p>
                <p className="text-3xl font-semibold text-slate-800">82%</p>
                <p className="text-sm text-slate-500">
                  of incoming issues can be routed into AI-assisted self-service
                  before a human handoff.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">Products indexed</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">24</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">Support articles</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">186</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">Avg. first response</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">1.6 min</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">Escalation quality</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">High</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="page-container">
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50">
                    <Icon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      {feature.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="page-container space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
              Product previews
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-800">
              Example support portals
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Each product gets its own docs, issue patterns, and diagnostic chat
            workflow.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
