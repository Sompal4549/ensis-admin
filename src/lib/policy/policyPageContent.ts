export type PolicyPageContentKeys = "policy.privacy" | "policy.terms";

export interface PolicySection {
  id: string;
  number: string;
  title: string;
  text: string;
  bullets?: string[];
  extra?: string;
  extra2?: string;
  link?: {
    href: string;
    label: string;
  };
}

export interface PolicyStat {
  number: string;
  label: string;
}

export interface PolicyHero {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  lastUpdated?: string;
  stats?: PolicyStat[];
}

export interface PolicyIntro {
  heading?: string;
  description?: string;
  features?: { title: string; subtitle: string }[];
}

export interface PolicyContact {
  heading?: string;
  subheading?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export type PolicyPageData = Record<string, unknown> & {
  sections: PolicySection[];
  hero?: PolicyHero;
  intro?: PolicyIntro;
  contact?: PolicyContact;
}

export const policyPageKeys = [
  {
    key: "policy.privacy" as const,
    label: "Privacy Policy",
    description: "Manage Privacy Policy sections and content",
  },
  {
    key: "policy.terms" as const,
    label: "Terms & Conditions",
    description: "Manage Terms & Conditions sections and content",
  },
];

export const defaultPolicyPageData: Record<PolicyPageContentKeys, PolicyPageData> = {
  "policy.privacy": {
    hero: {
      eyebrow: "ENSIS LEGAL & PRIVACY",
      title: "Privacy Policy",
      subtitle: "Your privacy and trust matter to us. Learn how ENSIS collects, uses and protects your information.",
      lastUpdated: "20 May 2025",
      stats: [
        { number: "100%", label: "Data Protection" },
        { number: "24/7", label: "Support Available" },
        { number: "1000+", label: "Clients Trust Us" },
        { number: "20+", label: "Years Experience" },
      ],
    },
    intro: {
      heading: "Your Privacy, Handled with Care",
      description: "ENSIS respects the privacy of every visitor, customer and business partner. This Privacy Policy explains how we collect, use, store and protect information when you interact with our website, products and services.",
      features: [
        { title: "Privacy &", subtitle: "Transparency" },
        { title: "Secure Information", subtitle: "Handling" },
        { title: "Responsible", subtitle: "Communication" },
      ],
    },
    contact: {
      heading: "Have a Privacy Question?",
      subheading: "Contact Our Team",
      description: "We are committed to protecting your information and resolving any concerns you may have.",
      phone: "+91 9654900525",
      email: "info@ensis.in",
      website: "www.ensis.in",
    },
    sections: [
      {
        id: "information-we-collect",
        number: "01",
        title: "Information We Collect",
        text: "We collect personal information that you voluntarily provide when you contact us, fill out a form or interact with our website. This may include:",
        bullets: [
          "Name, phone number, email address",
          "Company or organization details",
          "Enquiry details and messages",
          "Any other information you choose to provide",
        ],
      },
      {
        id: "how-we-use",
        number: "02",
        title: "How We Use Your Information",
        text: "We use the information we collect to:",
        bullets: [
          "Respond to your enquiries and provide requested information",
          "Share updates about our products, services and offers (with your consent)",
          "Improve our website, products and services",
          "Manage and administer our business operations",
        ],
      },
    ],
  },
  "policy.terms": {
    hero: {
      eyebrow: "ENSIS LEGAL & PRIVACY",
      title: "Terms & Conditions",
      subtitle: "Please read these terms carefully before using our website or services.",
      lastUpdated: "20 May 2025",
      stats: [
        { number: "100%", label: "Transparency" },
        { number: "24/7", label: "Support Available" },
        { number: "1000+", label: "Clients Trust Us" },
        { number: "20+", label: "Years Experience" },
      ],
    },
    intro: {
      heading: "Your Rights & Our Responsibilities",
      description: "ENSIS is committed to fair, transparent and responsible business practices. These Terms & Conditions outline the rules and expectations for using our website and services.",
      features: [
        { title: "Fair &", subtitle: "Transparent" },
        { title: "Secure Service", subtitle: "Delivery" },
        { title: "Responsible", subtitle: "Practices" },
      ],
    },
    contact: {
      heading: "Have a Question?",
      subheading: "Contact Our Team",
      description: "We are committed to fair practices and resolving any concerns you may have.",
      phone: "+91 9654900525",
      email: "info@ensis.in",
      website: "www.ensis.in",
    },
    sections: [
      {
        id: "introduction",
        number: "01",
        title: "Introduction",
        text: "These Terms & Conditions govern your access to and use of the ENSIS website and all services, products, equipment, consultancy and solutions provided by ENSIS.",
        extra: "By using our website or engaging with our services, you agree to be bound by these Terms.",
      },
      {
        id: "acceptance",
        number: "02",
        title: "Acceptance of Terms",
        text: "By accessing or using our website, submitting an enquiry, placing an order or availing any of our services, you acknowledge that you have read, understood and agreed to these Terms & Conditions.",
      },
    ],
  },
};
