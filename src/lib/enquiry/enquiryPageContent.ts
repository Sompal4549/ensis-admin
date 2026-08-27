import { ImageData } from "../about/aboutPageContent";

export type EnquiryPageContentKeys =
  | "enquiry.page"
  | "enquiry.getInTouch"
  | "enquiry.ctaBanner"
  | "enquiry.features_strip";

export type SelectOption = {
  value: string;
  label: string;
};

export type TrustIndicatorItem = {
  id: string;
  label: string;
};

export type CheckboxOption = {
  id: string;
  label: string;
};

export type RadioOption = {
  id: string;
  label: string;
};

export type WhyChooseItem = {
  id: string;
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
};

export type EnquiryPageForm = {
  hero: {
    heading: string;
    subheading: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
    formImageSrc: string;
    formImageAlt: string;
    ctaPrimary: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
    trustIndicators: TrustIndicatorItem[];
  };
  formTitle: string;
  projectTypeOptions: SelectOption[];
  stateOptions: SelectOption[];
  cityOptions: SelectOption[];
  projectSizeOptions: SelectOption[];
  budgetRangeOptions: SelectOption[];
  timelineOptions: SelectOption[];
  servicesOptions: CheckboxOption[];
  preferredContactOptions: RadioOption[];
  whyChoose: {
    heading: string;
    items: WhyChooseItem[];
    bottomImageSrc: string;
    bottomImageAlt: string;
  };
  upload: { label: string; helperText: string };
  consentText: string;
  submitButtonText: string;
};

export type ContactItem = {
  id: string;
  label: string;
  iconSrc?: string;
  lines: string[];
};

export type GetInTouchBannerData = {
  heading: string;
  items: ContactItem[];
};

export type CtaBannerImage = {
  imageUrl: string;
  alt: string;
};

export type CtaBannerData = {
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  leftImage: CtaBannerImage;
  rightImage: CtaBannerImage;
};

export type StatsStripItem = {
  id: string;
  title: string;
  description: string;
  imageurl: CtaBannerImage;
};

export type StatsStripData = {
  items: StatsStripItem[];
};

export const enquiryPageKeys: {
  key: EnquiryPageContentKeys;
  label: string;
  description: string;
}[] = [
  {
    key: "enquiry.page",
    label: "Enquiry Form",
    description: "Hero section and enquiry form content.",
  },
  {
    key: "enquiry.getInTouch",
    label: "Get In Touch",
    description: "Get in touch banner with contact items.",
  },
  {
    key: "enquiry.ctaBanner",
    label: "CTA Banner",
    description: "Call to action banner section.",
  },
  {
    key: "enquiry.features_strip",
    label: "Stats Strip",
    description: "Stats strip section.",
  },
];

const randomId = () => Math.random().toString(36).slice(2, 9);

export const defaultEnquiryData: Record<EnquiryPageContentKeys, unknown> = {
  "enquiry.page": {
    hero: {
      heading: "",
      subheading: "",
      description: "",
      imageSrc: "",
      imageAlt: "",
      formImageSrc: "",
      formImageAlt: "",
      ctaPrimary: { label: "", href: "" },
      ctaSecondary: { label: "", href: "" },
      trustIndicators: [],
    },
    formTitle: "",
    projectTypeOptions: [],
    stateOptions: [],
    cityOptions: [],
    projectSizeOptions: [],
    budgetRangeOptions: [],
    timelineOptions: [],
    servicesOptions: [],
    preferredContactOptions: [],
    whyChoose: {
      heading: "",
      items: [],
      bottomImageSrc: "",
      bottomImageAlt: "",
    },
    upload: { label: "", helperText: "" },
    consentText: "",
    submitButtonText: "",
  },
  "enquiry.getInTouch": {
    heading: "",
    items: [],
  },
  "enquiry.ctaBanner": {
    heading: "",
    description: "",
    ctaLabel: "",
    ctaHref: "",
    leftImage: { imageUrl: "", alt: "" },
    rightImage: { imageUrl: "", alt: "" },
  },
  "enquiry.features_strip": {
    items: [],
  },
};
