"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { componentContentApi, type ComponentContent } from "@/lib/api";
import {
  buildEmptyHomepageContent,
  createHomepageData,
  homepageKeys,
  validateHomepageContent,
  type HomepageComponentKey,
  type HomepageData,
} from "@/lib/homepageContent";

type HomepageContentForm = Omit<ComponentContent, "_id" | "key" | "data"> & {
  key: HomepageComponentKey;
  data: HomepageData;
};

type HomepageContentContextValue = {
  componentId: string | null;
  errors: string[];
  form: HomepageContentForm;
  loading: boolean;
  message: string;
  setData: (data: HomepageData) => void;
  setForm: Dispatch<SetStateAction<HomepageContentForm>>;
  save: () => Promise<void>;
  refresh: () => Promise<void>;
};

const HomepageContentContext = createContext<HomepageContentContextValue | null>(null);

const getKeyMeta = (key: HomepageComponentKey) => homepageKeys.find((item) => item.key === key);

const makeRouteForm = (key: HomepageComponentKey): HomepageContentForm => {
  const empty = buildEmptyHomepageContent(key);
  const meta = getKeyMeta(key);
  return {
    ...empty,
    label: meta?.label || empty.label,
    description: meta?.description || empty.description,
    data: createHomepageData(key),
  };
};

export function HomepageContentProvider({
  children,
  componentKey,
}: {
  children: ReactNode;
  componentKey: HomepageComponentKey;
}) {
  const [componentId, setComponentId] = useState<string | null>(null);
  const [form, setForm] = useState<HomepageContentForm>(() => makeRouteForm(componentKey));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setErrors([]);
    try {
      const item = await componentContentApi.getByKey(componentKey);
      setComponentId(item._id);
      setForm({
        key: componentKey,
        label: item.label || getKeyMeta(componentKey)?.label || "",
        page: item.page || (componentKey.startsWith("layout.") ? "layout" : "home"),
        description: item.description || getKeyMeta(componentKey)?.description || "",
        isActive: item.isActive,
        data: (item.data || createHomepageData(componentKey)) as HomepageData,
      });
    } catch (error) {
      setComponentId(null);
      setForm(makeRouteForm(componentKey));
      setMessage((error as Error).message || "Component not found. Fill the form and save to create it.");
    } finally {
      setLoading(false);
    }
  }, [componentKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setData = (data: HomepageData) => setForm((current) => ({ ...current, data }));

  const save = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setErrors([]);

    const payload = {
      key: componentKey,
      label: form.label.trim(),
      page: form.page.trim() || (componentKey.startsWith("layout.") ? "layout" : "home"),
      description: form.description?.trim() || "",
      isActive: form.isActive,
      data: form.data,
    };

    let nextErrors = validateHomepageContent(payload);
    
    // Remove "Heading is required" error for Full Width Features components as they don't use a top-level heading
    if (componentKey === "home.fullWidthFeatures" || componentKey === "home.features") {
      nextErrors = nextErrors.filter((err) => err !== "Heading is required.");
    }

    if (nextErrors.length) {
      setErrors(nextErrors);
      setLoading(false);
      return;
    }

    try {
      if (componentId) {
        await componentContentApi.update(componentId, payload);
        setMessage("Component updated successfully.");
      } else {
        const created = await componentContentApi.create(payload);
        setComponentId(created._id);
        setMessage("Component created successfully.");
      }
      await refresh();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [componentKey, form, componentId, refresh]);

  const value = useMemo(
    () => ({ componentId, errors, form, loading, message, setData, setForm, save, refresh }),
    [componentId, errors, form, loading, message, save, refresh],
  );

  return <HomepageContentContext.Provider value={value}>{children}</HomepageContentContext.Provider>;
}

export function useHomepageContent() {
  const context = useContext(HomepageContentContext);
  if (!context) {
    throw new Error("useHomepageContent must be used inside HomepageContentProvider");
  }
  return context;
}
