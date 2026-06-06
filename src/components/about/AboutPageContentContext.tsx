import type { ComponentContent } from "@/lib/api";

type AboutPageContentForm = Omit<ComponentContent, "_id" | "key" | "data"> & {
  key: AboutPageComponentKey;
  data: AboutPageData;
};