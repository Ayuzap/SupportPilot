import { LogOut, Plus, ShieldCheck, Wrench } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { isSupabaseConfigured, logout, role, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="page-container flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-6">
          <Link className="flex items-center gap-3" to="/">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
              <Wrench className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">SupportPilot</p>
              <p className="text-sm text-slate-500">Product support portal</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <NavLink
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
                }`
              }
              to="/"
            >
              Home
            </NavLink>
            {user && (
              <NavLink
                className={({ isActive }) =>
                  `text-sm transition-colors ${
                    isActive ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
                  }`
                }
                to={role === "customer" ? "/customer" : "/dashboard"}
              >
                {role === "customer" ? "Customer Portal" : "Dashboard"}
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isSupabaseConfigured && (
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
              Demo auth mode
            </span>
          )}

          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-700">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              {role === "company" ? (
                <Button asChild size="sm">
                  <Link to="/products/new">
                    <Plus className="h-4 w-4" />
                    Add product
                  </Link>
                </Button>
              ) : null}
              <Button onClick={handleLogout} size="sm" variant="outline">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="outline">
                <Link to="/login/customer">Customer login</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/login/company">Company login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register/customer">Customer sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
