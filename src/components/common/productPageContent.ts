import { ComponentContent } from "@/lib/api";

export type ProductPageContentKeys =
  | "product.hero"
  | "product.featureStrip"
  | "product.trustedBy"
  | "product.whyChoose"
  | "product.testimonials"
  | 'product.productsection'

export const productPageKeys: { key: ProductPageContentKeys; label: string; description: string }[] = [
  { key: "product.hero", label: "Product Hero Slider", description: "Main banner slider with buttons and descriptions." },
  { key: "product.featureStrip", label: "Wellness Feature Strip", description: "Horizontal strip of image-based features." },
  { key: "product.trustedBy", label: "Trusted By Section", description: "Logos of wellness centers and partners." },
  { key: "product.whyChoose", label: "Why Choose & Welcome", description: "Value propositions and introductory content." },
  { key: "product.testimonials", label: "Product Testimonials", description: "Client reviews and ratings." },
  { key: "product.productsection", label: "Product Section", description: "Product Section data without products listing and categories" }
];

const randomId = () => Math.random().toString(36).slice(2, 9);

export const defaultProductData: Record<ProductPageContentKeys, any> = {
  "product.hero": {
    slides: [{ id: randomId(), title: "", highlight: "", primaryButton: { label: "", url: "" }, secondaryButton: { label: "", url: "" }, description: "", bgImage: "" }]
  },
  "product.featureStrip": {
    features: [{ id: randomId(), image: "", title: "", subtitle: "" }]
  },
  "product.trustedBy": {
    title: "Trusted By Leading Wellness Centers Worldwide",
    images: [""]
  },
  "product.whyChoose": {
    whyChoose: {
      title: "",
      reasons: [""],
      button: { label: "", url: "" },
      bgImage: ""
    },
    welcomeToEnsis: {
      highlight: "",
      title: "",
      description: "",
      button: { label: "", url: "" },
      features: [{ id: randomId(), image: "", title: "" }]
    }
  },
  "product.testimonials": {
    title: "",
    testimonials: [{ id: randomId(), name: "", designation: "", description: "", rating: 5, userImage: "" }]
  },
  "product.productsection":{
    priceRange: { start: 1000, end: 15000 },
    materials:[
      { id: randomId(), title: "Teak Wood" },
      { id: randomId(), title: "Brass" },
      { id: randomId(), title: "Copper" },
      { id: randomId(), title: "Stainless Steel" },
      { id: randomId(), title: "Natural Stone" },
      { id: randomId(), title: "FRP / Composite" },
    ],
    idealFor: [
      { id: randomId(), title: "Spa & Wellness Centers" },
      { id: randomId(), title: "Ayurvedic Clinics" },
      { id: randomId(), title: "Resorts & Hotels" },
      { id: randomId(), title: "Home Wellness" },
    ],
    loadingText: "Loading more products...",
    reachedText: "You've reached the end",
    exploreNow: {
      title: "Explore Now",
      description: 'Tell us about your requirements and our wellness experts will contact you.'
    },
    contact: [{
      id: randomId(),
      imageUrl: "",
      alt: "Call Us",
      value: "+91 9654900525",
      title: "Call Us",
      url: "tel:+919654900525"
    }]
  }
};

export const buildEmptyProductContent = (key: ProductPageContentKeys): Omit<ComponentContent, "_id"> & { key: ProductPageContentKeys } => {
  const data = JSON.parse(JSON.stringify(defaultProductData[key]));
  
  if (key === "product.hero") data.slides = data.slides.map((s: any) => ({ ...s, id: randomId() }));
  if (key === "product.featureStrip") data.features = data.features.map((f: any) => ({ ...f, id: randomId() }));
  if (key === "product.whyChoose") data.welcomeToEnsis.features = data.welcomeToEnsis.features.map((f: any) => ({ ...f, id: randomId() }));
  if (key === "product.testimonials") data.testimonials = data.testimonials.map((t: any) => ({ ...t, id: randomId() }));

  if (key === "product.productsection") {
    data.materials = data.materials.map((m: any) => ({ ...m, id: randomId() }));
    data.idealFor = data.idealFor.map((i: any) => ({ ...i, id: randomId() }));
    data.contact = data.contact.map((c: any) => ({ ...c, id: randomId() }));
  }

  const keyInfo = productPageKeys.find(k => k.key === key);
  return {
    key,
    label: keyInfo?.label || "",
    page: "product",
    description: keyInfo?.description || "",
    isActive: true,
    data,
  };
};