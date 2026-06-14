import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArrowRight, Boxes, Bot, FileText, Search, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { withApiFallback } from "@/lib/api";
import { getAllProducts, getDashboardStats } from "@/lib/mockData";

function Dashboard() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const deferredQuery = useDeferredValue(query);

  const companyName = user?.user_metadata?.company;

  useEffect(() => {
    async function loadProducts() {
      const nextProducts = await withApiFallback(
        (client) => client.get("/products/mine"),
        () => getAllProducts(),
      );

      setProducts(Array.isArray(nextProducts) ? nextProducts : getAllProducts());
    }

    loadProducts();
  }, []);

  const companyProducts = useMemo(() => {
    if (!companyName) {
      return products;
    }
    return products.filter(
      (product) => product.company?.toLowerCase() === companyName.toLowerCase()
    );
  }, [products, companyName]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return companyProducts;
    }

    return companyProducts.filter((product) =>
      [product.name, product.company, product.category, product.model]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [deferredQuery, companyProducts]);

  const stats = getDashboardStats(companyProducts);

  return (
    <div className="page-container space-y-8">
      <section className="grid gap-6 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
            Workspace overview
          </p>
          <h1 className="text-3xl font-semibold text-slate-800 sm:text-4xl">
            Keep every product support flow in one place.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-500">
            Monitor open issues, expand your knowledge base, and direct customers into
            AI-assisted troubleshooting before escalation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/products/new">Add a new product</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/products/${companyProducts[0]?.id || "thermocare-pro-900"}`}>
                Preview support workspace
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Boxes className="h-4 w-4 text-indigo-500" />
                Total products
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-800">
                {stats.totalProducts}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Ticket className="h-4 w-4 text-indigo-500" />
                Open tickets
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-800">
                {stats.openTickets}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Bot className="h-4 w-4 text-indigo-500" />
                AI resolution rate
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-800">
                {stats.aiResolutionRate}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FileText className="h-4 w-4 text-indigo-500" />
                Indexed docs
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-800">
                {stats.activeDocs}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl">Products</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Search products by name, company, model, or category.
            </p>
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              value={query}
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-start gap-4 p-8">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">No products found</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Try another search term or add a new product to your workspace.
                </p>
              </div>
              <Button asChild>
                <Link to="/products/new">
                  Add product
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
