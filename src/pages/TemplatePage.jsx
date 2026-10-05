import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/context/LocaleContext";

export default function TemplatePage({ title }) {
  const { t } = useLocale();

  return (
    <section className="h-full overflow-y-auto bg-muted/30 p-4 sm:p-6" aria-labelledby="page-title">
      <div className="mx-auto max-w-5xl space-y-6">
        <h2 id="page-title" className="text-xl font-semibold">{t(title)}</h2>
        <Card>
          <CardContent className="flex min-h-64 items-center justify-center p-6">
            <p className="text-center text-sm text-muted-foreground">{t("Start building your page here.")}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
