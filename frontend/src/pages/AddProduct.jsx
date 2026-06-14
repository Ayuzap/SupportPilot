import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "@/components/ProductForm";
import { useAuth } from "@/context/AuthContext";
import { withApiFallback } from "@/lib/api";
import { saveProduct } from "@/lib/mockData";

const initialForm = {
  name: "",
  category: "",
  model: "",
  company: "",
  description: "",
  status: "Live",
  openTickets: 0,
  aiAssistRate: "80%",
  commonIssues: "",
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function AddProduct() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const companyName = user?.user_metadata?.company || "";

  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    company: companyName,
    aiAssistRate: "",
  }));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const nextProduct = {
      id: slugify(form.name || `product-${Date.now()}`),
      name: form.name,
      category: form.category,
      model: form.model,
      company: form.company,
      description: form.description,
      status: form.status,
      lastUpdated: new Date().toISOString().split("T")[0],
      documents: [],
      commonIssues: form.commonIssues
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      metrics: {
        openTickets: Number(form.openTickets) || 0,
        aiAssistRate: form.aiAssistRate
          ? (form.aiAssistRate.trim().endsWith("%") ? form.aiAssistRate.trim() : `${form.aiAssistRate.trim()}%`)
          : "80%",
        docCoverage: "0 articles",
      },
    };

    try {
      const createdProduct = await withApiFallback(
        async (client) => {
          const response = await client.post("/products", nextProduct);
          const prod = response.data;
          if (files && files.length > 0) {
            for (const file of files) {
              const formData = new FormData();
              formData.append("file", file);
              await client.post(`/products/${prod.id}/documents`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
            }
          }
          return response;
        },
        () => saveProduct(nextProduct),
      );

      navigate(`/products/${createdProduct.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">
          New product
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-800">Add a product portal</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Define the product details, support metadata, and issue patterns that SupportPilot can
          use to guide customers toward faster resolutions.
        </p>
      </div>

      <ProductForm
        disabledCompany={Boolean(companyName)}
        form={form}
        formDescription="Every field here feeds the dashboard experience and the support workspace."
        formTitle="Product details"
        onChange={handleChange}
        onFilesChange={setFiles}
        onSubmit={handleSubmit}
        submitLabel="Create product"
        submitting={isSubmitting}
      />
    </div>
  );
}

export default AddProduct;
