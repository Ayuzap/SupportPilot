import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

function LoginCustomer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSupabaseConfigured, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTarget = location.state?.from || "/customer";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ ...form, role: "customer" });
      navigate(redirectTarget, { replace: true });
    } catch (submitError) {
      setError(submitError.message || "We couldn't sign you in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Customer login</CardTitle>
          <p className="text-sm text-slate-500">
            Sign in to get AI-powered help for your registered products and recent issues.
          </p>
        </CardHeader>
        <CardContent>
          {!isSupabaseConfigured && (
            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Demo auth is active. Register a customer account first to land in the customer portal.
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="you@example.com"
                type="email"
                value={form.email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Enter your password"
                type="password"
                value={form.password}
              />
            </div>
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </div>
            )}
            <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
              {isSubmitting ? "Signing in..." : "Log in as customer"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Need help with a product?{" "}
            <Link className="font-medium text-indigo-600 hover:text-indigo-700" to="/register/customer">
              Create customer account
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            Managing a support workspace?{" "}
            <Link className="font-medium text-indigo-600 hover:text-indigo-700" to="/login/company">
              Company login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginCustomer;
