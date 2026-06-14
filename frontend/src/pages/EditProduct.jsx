import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProductForm from "@/components/ProductForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { withApiFallback } from "@/lib/api";
import { getProductById, updateProduct } from "@/lib/mockData";

function EditProduct() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(null);
  const [originalProduct, setOriginalProduct] = useState(null);
  const companyName = user?.user_metadata?.company || "";

  useEffect(() => {
    async function loadProduct() {
      const product = await withApiFallback(
        (client) => client.get(`/products/${productId}`),
        () => getProductById(productId),
      );
      if (!product) {
        setForm(null);
        return;
      }

            setForm({
        // Store full product for later use in submission
        // (avoids relying on mock data)
        // We'll keep a separate state reference
        // to preserve fields like documents and metrics

        name: product.name || "",
        category: product.category || "",
        model: product.model || "",
        company: product.company || "",
        description: product.description || "",
        status: product.status || "Live",
        openTickets: product.metrics?.openTickets ?? 0,
        aiAssistRate: product.metrics?.aiAssistRate || "80%",
        commonIssues: Array.isArray(product.commonIssues)
          ? product.commonIssues.join("\n")
          : (product.commonIssues || ""),
      });
      setOriginalProduct(product);
    }
    loadProduct();
  }, [productId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const currentProduct = originalProduct;
    if (!currentProduct) {
      // Product data not loaded yet; abort submission
      return;
    }

    setIsSubmitting(true);

    const updates = {
      name: form.name,
      category: form.category,
      model: form.model,
      company: form.company,
      description: form.description,
      status: form.status,
      lastUpdated: new Date().toISOString().split("T")[0],
      documents: currentProduct.documents,
      commonIssues: form.commonIssues
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      metrics: {
        openTickets: Number(form.openTickets) || 0,
        aiAssistRate: form.aiAssistRate
          ? (form.aiAssistRate.trim().endsWith("%") ? form.aiAssistRate.trim() : `${form.aiAssistRate.trim()}%`)
          : "80%",
        docCoverage: currentProduct.metrics.docCoverage || "0 articles",
      },
    };

    try {
      await withApiFallback(
        async (client) => {
          const response = await client.put(`/products/${productId}`, updates);
          if (files && files.length > 0) {
            for (const file of files) {
              const formData = new FormData();
              formData.append("file", file);
              await client.post(`/products/${productId}/documents`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
            }
          }
          return response;
        },
        () => updateProduct(productId, updates),
      );

      navigate(`/products/${productId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form) {
    return (
      <div className="page-container">
        <Card>
          <CardContent className="space-y-4 p-8">
            <h1 className="text-2xl font-semibold text-slate-800">Product not found</h1>
            <p className="text-sm text-slate-500">We couldn't load this product for editing.</p>
            <Button asChild>
              <Link to="/dashboard">Return to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
          Edit product
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-800">Refine support data</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Keep product descriptions, issue patterns, and support metrics current so the
          diagnostic assistant stays reliable.
        </p>
      </div>

      <ProductForm
        disabledCompany={Boolean(companyName)}
        form={form}
        formDescription="Updating product metadata here refreshes the product workspace and dashboard."
        formTitle="Product details"
        onChange={handleChange}
        onFilesChange={setFiles}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        submitting={isSubmitting}
      />
    </div>
  );
}

export default EditProduct;
