import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const DEMO_STORAGE_KEY = "supportpilot_demo_user";
const AuthContext = createContext(null);

function readDemoUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem(DEMO_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function readRealUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem("supportpilot_user") || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const realUser = readRealUser();
    if (realUser) {
      setUser(realUser);
    } else {
      setUser(readDemoUser());
    }
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      session: null,
      loading,
      isSupabaseConfigured: false,
      role: user?.user_metadata?.role || "company",
      getDefaultRoute(nextUser = user) {
        const nextRole = nextUser?.user_metadata?.role || "company";
        return nextRole === "customer" ? "/customer" : "/dashboard";
      },
      async login({ email, password, role: expectedRole }) {
        try {
          const response = await api.post("/auth/login", { email, password });
          const { access_token, role, user: userData } = response.data;
          
          if (expectedRole && role !== expectedRole) {
            throw new Error(
              expectedRole === "customer"
                ? "This account belongs to a company workspace. Use company login instead."
                : "This account is set up as a customer. Use customer login instead."
            );
          }

          const formattedUser = {
            id: userData.id,
            email: userData.email,
            user_metadata: {
              full_name: userData.full_name || userData.email.split("@")[0],
              company: userData.company_name || "",
              role: role,
            }
          };

          window.localStorage.setItem("supportpilot_token", access_token);
          window.localStorage.setItem("supportpilot_user", JSON.stringify(formattedUser));
          setUser(formattedUser);
          return { user: formattedUser };
        } catch (error) {
          if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
            // Network failure fallback to local storage demo mode
            const storedUser = readDemoUser();
            const role =
              storedUser?.email === email
                ? storedUser?.user_metadata?.role || expectedRole || "company"
                : expectedRole || "company";
            const demoUser = {
              id: "demo-user",
              email,
              user_metadata: {
                full_name: storedUser?.user_metadata?.full_name || email.split("@")[0],
                company: storedUser?.user_metadata?.company || "",
                role,
              },
            };

            window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
            setUser(demoUser);
            return { user: demoUser };
          }
          throw new Error(error.response?.data?.detail || error.message || "Login failed");
        }
      },
      async register({ email, password, fullName, company, role = "company" }) {
        try {
          const response = await api.post("/auth/register", {
            email,
            password,
            role,
            company_name: company
          });
          const { access_token, role: actualRole } = response.data;

          const formattedUser = {
            id: "user-id-placeholder",
            email,
            user_metadata: {
              full_name: fullName,
              company,
              role: actualRole,
            }
          };

          window.localStorage.setItem("supportpilot_token", access_token);
          window.localStorage.setItem("supportpilot_user", JSON.stringify(formattedUser));
          setUser(formattedUser);
          return { user: formattedUser };
        } catch (error) {
          if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
            const demoUser = {
              id: "demo-user",
              email,
              user_metadata: {
                full_name: fullName,
                company,
                role,
              },
            };

            window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
            setUser(demoUser);
            return { user: demoUser };
          }
          throw new Error(error.response?.data?.detail || error.message || "Registration failed");
        }
      },
      async logout() {
        window.localStorage.removeItem("supportpilot_token");
        window.localStorage.removeItem("supportpilot_user");
        window.localStorage.removeItem(DEMO_STORAGE_KEY);
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
