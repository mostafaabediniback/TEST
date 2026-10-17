import { useCallback, useEffect, useState } from "react";

const INTRO_STORAGE_KEY = "tooba:intro-seen";
const INTRO_DURATION = 2600;
const EXIT_DURATION = 360;

function shouldShowIntro() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
    return false;
  try {
    return window.sessionStorage.getItem(INTRO_STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

export default function StartupIntro({ children, brandName = "Tooba" }) {
  const [visible, setVisible] = useState(shouldShowIntro);
  const [leaving, setLeaving] = useState(false);
  const [typedLength, setTypedLength] = useState(0);
  const finish = useCallback(() => {
    try {
      window.sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {
      // Browsers with storage disabled can still enter the app.
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timers = Array.from(brandName, (_, index) =>
      window.setTimeout(() => setTypedLength(index + 1), 650 + index * 150),
    );
    timers.push(
      window.setTimeout(() => setLeaving(true), INTRO_DURATION - EXIT_DURATION),
    );
    timers.push(window.setTimeout(finish, INTRO_DURATION));
    const onKeyDown = (event) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [visible, brandName, finish]);

  if (!visible) return children;

  return (
    <main
      className={`startup-intro${leaving ? " startup-intro--leaving" : ""}`}
    >
      <div className="startup-intro-brand">
        <div className="startup-intro-logo">
          <img
            src="/projectIcon.jpg"
            alt=""
            width="232"
            height="232"
            fetchPriority="high"
          />
        </div>
        <h1 className="startup-intro-name" dir="ltr" aria-label={brandName}>
          <span className="startup-intro-name-reserve" aria-hidden="true">
            {brandName}
          </span>
          <span className="startup-intro-name-typed" aria-hidden="true">
            {Array.from(brandName).slice(0, typedLength).join("")}
            <span className="startup-intro-cursor" />
          </span>
        </h1>
        <span className="startup-intro-rule" aria-hidden="true" />
      </div>

    </main>
  );
}
