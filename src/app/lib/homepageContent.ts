import type { ComponentContent } from "./api";

export type HomepageComponentKey = "home.hero" | "home.features" | "home.turnkeySolutions" | "home.globalPresence";

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

export type HomepageData =
  | { slides: HomeHeroSlide[] }
  | { features: HomeFeaturesFeature[] }
  | {
      eyebrow: string;
      heading: string;
      description: string;
      buttonText: string;
      buttonHref?: string;
      backgroundImage: string;
      solutions: HomeTurnkeySolution[];
    }
  | {
      eyebrow: string;
      heading: string;
      description: string;
      image: string;
      stats: HomeGlobalPresenceStat[];
    };

export const homepageKeys: { key: HomepageComponentKey; label: string; description: string }[] = [
  {
    key: "home.hero",
    label: "Home Hero",
    description: "Homepage hero slider with image, title, highlight, buttons, and list items.",
  },
  {
    key: "home.features",
    label: "Home Features",
    description: "Feature cards with image, title, and description.",
  },
  {
    key: "home.turnkeySolutions",
    label: "Home Turnkey Solutions",
    description: "Turnkey solutions section with heading, background image, and solution cards.",
  },
  {
    key: "home.globalPresence",
    label: "Home Global Presence",
    description: "Global presence section with image and stat cards.",
  },
];

const randomId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const defaultHomepageData: Record<HomepageComponentKey, HomepageData> = {
  "home.hero": {
    slides: [
      {
        id: "",
        image: "",
        title: "",
        highlight: "",
        description: "",
        primaryButtonText: "",
        primaryButtonHref: "",
        secondaryButtonText: "",
        secondaryButtonHref: "",
        listItems: [""],
        showLutus: false,
        isCenter: false,
      },
    ],
  },
  "home.features": {
    features: [
      {
        imgUrl: "",
        title: "",
        desc: "",
      },
    ],
  },
  "home.turnkeySolutions": {
    eyebrow: "",
    heading: "",
    description: "",
    buttonText: "",
    buttonHref: "",
    backgroundImage: "",
    solutions: [{ imgUrl: "", title: "" }],
  },
  "home.globalPresence": {
    eyebrow: "",
    heading: "",
    description: "",
    image: "",
    stats: [{ value: "", label: "" }],
  },
};

export const createHomepageData = (key: HomepageComponentKey): HomepageData => {
  const data = JSON.parse(JSON.stringify(defaultHomepageData[key])) as HomepageData;
  if (key === "home.hero") {
    return {
      slides: (data as { slides: HomeHeroSlide[] }).slides.map((slide) => ({
        ...slide,
        id: randomId(),
      })),
    };
  }
  return data;
};

export const buildEmptyHomepageContent = (key: HomepageComponentKey): Omit<ComponentContent, "_id"> & { key: HomepageComponentKey } => ({
  key,
  label: "",
  page: "home",
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
    case "home.features": {
      const features = (data as { features: HomeFeaturesFeature[] }).features || [];
      if (!features.length) errors.push("At least one feature is required.");
      features.forEach((feature, index) => {
        if (!isNonEmptyString(feature.imgUrl)) errors.push(`Feature ${index + 1}: image is required.`);
        if (!isNonEmptyString(feature.title)) errors.push(`Feature ${index + 1}: title is required.`);
        if (!isNonEmptyString(feature.desc)) errors.push(`Feature ${index + 1}: description is required.`);
      });
      break;
    }
    case "home.turnkeySolutions": {
      const turnkey = data as {
        eyebrow: string;
        heading: string;
        description: string;
        buttonText: string;
        backgroundImage: string;
        solutions: HomeTurnkeySolution[];
      };
      if (!isNonEmptyString(turnkey.eyebrow)) errors.push("Eyebrow is required.");
      if (!isNonEmptyString(turnkey.heading)) errors.push("Heading is required.");
      if (!isNonEmptyString(turnkey.description)) errors.push("Description is required.");
      if (!isNonEmptyString(turnkey.buttonText)) errors.push("Button text is required.");
      if (!isNonEmptyString(turnkey.backgroundImage)) errors.push("Background image is required.");
      if (!turnkey.solutions?.length) errors.push("At least one solution is required.");
      turnkey.solutions.forEach((solution, index) => {
        if (!isNonEmptyString(solution.imgUrl)) errors.push(`Solution ${index + 1}: image is required.`);
        if (!isNonEmptyString(solution.title)) errors.push(`Solution ${index + 1}: title is required.`);
      });
      break;
    }
    case "home.globalPresence": {
      const presence = data as {
        eyebrow: string;
        heading: string;
        description: string;
        image: string;
        stats: HomeGlobalPresenceStat[];
      };
      if (!isNonEmptyString(presence.eyebrow)) errors.push("Eyebrow is required.");
      if (!isNonEmptyString(presence.heading)) errors.push("Heading is required.");
      if (!isNonEmptyString(presence.description)) errors.push("Description is required.");
      if (!isNonEmptyString(presence.image)) errors.push("Image is required.");
      if (!presence.stats?.length) errors.push("At least one stat is required.");
      presence.stats.forEach((stat, index) => {
        if (!isNonEmptyString(stat.value)) errors.push(`Stat ${index + 1}: value is required.`);
        if (!isNonEmptyString(stat.label)) errors.push(`Stat ${index + 1}: label is required.`);
      });
      break;
    }
    default:
      errors.push("Unsupported homepage component key.");
  }
  return errors;
};
