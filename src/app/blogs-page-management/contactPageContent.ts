import { ComponentContent } from "@/lib/api";

export type ContactPageContentKeys =
  | "contact.hero"
  | "contact.getInTouch"
  | "contact.featuresStrip";

export const contactPageKeys: { key: ContactPageContentKeys; label: string; description: string }[] = [
  { key: "contact.hero", label: "Contact Hero", description: "Main banner with heading, highlighted text, and icon features." },
  { key: "contact.getInTouch", label: "Get In Touch", description: "Contact details grid and social media links." },
  { key: "contact.featuresStrip", label: "Features Strip", description: "Horizontal strip of icon-based features." },
];

export const defaultContactData: Record<ContactPageContentKeys, any> = {
  "contact.hero": {
    heading: "", title: "", highlightedText: "", description: "", bgImage: "",
    features: [{ id: "1", iconImage: "", title: "" }]
  },
  "contact.getInTouch": {
    title: "", description: "",
    contactDetails: [{ id: "1", icon: "", title: "", description: "" }],
    socialLinks: {
      iconImage: "", title: "",
      links: [{ id: "1", iconImage: "", link: "" }]
    }
  },
  "contact.featuresStrip": {
    features: [{ id: "1", iconImage: "", title: "", description: "" }]
  }
};

export const buildEmptyContactContent = (key: ContactPageContentKeys): Omit<ComponentContent, "_id"> & { key: ContactPageContentKeys } => {
  const data = JSON.parse(JSON.stringify(defaultContactData[key]));
  const randomId = () => Math.random().toString(36).slice(2, 9);

  if (data.features) {
    data.features = data.features.map((f: any) => ({ ...f, id: randomId() }));
  }
  if (data.contactDetails) {
    data.contactDetails = data.contactDetails.map((d: any) => ({ ...d, id: randomId() }));
  }
  if (data.socialLinks?.links) {
    data.socialLinks.links = data.socialLinks.links.map((l: any) => ({ ...l, id: randomId() }));
  }
  if (key === "contact.featuresStrip") {
    data.features = data.features.map((f: any) => ({ ...f, id: randomId() }));
  }

  const keyInfo = contactPageKeys.find(k => k.key === key);

  return {
    key,
    label: keyInfo?.label || "",
    page: "contact",
    description: keyInfo?.description || "",
    isActive: true,
    data,
  };
};