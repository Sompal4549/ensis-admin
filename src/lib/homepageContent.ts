import type { ComponentContent } from "./api";

export type HomepageComponentKey =
  | "home.hero"
  | "home.wellnessSection"
  | "home.features"
  | "home.turnkeySolutions"
  | "home.globalPresence"
  | "layout.header"
  | "layout.footer"
  | "home.fullWidthFeatures"
  | "home.productsGrid"
  | "home.wellnessRoomSetups"
  | "home.manufacturingAndProjects"
  | "home.testimonials"
  | "home.blogInsights";

export type HomeHeroSlide = {
  id: string;
  image: string;
  title: string;
  highlight?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  listItems?: string[];
  showLutus?: boolean;
  isCenter?: boolean;
  features?: { imgUrl: string; title: string }[];
};

export type HomeFeaturesFeature = {
  imgUrl: string;
  title: string;
  desc: string;
};

export type HomeTurnkeySolution = {
  imgUrl: string;
  title: string;
};

export type HomeGlobalPresenceStat = {
  value: string;
  label: string;
};

export type HomeWellnessService = {
  image: string;
  title: string;
  description: string;
};

export type HomeWellnessData = {
  welcomeImage: string;
  eyebrow: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  services: HomeWellnessService[];
};

// ---------- NEW TYPES ----------

export type HeaderNavItem = { label: string; href: string };
export type HeaderData = {
  navLinks: never[];
  logoText: string;
  logoTagline: string;
  navItems: HeaderNavItem[];
  ctaText: string;
  ctaHref: string;
  phone: string;
};

export type FooterColumn = { heading: string; links: { label: string; href: string }[] };
export type FooterData = {
  logoText: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  columns: FooterColumn[];
  copyright: string;
  socialLinks: { platform: string; href: string }[];
};

export type FullWidthFeatureItem = { image: string; title: string; description: string; tag?: string };
export type FullWidthFeaturesData = {
  subtitle: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonPath: string;
  features: FullWidthFeatureItem[];
};

export type ProductsGridData = {
  subtitle: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonPath: string;
};

export type RoomSetupCard = { id: string; title: string; image: string; tag?: string };
export type WellnessRoomSetupsData = {
  subtitle: string;
  heading: string;
  cards: RoomSetupCard[];
};

export type ManufacturingProject = { image: string; title: string; location: string };
export type ManufacturingAndProjectsData = {
  subtitle: string;
  heading: string;
  description: string;
  stats: { value: string; label: string }[];
  projects: ManufacturingProject[];
};

export type TestimonialItem = { text: string; name: string; role: string; image: string };
export type TestimonialsData = {
  subtitle: string;
  testimonials: TestimonialItem[];
};

export type BlogItem = { title: string; image: string };
export type BlogInsightsData = {
  subtitle: string;
  heading: string;
  buttonText: string;
  buttonPath: string;
  blogs: BlogItem[];
  ctaHeading: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonPath: string;
  ctaBgImage: string;
};

// ---------- UNION TYPE ----------

export type HomepageData =
  | { slides: HomeHeroSlide[] }
  | HomeWellnessData
  | { features: HomeFeaturesFeature[] }
  | { eyebrow: string; heading: string; description: string; buttonText: string; buttonHref?: string; backgroundImage: string; solutions: HomeTurnkeySolution[] }
  | { eyebrow: string; heading: string; description: string; image: string; stats: HomeGlobalPresenceStat[] }
  | HeaderData
  | FooterData
  | FullWidthFeaturesData
  | ProductsGridData
  | WellnessRoomSetupsData
  | ManufacturingAndProjectsData
  | TestimonialsData
  | BlogInsightsData;

// ---------- KEY REGISTRY ----------

