import { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";

// Keep each history entry separate: two visits to the same URL may have
// different filters, pagination or scroll positions.
const entries = new Map();
function remember(key, value) {
  entries.delete(key);
  entries.set(key, value);
  if (entries.size > 500) entries.delete(entries.keys().next().value);
}

export function usePageState(name, initialValue) {
  const { key } = useLocation();
  const navigationType = useNavigationType();
  const cacheKey = `${key}:${name}`;
  const [snapshot, setSnapshot] = useState(() => ({
    key: cacheKey,
    value: entries.has(cacheKey) ? entries.get(cacheKey)
      : typeof initialValue === "function" ? initialValue() : initialValue,
  }));
  let value = snapshot.value;
  if (snapshot.key !== cacheKey) {
    value = navigationType === "POP" && entries.has(cacheKey)
      ? entries.get(cacheKey) : snapshot.value;
    setSnapshot({ key: cacheKey, value });
  }
  useLayoutEffect(() => { remember(cacheKey, value); }, [cacheKey, value]);
  function setValue(next) {
    setSnapshot((current) => ({
      key: cacheKey,
      value: typeof next === "function" ? next(current.value) : next,
    }));
  }
  return [value, setValue];
}

export function usePageBack(fallback) {
  const navigate = useNavigate();
  const location = useLocation();
  return () => {
    // React Router starts a new document at index 0, so direct links never
    // send the user out of the application.
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(fallback, {
      replace: true,
      state: { tableState: location.state?.tableState },
    });
  };
}

export function usePageScroll(name, ready = true) {
  const { key } = useLocation();
  const ref = useRef(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !ready) return;
    const cacheKey = `${key}:scroll:${name}`;
    const saved = entries.get(cacheKey) ?? { top: 0, left: 0 };
    let restoring = true;
    const restore = () => {
      if (!restoring) return;
      element.scrollTop = saved.top;
      element.scrollLeft = saved.left;
    };
    const save = () => {
      if (!restoring) remember(cacheKey, {
        top: element.scrollTop, left: element.scrollLeft,
      });
    };
    const interact = () => { restoring = false; };
    restore();
    // Lists may still be loading when the previous page is mounted again.
    const observer = new ResizeObserver(restore);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    element.addEventListener("scroll", save);
    for (const event of ["wheel", "touchstart", "pointerdown", "keydown"])
      element.addEventListener(event, interact, { passive: true });
    return () => {
      observer.disconnect();
      save();
      element.removeEventListener("scroll", save);
      for (const event of ["wheel", "touchstart", "pointerdown", "keydown"])
        element.removeEventListener(event, interact);
    };
  }, [key, name, ready]);
  return ref;
}
