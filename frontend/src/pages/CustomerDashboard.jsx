import { Bot, Clock3, LifeBuoy, Search } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { withApiFallback } from "@/lib/api";
import { getAllProducts } from "@/lib/mockData";
import { useEffect, useMemo, useState } from "react";

const recentCases = [
  { id: 1, product: "ThermoCare Pro 900", issue: "Device not connecting to Wi-Fi", status: "AI in progress" },
  { id: 2, product: "VoltMate X2", issue: "Charging pauses unexpectedly", status: "Resolved" },
];

function CustomerDashboard() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadProducts() {
      const nextProducts = await withApiFallback(
        (client) => client.get("/products"),
        () => getAllProducts(),
      );

      setProducts(Array.isArray(nextProducts) ? nextProducts : getAllProducts());
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) {
      return products;
    }
    return products.filter((product) =>
      [product.name, product.company, product.category, product.model]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [products, query]);

  return (
    <div className="page-container space-y-8">
      <section className="grid gap-6 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Customer portal
          </p>
          <h1 className="text-3xl font-semibold text-slate-800 sm:text-4xl">
            Find your product and get AI-powered diagnostic help.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-500">
            Search supported products, open troubleshooting workspaces, and revisit your recent support activity.
          </p>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your product..."
              value={query}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Bot className="h-4 w-4 text-indigo-500" />
                AI assist availability
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-800">24/7</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <LifeBuoy className="h-4 w-4 text-indigo-500" />
                Open support cases
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-800">2</p>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentCases.map((item) => (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4" key={item.id}>
                  <div>
                    <p className="font-medium text-slate-700">{item.product}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.issue}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {item.status}
                    </span>
                    <Clock3 className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">Supported products</h2>
            <p className="mt-1 text-sm text-slate-500">
              Open a product portal to chat with SupportPilot and browse support documents.
            </p>
          </div>
          {filteredProducts[0] && (
            <Button asChild variant="outline">
              <Link to={`/products/${filteredProducts[0].id}`}>Open first match</Link>
            </Button>
          )}
        </div>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default CustomerDashboard;
