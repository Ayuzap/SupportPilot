import { ArrowRight, FileText, LifeBuoy } from "lucide-react";
import { Link } from "react-router-dom";
import CategoryBadge from "@/components/CategoryBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ProductCard({ product }) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription className="mt-1">
              {product.company} • {product.model}
            </CardDescription>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {product.status}
          </span>
        </div>
        <CategoryBadge category={product.category} />
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-6 text-slate-600">{product.description}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <LifeBuoy className="h-4 w-4 text-indigo-500" />
              Open tickets
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-800">
              {product.metrics.openTickets}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <FileText className="h-4 w-4 text-indigo-500" />
              Knowledge base
            </div>
            <p className="mt-2 text-lg font-semibold text-slate-800">
              {product.metrics.docCoverage}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          AI assist rate:{" "}
          <span className="font-medium text-slate-700">{product.metrics.aiAssistRate}</span>
        </p>
        <Button asChild>
          <Link to={`/products/${product.id}`}>
            Open portal
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProductCard;
