import { CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export function PagePlaceholder({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="space-y-5">
      <PageHeader title={title} description={description} badge="SMS Operasyon" />
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <EmptyState
        title="Canli veri baglantisi hazir"
        description="Bu ekran API ve tablo bilesenleri ile gercek zamanli operasyon paneline baglanacak sekilde hazirlandi."
      />
    </div>
  );
}
