import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

function RegisterCustomer() {
  const navigate = useNavigate();
  const { isSupabaseConfigured, register } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register({ ...form, role: "customer" });
      navigate("/customer", { replace: true });
    } catch (submitError) {
      setError(submitError.message || "We couldn't create your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Create a customer account</CardTitle>
          <p className="text-sm text-slate-500">
            Save your products, get AI troubleshooting help, and keep track of recent support issues.
          </p>
        </CardHeader>
        <CardContent>
          {!isSupabaseConfigured && (
            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Demo auth is active. This will create a customer account in local browser storage.
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                  placeholder="Jordan Lee"
                  value={form.fullName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Organization</Label>
                <Input
                  id="company"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, company: event.target.value }))
                  }
                  placeholder="Optional"
                  value={form.company}
                />
              </div>
            </div>
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
                placeholder="Create a password"
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
              {isSubmitting ? "Creating account..." : "Create customer account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link className="font-medium text-indigo-600 hover:text-indigo-700" to="/login/customer">
              Customer login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterCustomer;
