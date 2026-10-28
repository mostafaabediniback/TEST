import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";

export default function DropdownDoneButton({ onClick }) {
  const { locale } = useLocale();
  const label = locale === "fa" ? "انجام شد" : locale === "ar" ? "تم" : "Done";

  return (
    <div className="flex shrink-0 justify-end border-t p-2">
      <Button type="button" onClick={onClick}>
        {label}
      </Button>
    </div>
  );
}
