import { useEffect, useState } from "react";
import { defaultCopy } from "@/lib/content";
import type { SiteCopy } from "@/lib/content";
import { getContent } from "@/lib/gallery.functions";
import type { GalleryProject } from "@/lib/gallery";

export type SiteContent = { copy: SiteCopy; projects: GalleryProject[] };

let cache: SiteContent | null = null;
let pending: Promise<SiteContent> | null = null;

export function clearContentCache() {
  cache = null;
  pending = null;
}

export function seedContent(value: SiteContent) {
  cache = value;
  pending = Promise.resolve(value);
}

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(() => cache ?? { copy: defaultCopy, projects: [] });

  useEffect(() => {
    if (cache) {
      setContent(cache);
      return;
    }
    pending ??= getContent()
      .then((value) => {
        cache = value;
        return value;
      })
      .catch(() => ({ copy: defaultCopy, projects: [] }));
    let active = true;
    pending.then((value) => {
      if (active) setContent(cache ?? value);
    });
    return () => {
      active = false;
    };
  }, []);

  return content;
}
