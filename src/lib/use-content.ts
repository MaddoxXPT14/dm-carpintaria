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

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>({ copy: defaultCopy, projects: [] });

  useEffect(() => {
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
