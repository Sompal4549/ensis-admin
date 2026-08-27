import { ImageData } from "../about/aboutPageContent";

export type ProjectsPageContentKeys =
  | "projects.banner"
  | "projects.whyPartner"
  | "projects.ourProjects"
  | "projects.ourClients"
  | "projects.contactSection"
  | "projects.features_strip";

export type ProjectsBanner = {
  title: { line1: string; line2: string };
  subtitle: string;
  description: string;
  heroImage?: string;
  sectionTitle: string;
  bgImageAlt?: string;
};

export type ClientLogo = {
  id: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  width: number;
  height: number;
};

export type TrustStat = {
  id: string;
  iconSrc: string;
  iconAlt: string;
  value: string;
  label: string;
};

export type OurClients = {
  heading: string;
  subheading: string;
  clients: ClientLogo[];
  stats: TrustStat[];
  decorativeImageSrc: string;
  decorativeImageAlt: string;
};

export type PartnerFeature = {
  id: string;
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
};

export type WhyPartner = {
  heading: string;
  features: PartnerFeature[];
  decorativeImageSrc: string;
  decorativeImageAlt: string;
};

export type ProjectCardImage = {
  imageUrl: string;
  alt: string;
};

export type ProjectCard = {
  id: string;
  title: string;
  location: string;
  image: ProjectCardImage;
};

export type OurProjects = {
  title: string;
  subtitle: string;
  cards: ProjectCard[];
  buttonText: string;
  buttonPath: string;
};

export type Testimonial = {
  id: string;
  logo: string;
  company: string;
  person: string;
  designation: string;
};

export type ContactInfo = {
  officeName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  workingDays: string;
  workingHours: string;
};

export type ContactSection = {
  quote: string;
  testimonials: Testimonial[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonPath: string;
  contact: ContactInfo;
  leftImage: string;
  rightImage: string;
  bottomText: string;
};

export type FeatureStripItem = {
  id: string;
  title: string;
  description: string;
  image: ImageData;
};

export type FeaturesStrip = {
  items: FeatureStripItem[];
};

export const projectsPageKeys: {
  key: ProjectsPageContentKeys;
  label: string;
  description: string;
}[] = [
  {
    key: "projects.banner",
    label: "Projects Banner",
    description: "Banner section for projects page.",
  },
  {
    key: "projects.whyPartner",
    label: "Why Partner",
    description: "Why partner with us section.",
  },
  {
    key: "projects.ourProjects",
    label: "Our Projects",
    description: "Featured projects section.",
  },
  {
    key: "projects.ourClients",
    label: "Our Clients",
    description: "Client logos and trust stats.",
  },
  {
    key: "projects.contactSection",
    label: "Contact Section",
    description: "Contact info and testimonials.",
  },
  {
    key: "projects.features_strip",
    label: "Features Strip",
    description: "Features strip section.",
  },
];

const randomId = () => Math.random().toString(36).slice(2, 9);

export const defaultProjectsData: Record<ProjectsPageContentKeys, unknown> = {
  "projects.banner": {
    title: { line1: "", line2: "" },
    subtitle: "",
    description: "",
    heroImage: "",
    sectionTitle: "",
    bgImageAlt: "",
  },
  "projects.whyPartner": {
    heading: "",
    features: [],
    decorativeImageSrc: "",
    decorativeImageAlt: "",
  },
  "projects.ourProjects": {
    title: "",
    subtitle: "",
    cards: [],
    buttonText: "",
    buttonPath: "",
  },
  "projects.ourClients": {
    heading: "",
    subheading: "",
    clients: [],
    stats: [],
    decorativeImageSrc: "",
    decorativeImageAlt: "",
  },
  "projects.contactSection": {
    quote: "",
    testimonials: [],
    ctaTitle: "",
    ctaDescription: "",
    ctaButtonText: "",
    ctaButtonPath: "",
    contact: {
      officeName: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      workingDays: "",
      workingHours: "",
    },
    leftImage: "",
    rightImage: "",
    bottomText: "",
  },
  "projects.features_strip": {
    items: [],
  },
};