export const homepageKeys: { key: HomepageComponentKey; label: string; description: string }[] = [
  { key: "home.hero", label: "Home Hero", description: "Homepage hero slider with image, title, highlight, buttons, features, and list items." },
  { key: "home.wellnessSection", label: "Wellness Section", description: "Wellness section with welcome text, welcome image, and service cards." },
  { key: "home.features", label: "Home Features", description: "Feature cards with image, title, and description." },
  { key: "home.turnkeySolutions", label: "Home Turnkey Solutions", description: "Turnkey solutions section with heading, background image, and solution cards." },
  { key: "home.globalPresence", label: "Home Global Presence", description: "Global presence section with image and stat cards." },
  { key: "layout.header", label: "Header", description: "Site header: logo, nav links, CTA button, and phone number." },
  { key: "layout.footer", label: "Footer", description: "Site footer: logo, address, columns, social links, and copyright." },
  { key: "home.fullWidthFeatures", label: "Full Width Features", description: "Full-width feature cards with image, title, description, and tag." },
  { key: "home.productsGrid", label: "Products Grid", description: "Products section headings, description, and CTA button." },
  { key: "home.wellnessRoomSetups", label: "Wellness Room Setups", description: "Room setup grid cards with title, image, and tag." },
  { key: "home.manufacturingAndProjects", label: "Manufacturing & Projects", description: "Manufacturing section with stats and project cards." },
  { key: "home.testimonials", label: "Testimonials", description: "Testimonial cards with text, name, role, and image." },
  { key: "home.blogInsights", label: "Blog Insights", description: "Blog section heading, blog cards, and CTA strip." },
];

const randomId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ---------- DEFAULT DATA ----------

export const defaultHomepageData: Record<HomepageComponentKey, HomepageData> = {
  "home.hero": {
    slides: [{ id: "", image: "", title: "", highlight: "", description: "", primaryButtonText: "", primaryButtonHref: "", secondaryButtonText: "", secondaryButtonHref: "", listItems: [""], showLutus: false, isCenter: false, features: [{ imgUrl: "", title: "" }] }],
  },
  "home.wellnessSection": {
    welcomeImage: "", eyebrow: "", heading: "", description: "", buttonText: "", buttonHref: "",
    services: [{ image: "", title: "", description: "" }, { image: "", title: "", description: "" }],
  },
  "home.features": { features: [{ imgUrl: "", title: "", desc: "" }] },
  "home.turnkeySolutions": { eyebrow: "", heading: "", description: "", buttonText: "", buttonHref: "", backgroundImage: "", solutions: [{ imgUrl: "", title: "" }] },
  "home.globalPresence": { eyebrow: "", heading: "", description: "", image: "", stats: [{ value: "", label: "" }] },
  "layout.header": {
    logoText: "ENSIS", logoTagline: "Wellness Equipment",
    navItems: [{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }],
    ctaText: "Get Quote", ctaHref: "/contact", phone: "",
  },
  "layout.footer": {
    logoText: "ENSIS", tagline: "", address: "", phone: "", email: "",
    columns: [{ heading: "Quick Links", links: [{ label: "Home", href: "/" }] }],
    copyright: `© ${new Date().getFullYear()} Ensis. All rights reserved.`,
    socialLinks: [{ platform: "facebook", href: "" }],
  },
  "home.fullWidthFeatures": {
    subtitle: "", heading: "", description: "", buttonText: "", buttonPath: "/products",
    features: [{ image: "", title: "", description: "", tag: "" }],
  },
  "home.productsGrid": { subtitle: "", heading: "", description: "", buttonText: "View All Products", buttonPath: "/products" },
  "home.wellnessRoomSetups": { subtitle: "", heading: "", cards: [{ id: randomId(), title: "", image: "", tag: "" }] },
  "home.manufacturingAndProjects": {
    subtitle: "", heading: "", description: "",
    stats: [{ value: "", label: "" }],
    projects: [{ image: "", title: "", location: "" }],
  },
  "home.testimonials": { subtitle: "", testimonials: [{ text: "", name: "", role: "", image: "" }] },
  "home.blogInsights": {
    subtitle: "", heading: "", buttonText: "VIEW ALL BLOGS", buttonPath: "/blog",
    blogs: [{ title: "", image: "" }],
    ctaHeading: "", ctaDescription: "", ctaButtonText: "CONTACT US TODAY", ctaButtonPath: "/contact", ctaBgImage: "",
  },
};

