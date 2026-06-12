import { ImageData } from "@/lib/about/aboutPageContent";

export type TurnkeyPageContentKeys =
  | "turnkey.banner"
  | "turnkey.whatIsTurnkey"
  | "turnkey.completeSolutions"
  | "turnkey.facilities"
  | "turnkey.customized"
  | "turnkey.featuredProjects";

export type TurnkeyBanner = {
  subheading: string;
  title: string;
  description: string;
  features: { id: string; image: ImageData; title: string }[];
  primaryButton: { label: string; url: string };
  secondaryButton: { label: string; url: string };
};

export type TurnkeyWhatIs = {
  subheading: string;
  title: string;
  description: string;
  mostProjectsTitle:string;
  mostProjects: { id: string; image: ImageData; title: string }[];
  withEnsis: { title: string; image: ImageData };
};

export type TurnkeySolutions = {
  title: string;
  cards: { id: string; image: ImageData; title: string; description: string }[];
};

export type TurnkeyFacilities = {
  title: string;
  cards: { id: string; image: ImageData; title: string }[];
};

export type TurnkeyCustomized = {
  backgroundImage: ImageData;
  title: string;
  stats: { id: string; title: string; description: string }[];
  features: { id: string; image: ImageData; title: string }[];
};

export type TurnkeyFeaturedProjects = {
  cards: { id: string; image: ImageData; title: string; location: string }[];
  primaryButton: { label: string; url: string };
};

export const turnkeyPageKeys: { key: TurnkeyPageContentKeys; label: string; description: string }[] = [
  { key: "turnkey.banner", label: "Turnkey Banner", description: "Banner section with features and CTA buttons." },
  { key: "turnkey.whatIsTurnkey", label: "What is Turnkey", description: "Explanation of turnkey solutions with project comparisons." },
  { key: "turnkey.completeSolutions", label: "Complete Solutions", description: "Grid of turnkey solution cards." },
  { key: "turnkey.facilities", label: "Facilities We Build", description: "Section showcasing types of facilities built." },
  { key: "turnkey.customized", label: "Customized Wellness Facilities", description: "Customized facilities with stats and features." },
  { key: "turnkey.featuredProjects", label: "Featured Turnkey Projects", description: "Highlighted turnkey project gallery." },
];

const randomId = () => Math.random().toString(36).slice(2, 9);

export const defaultTurnkeyData: Record<TurnkeyPageContentKeys, unknown> = {
  "turnkey.banner": {
    subheading: "END-TO-END SOLUTIONS",
    title: "Comprehensive Turnkey Projects",
    description: "We handle everything from conceptualization to the final handover.",
    highlight:"Complete Wellness Spaces",
    features: [
      { id: randomId(), title: "Concept Design", image: { imageUrl: "", alt: "" } },
      { id: randomId(), title: "Expert Engineering", image: { imageUrl: "", alt: "" } }
    ],
    primaryButton: { label: "Get a Quote", url: "/contact" },
    secondaryButton: { label: "Our Process", url: "#process" }
  },
  "turnkey.whatIsTurnkey": {
    subheading: "DEFINITION",
    title: "What Does Turnkey Mean?",
    description: "A turnkey project is a type of project that is constructed so that it could be sold to any buyer as a completed product.",
    mostProjects: [
      { id: randomId(), title: "Fragmented Management", image: { imageUrl: "", alt: "" } }
    ],
    mostProjectsTitle:"Most Projects Need Multiple Vendors",
    withEnsis: {
      title: "The Ensis Advantage",
      image: { imageUrl: "", alt: "" }
    }
  },
  "turnkey.completeSolutions": {
    title: "Our Complete Turnkit Solutions",
    cards: [
      {
        id: randomId(),
        title: "Panchkarma Centers",
        description: "Complete setup for Ayurvedic treatment centers.",
        image: { imageUrl: "", alt: "" }
      }
    ]
  },
  "turnkey.facilities": {
    title: "Facilities We Build",
    cards: [
      { id: randomId(), title: "Yoga Studios", image: { imageUrl: "", alt: "" } }
    ]
  },
  "turnkey.customized": {
    backgroundImage: { imageUrl: "", alt: "" },
    title: "And Many More Customized Wellness Facilities",
    stats: [
      { id: randomId(), title: "500+", description: "Projects Completed" }
    ],
    statsTitle:"Why Clients Choose Ensis?",
    features: [
      { id: randomId(), title: "Smart Integration", image: { imageUrl: "", alt: "" } }
    ]
  },
  "turnkey.featuredProjects": {
    cards: [
      {
        id: randomId(),
        title: "Ayurvedic Hospital",
        location: "Kerala, India",
        image: { imageUrl: "", alt: "" }
      }
    ],
    primaryButton: { label: "View All Projects", url: "/projects" },
    title:"Featured Turnkey Projects"
  }
};