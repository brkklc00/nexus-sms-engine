import { AppShell } from "@/components/app-shell";
import { PagePlaceholder } from "@/components/page-placeholder";

export default function SmsRehberPage() {
  return (
    <AppShell>
      <PagePlaceholder
        title="SMS Rehberleri"
        description="Rehber olusturun, CSV/TXT ile numara ice aktarimi yapin, normalize edin ve istatistikleri paginated tabloda yonetin."
        items={[
          "Rehber olusturma ve duzenleme",
          "CSV/TXT ve manuel metin import",
          "E.164 normalizasyonu ve ulke tespiti",
          "Liste ici ve global dedupe",
          "Toplam/gecerli/gecersiz/blacklist metrikleri",
          "Toplu silme ve export",
        ]}
      />
    </AppShell>
  );
}
