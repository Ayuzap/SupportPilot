import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bot,
  ClipboardList,
  FileText,
  Ticket,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ChatWidget from "@/components/ChatWidget";
import DocumentList from "@/components/DocumentList";
import FileUploader from "@/components/FileUploader";
import CategoryBadge from "@/components/CategoryBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { withApiFallback } from "@/lib/api";
import { getProductById } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";

function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [product, setProduct] = useState(undefined);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This will permanently delete the product and all associated documents."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await withApiFallback(
        (client) => client.delete(`/products/${product.id}`),
        () => {
          console.log("Mock delete product:", product.id);
        }
      );
      navigate(role === "customer" ? "/customer" : "/dashboard");
    } catch (e) {
      console.error(e);
      alert("Failed to delete the product. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    async function loadProduct() {
      const nextProduct = await withApiFallback(
        (client) => client.get(`/products/${productId}`),
        () => getProductById(productId),
      );

      setProduct(nextProduct || null);
    }

    loadProduct();
  }, [productId]);

  if (product === undefined) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          Loading product workspace...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container">
        <Card>
          <CardContent className="space-y-4 p-8">
            <h1 className="text-2xl font-semibold text-slate-800">Product not found</h1>
            <p className="text-sm text-slate-500">
              This product could not be loaded. Head back to the dashboard to choose
              another workspace.
            </p>
            <Button asChild>
              <Link to={role === "customer" ? "/customer" : "/dashboard"}>Return to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container space-y-8">
      <section className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="outline">
            <Link to={role === "customer" ? "/customer" : "/dashboard"}>
              <ArrowLeft className="h-4 w-4" />
              {role === "customer" ? "Back to products" : "Back to dashboard"}
            </Link>
          </Button>
          {role === "company" && (
            <div className="flex items-center gap-3">
              <Button asChild variant="outline">
                <Link to={`/products/${product.id}/edit`}>Edit product</Link>
              </Button>
              <Button
                variant="outline"
                disabled={isDeleting}
                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete product"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <CategoryBadge category={product.category} />
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {product.status}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-800 sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {product.company} • {product.model} • Updated {product.lastUpdated}
              </p>
            </div>
            <p className="max-w-3xl text-base leading-7 text-slate-500">
              {product.description}
            </p>
          </div>

          <div className="grid w-full max-w-xl gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Ticket className="h-4 w-4 text-indigo-500" />
                  Open tickets
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-800">
                  {product.metrics.openTickets}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Bot className="h-4 w-4 text-indigo-500" />
                  AI assist rate
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-800">
                  {product.metrics.aiAssistRate}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  Documents
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-800">
                  {product.documents.length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common issue patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.commonIssues.map((issue) => (
                <div
                  className="flex items-start gap-3 rounded-xl border border-slate-200 p-4"
                  key={issue}
                >
                  <ClipboardList className="mt-0.5 h-4 w-4 text-indigo-500" />
                  <p className="text-sm leading-6 text-slate-600">{issue}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <DocumentList documents={product.documents} />

          <Card>
            <CardHeader>
              <CardTitle>Additional context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <UploadCloud className="h-4 w-4 text-indigo-500" />
                  Upload a screenshot or field log
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Add extra evidence before asking the AI assistant to reason through the
                  issue.
                </p>
              </div>
              <Separator />
              <FileUploader label="Diagnostic attachments" />
            </CardContent>
          </Card>
        </div>

        <ChatWidget product={product} />
      </section>
    </div>
  );
}

export default ProductPage;
