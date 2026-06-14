import { useEffect, useState, useMemo } from "react";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { withApiFallback } from "@/lib/api";
import { getAllProducts } from "@/lib/mockData";

const DEFAULT_CATEGORIES = [
  "Climate Control",
  "Consumer Electronics",
  "IoT Sensor",
  "Industrial Equipment",
  "Keyboard",
];

function ProductForm({
  form,
  formTitle,
  formDescription,
  submitLabel,
  onChange,
  onSubmit,
  disabledCompany = false,
  onFilesChange,
  submitting = false,
}) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    async function loadCategories() {
      const productsList = await withApiFallback(
        (client) => client.get("/products"),
        () => getAllProducts(),
      );
      if (Array.isArray(productsList)) {
        const uniqueCats = Array.from(
          new Set([
            ...DEFAULT_CATEGORIES,
            ...productsList.map((p) => p.category).filter(Boolean),
          ])
        ).sort();
        setCategories(uniqueCats);
      }
    }
    loadCategories();
  }, []);

  const displayedCategories = useMemo(() => {
    if (!form.category || categories.includes(form.category)) {
      return categories;
    }
    return [...categories, form.category].sort();
  }, [categories, form.category]);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === "__new__") {
      setShowNewCategoryInput(true);
      onChange({ target: { name: "category", value: "" } });
    } else {
      onChange(e);
    }
  };

  const handleCustomCategoryChange = (e) => {
    const val = e.target.value;
    setNewCategory(val);
    onChange({ target: { name: "category", value: val } });
  };

  const handleCancelCustomCategory = () => {
    setShowNewCategoryInput(false);
    setNewCategory("");
    onChange({ target: { name: "category", value: "" } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formTitle}</CardTitle>
        <p className="text-sm text-slate-500">{formDescription}</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={onSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product name</Label>
              <Input
                id="name"
                name="name"
                onChange={onChange}
                placeholder="ThermoCare Pro 900"
                value={form.name}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                onChange={onChange}
                placeholder="TCP-900"
                value={form.model}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                disabled={disabledCompany || submitting}
                id="company"
                name="company"
                onChange={onChange}
                placeholder="Northwind Labs"
                value={form.company}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category">Category</Label>
                {showNewCategoryInput && (
                  <button
                    type="button"
                    onClick={handleCancelCustomCategory}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                    disabled={submitting}
                  >
                    Choose existing
                  </button>
                )}
              </div>
              {showNewCategoryInput ? (
                <Input
                  id="category"
                  name="category"
                  onChange={handleCustomCategoryChange}
                  placeholder="Enter custom category..."
                  value={newCategory}
                  className="h-11 shadow-sm animate-in fade-in duration-200"
                  autoFocus
                  disabled={submitting}
                />
              ) : (
                <select
                  className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  id="category"
                  name="category"
                  onChange={handleCategoryChange}
                  value={form.category}
                  disabled={submitting}
                >
                  <option value="">Select a category</option>
                  {displayedCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__new__" className="text-indigo-600 font-semibold">
                    + Add New Category...
                  </option>
                </select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              onChange={onChange}
              placeholder="Summarize what the product does and who relies on it."
              value={form.description}
              disabled={submitting}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="status">Launch status</Label>
              <select
                className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                id="status"
                name="status"
                onChange={onChange}
                value={form.status}
                disabled={submitting}
              >
                <option value="Live">Live</option>
                <option value="Beta">Beta</option>
                <option value="Pilot">Pilot</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="openTickets">Open tickets</Label>
              <Input
                id="openTickets"
                min="0"
                name="openTickets"
                onChange={onChange}
                type="number"
                value={form.openTickets}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aiAssistRate">AI assist rate</Label>
              <Input
                id="aiAssistRate"
                name="aiAssistRate"
                onChange={onChange}
                placeholder="82%"
                value={form.aiAssistRate}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commonIssues">Common issues</Label>
            <Textarea
              id="commonIssues"
              name="commonIssues"
              onChange={onChange}
              placeholder="One issue per line"
              value={form.commonIssues}
              disabled={submitting}
            />
          </div>

          <FileUploader
            description="These can later be indexed for the AI diagnostic assistant."
            label="Support documents"
            onFilesChange={onFilesChange}
            disabled={submitting}
          />

          <div className="flex justify-end">
            <Button size="lg" type="submit" disabled={submitting}>
              {submitting ? "Uploading and indexing support documents..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ProductForm;