export const createHomepageData = (key: HomepageComponentKey): HomepageData => {
  const data = JSON.parse(JSON.stringify(defaultHomepageData[key])) as HomepageData;
  if (key === "home.hero") {
    return { slides: (data as { slides: HomeHeroSlide[] }).slides.map((slide) => ({ ...slide, id: randomId() })) };
  }
  if (key === "home.wellnessRoomSetups") {
    return { ...(data as WellnessRoomSetupsData), cards: (data as WellnessRoomSetupsData).cards.map((c) => ({ ...c, id: randomId() })) };
  }
  return data;
};

export const buildEmptyHomepageContent = (key: HomepageComponentKey): Omit<ComponentContent, "_id"> & { key: HomepageComponentKey } => ({
  key,
  label: "",
  page: key.startsWith("layout.") ? "layout" : "home",
  description: "",
  isActive: true,
  data: createHomepageData(key),
});

const isNonEmptyString = (value: unknown) => typeof value === "string" && value.trim().length > 0;

export const validateHomepageContent = (content: Omit<ComponentContent, "_id">) => {
  const errors: string[] = [];
  if (!isNonEmptyString(content.key)) errors.push("Component key is required.");
  if (!isNonEmptyString(content.label)) errors.push("Label is required.");
  if (!isNonEmptyString(content.page)) errors.push("Page is required.");

  const data = content.data as HomepageData;
  switch (content.key) {
    case "home.hero": {
      const slides = (data as { slides: HomeHeroSlide[] }).slides || [];
      if (!slides.length) errors.push("At least one hero slide is required.");
      slides.forEach((slide, index) => {
        if (!isNonEmptyString(slide.image)) errors.push(`Slide ${index + 1}: image is required.`);
        if (!isNonEmptyString(slide.title)) errors.push(`Slide ${index + 1}: title is required.`);
      });
      break;
    }
    case "home.wellnessSection": {
      const w = data as HomeWellnessData;
      if (!isNonEmptyString(w.welcomeImage)) errors.push("Welcome image is required.");
      if (!isNonEmptyString(w.eyebrow)) errors.push("Eyebrow is required.");
      if (!isNonEmptyString(w.heading)) errors.push("Heading is required.");
      if (!isNonEmptyString(w.description)) errors.push("Description is required.");
      if (!isNonEmptyString(w.buttonText)) errors.push("Button text is required.");
      if (!isNonEmptyString(w.buttonHref)) errors.push("Button href is required.");
      if (!w.services?.length) errors.push("At least one service card is required.");
      w.services?.forEach((s, i) => {
        if (!isNonEmptyString(s.image)) errors.push(`Service ${i + 1}: image is required.`);
        if (!isNonEmptyString(s.title)) errors.push(`Service ${i + 1}: title is required.`);
      });
      break;
    }
    case "home.features": {
      const features = (data as { features: HomeFeaturesFeature[] }).features || [];
      if (!features.length) errors.push("At least one feature is required.");
      features.forEach((f, i) => {
        if (!isNonEmptyString(f.imgUrl)) errors.push(`Feature ${i + 1}: image is required.`);
        if (!isNonEmptyString(f.title)) errors.push(`Feature ${i + 1}: title is required.`);
        if (!isNonEmptyString(f.desc)) errors.push(`Feature ${i + 1}: description is required.`);
      });
      break;
    }
    case "home.turnkeySolutions": {
      const t = data as { eyebrow: string; heading: string; description: string; buttonText: string; backgroundImage: string; solutions: HomeTurnkeySolution[] };
      if (!isNonEmptyString(t.eyebrow)) errors.push("Eyebrow is required.");
      if (!isNonEmptyString(t.heading)) errors.push("Heading is required.");
      if (!isNonEmptyString(t.description)) errors.push("Description is required.");
      if (!isNonEmptyString(t.buttonText)) errors.push("Button text is required.");
      if (!isNonEmptyString(t.backgroundImage)) errors.push("Background image is required.");
      if (!t.solutions?.length) errors.push("At least one solution is required.");
      t.solutions?.forEach((s, i) => {
        if (!isNonEmptyString(s.title)) errors.push(`Solution ${i + 1}: title is required.`);
      });
      break;
    }
    case "home.globalPresence": {
      const p = data as { eyebrow: string; heading: string; description: string; image: string; stats: HomeGlobalPresenceStat[] };
      if (!isNonEmptyString(p.eyebrow)) errors.push("Eyebrow is required.");
      if (!isNonEmptyString(p.heading)) errors.push("Heading is required.");
      if (!isNonEmptyString(p.description)) errors.push("Description is required.");
      if (!isNonEmptyString(p.image)) errors.push("Image is required.");
      if (!p.stats?.length) errors.push("At least one stat is required.");
      p.stats?.forEach((s, i) => {
        if (!isNonEmptyString(s.value)) errors.push(`Stat ${i + 1}: value is required.`);
        if (!isNonEmptyString(s.label)) errors.push(`Stat ${i + 1}: label is required.`);
      });
      break;
    }
    case "layout.header": {
      const h = data as HeaderData;
      if (!isNonEmptyString(h.logoText)) errors.push("Logo text is required.");
      if (!h.navItems?.length) errors.push("At least one nav item is required.");
      break;
    }
    case "layout.footer": {
      const f = data as FooterData;
      if (!isNonEmptyString(f.logoText)) errors.push("Logo text is required.");
      if (!isNonEmptyString(f.copyright)) errors.push("Copyright text is required.");
      break;
    }
    case "home.fullWidthFeatures": {
      const d = data as FullWidthFeaturesData;
      if (!isNonEmptyString(d.heading)) errors.push("Heading is required.");
      if (!d.features?.length) errors.push("At least one feature is required.");
      break;
    }
    case "home.productsGrid": {
      const d = data as ProductsGridData;
      if (!isNonEmptyString(d.heading)) errors.push("Heading is required.");
      break;
    }
    case "home.wellnessRoomSetups": {
      const d = data as WellnessRoomSetupsData;
      if (!isNonEmptyString(d.heading)) errors.push("Heading is required.");
      if (!d.cards?.length) errors.push("At least one room card is required.");
      break;
    }
    case "home.manufacturingAndProjects": {
      const d = data as ManufacturingAndProjectsData;
      if (!isNonEmptyString(d.heading)) errors.push("Heading is required.");
      break;
    }
    case "home.testimonials": {
      const d = data as TestimonialsData;
      if (!d.testimonials?.length) errors.push("At least one testimonial is required.");
      d.testimonials?.forEach((t, i) => {
        if (!isNonEmptyString(t.text)) errors.push(`Testimonial ${i + 1}: text is required.`);
        if (!isNonEmptyString(t.name)) errors.push(`Testimonial ${i + 1}: name is required.`);
      });
      break;
    }
    case "home.blogInsights": {
      const d = data as BlogInsightsData;
      if (!isNonEmptyString(d.heading)) errors.push("Heading is required.");
      if (!d.blogs?.length) errors.push("At least one blog entry is required.");
      d.blogs?.forEach((b, i) => {
        if (!isNonEmptyString(b.title)) errors.push(`Blog ${i + 1}: title is required.`);
      });
      break;
    }
    default:
      errors.push("Unsupported homepage component key.");
  }
  return errors;
};
