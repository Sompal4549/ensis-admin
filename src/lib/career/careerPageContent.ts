import { ImageData } from "../about/aboutPageContent";

export type CareerPageContentKeys =
  | "career.banner"
  | "career.section"
  | "career.benefits"
  | "career.talentCommunity"
  | "career.whyWork"
  | "career.featuresStrip"
  | "career.testimonials";

export type CareerBanner = {
  bgImage: ImageData;
  heading: string;
  titlePart1: string;
  titlePart2: string;
  titlePart3: string;
  description: string;
  buttonText: string;
  buttonPath: string;
};

export type CareerSection = {
  heading: string;
  titlePart1: string;
  titlePart2: string;
  description: string;
  buttonPath: string;
  buttonLabel: string;
  RightImageGrid: ImageData[];
  leftSide: {
    heading: string;
    description: string;
    filter: { value: string; label: string }[];
    buttonPath: string;
    buttonLabel: string;
  };
  ourHiringJourney: {
    title: string;
    description: string;
    steps: { label: string; description: string }[];
  };
  careerForm: {
    title: string;
    description: string;
    termsText: string;
    buttonText: string;
  };
};

export type CareerBenefits = {
  title: string;
  benefits: { title: string; description: string; icon: string }[];
};

export type CareerTalentCommunity = {
  bgImage: ImageData;
  heading: string;
  description: string;
  features: string[];
  newsLetterCard: {
    title: string;
    description: string;
    buttonText: string;
  };
};

export type CareerWhyWork = {
  title1: string;
  title2: string;
  heading: string;
  description: string;
  cards: { title: string; description: string; icon: string }[];
};

export type CareerFeaturesStrip = {
  features: { id: string; image: string; title: string; subtitle: string }[];
};

export type CareerTestimonials = {
  title: string;
  testimonials: {
    text: string;
    name: string;
    role: string;
    image: string;
  }[];
};

export const careerPageKeys: { key: CareerPageContentKeys; label: string; description: string }[] = [
  { key: "career.banner", label: "Career Banner", description: "Banner section for career page." },
  { key: "career.section", label: "Career Section", description: "Main career section with hiring journey and form." },
  { key: "career.benefits", label: "Career Benefits", description: "Benefits section for career page." },
  { key: "career.talentCommunity", label: "Talent Community", description: "Talent community newsletter section." },
  { key: "career.whyWork", label: "Why Work", description: "Why work with us section." },
  { key: "career.featuresStrip", label: "Features Strip", description: "Features strip section." },
  { key: "career.testimonials", label: "Testimonials", description: "Career testimonials section." },
];

const randomId = () => Math.random().toString(36).slice(2, 9);

export const defaultCareerData: Record<CareerPageContentKeys, unknown> = {
  "career.banner": {
    bgImage: { imageUrl: "", alt: "" },
    heading: "",
    titlePart1: "",
    titlePart2: "",
    titlePart3: "",
    description: "",
    buttonText: "",
    buttonPath: "",
  },
  "career.section": {
    heading: "",
    titlePart1: "",
    titlePart2: "",
    description: "",
    buttonPath: "",
    buttonLabel: "",
    RightImageGrid: [],
    leftSide: {
      heading: "",
      description: "",
      filter: [],
      buttonPath: "",
      buttonLabel: "",
    },
    ourHiringJourney: {
      title: "",
      description: "",
      steps: [],
    },
    careerForm: {
      title: "",
      description: "",
      termsText: "",
      buttonText: "",
    },
  },
  "career.benefits": {
    title: "",
    benefits: [],
  },
  "career.talentCommunity": {
    bgImage: { imageUrl: "", alt: "" },
    heading: "",
    description: "",
    features: [""],
    newsLetterCard: {
      title: "",
      description: "",
      buttonText: "",
    },
  },
  "career.whyWork": {
    title1: "",
    title2: "",
    heading: "",
    description: "",
    cards: [],
  },
  "career.featuresStrip": {
    features: [{ id: randomId(), image: "", title: "", subtitle: "" }],
  },
  "career.testimonials": {
    title: "",
    testimonials: [],
  },
};
