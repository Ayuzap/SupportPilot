import { Badge } from "@/components/ui/badge";

const categoryStyles = {
  "Climate Control": "bg-sky-50 text-sky-700",
  "Consumer Electronics": "bg-amber-50 text-amber-700",
  "IoT Sensor": "bg-emerald-50 text-emerald-700",
};

function CategoryBadge({ category }) {
  return (
    <Badge className={categoryStyles[category] || "bg-slate-100 text-slate-700"}>
      {category}
    </Badge>
  );
}

export default CategoryBadge;
