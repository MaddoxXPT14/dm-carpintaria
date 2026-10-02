import { useEffect } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { site } from "@/lib/site";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function Analytics() {
  useEffect(() => {
    const id = site.analyticsId.trim();
    if (!id || document.getElementById("ga-loader")) return;
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", id);
    const script = document.createElement("script");
    script.id = "ga-loader";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
  }, []);
  return <VercelAnalytics />;
}

export function trackLead() {
  window.gtag?.("event", "generate_lead", { method: "whatsapp" });
}
