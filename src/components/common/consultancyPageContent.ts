import { ComponentContent } from "@/lib/api";

export type ConsultancyPageContentKeys =
  | "consultancy.hero"
  | "consultancy.features"
  | "consultancy.whatWeOffer"
  | "consultancy.whyChooseOurProcess"
  | "consultancy.readyToGetStarted"
  | "consultancy.features_strip";

export const consultancyPageKeys: { key: ConsultancyPageContentKeys; label: string; description: string }[] = [
  { key: "consultancy.hero", label: "Consultancy Hero", description: "Banner with heading, features list and background." },
  { key: "consultancy.features", label: "Consultancy Features", description: "Grid of featured items." },
  { key: "consultancy.whatWeOffer", label: "What We Offer", description: "Services overview and detailed service cards." },
  { key: "consultancy.whyChooseOurProcess", label: "Process & Values", description: "Combined section for values and step-by-step process." },
  { key: "consultancy.readyToGetStarted", label: "Ready to Start", description: "Final CTA section for lead generation." },
  { key: "consultancy.features_strip", label: "Features Strip", description: "Stats strip below the banner." },
];

const randomId = () => Math.random().toString(36).slice(2, 9);

export const defaultConsultancyData: Record<ConsultancyPageContentKeys, any> = {
  "consultancy.hero": {
    heading: "", title: "", description: "", bgImage: "", titlepart1: "", titlepart2: "", titleHighlight: "",
    features: [{ id: randomId(), image: "", title: "", description: "", primaryButton: { label: "", href: "" }, secondaryButton: { label: "", href: "" } }]
  },
  "consultancy.features": {
    items: [{ id: randomId(), title: "", heading: "", description: "", image: "" }]
  },
  "consultancy.whatWeOffer": {
    subheading: "", title: "", description: "",
    serviceCards: [{ id: randomId(), title: "", description: "", learnMoreLink: "", image: "", learnMoreText: "" }]
  },
  "consultancy.whyChooseOurProcess": {
    whyChoose: { heading: "", title: "", description: "", bgImage: "", chooseList: [{ text: "" }], primaryButton: { label: "", href: "" } },
    ourProcess: { heading: "", title: "", processList: [{ id: randomId(), title: "", description: "", image: "", color: "" }] }
  },
  "consultancy.readyToGetStarted": {
    title: "", heading: "", description: "", primaryButton: { label: "", href: "" }, bgImage: ""
  },
  "consultancy.features_strip": {
    items: [{ id: randomId(), title: "", description: "", imageurl: { imageUrl: "", alt: "" } }]
  }
};

export const buildEmptyConsultancyContent = (key: ConsultancyPageContentKeys): Omit<ComponentContent, "_id"> & { key: ConsultancyPageContentKeys } => {
    const data = JSON.parse(JSON.stringify(defaultConsultancyData[key]));

    if (data.features) data.features = data.features.map((f: any) => ({ ...f, id: randomId() }));
    if (data.items) data.items = data.items.map((i: any) => ({ ...i, id: randomId() }));
    if (data.serviceCards) data.serviceCards = data.serviceCards.map((s: any) => ({ ...s, id: randomId() }));
    if (data.ourProcess?.processList) {
        data.ourProcess.processList = data.ourProcess.processList.map((p: any) => ({ ...p, id: randomId() }));
    }

    const keyInfo = consultancyPageKeys.find(k => k.key === key);

    return {
        key,
        label: keyInfo?.label || "",
        page: "consultancy",
        description: keyInfo?.description || "",
        isActive: true,
        data,
    };
};
