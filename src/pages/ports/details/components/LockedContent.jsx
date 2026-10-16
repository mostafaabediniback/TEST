import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LockedContent() {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-md bg-slate-50 px-4 py-6 text-center">
      <p className="text-sm text-slate-500">Locked content</p>
      <p className="mt-2 font-medium text-slate-700">
        Upgrade your account to unlock this
      </p>
      <Button size="sm" className="mt-3">
        <Sparkles className="me-2 size-4" />
        Upgrade
      </Button>
    </div>
  );
}
