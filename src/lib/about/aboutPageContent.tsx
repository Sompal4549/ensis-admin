export type AboutPageContentKeys =
    | "about.hero"
    | "about.statsStrip"
    | "about.ourStory"
    | "about.whyChooseEnsis"
    | "about.ourExpertise"
    | "about.ourTurnkeyProcess"
    | "about.industriesWeServe"
    | "about.testimonials"
    | "about.founderVision"
    | "about.letsBuild"
    | "layout.header"
    | "layout.footer";

export type ImageData = {
    imageUrl: string;
    alt: string;
};

export type AboutHero = {
    id: string;
    image: ImageData;
    title: string;
    highlight: string;
    description: string;
    primaryAction: {
        label: string;
        url: string;
    }
    secondaryAction: {
        label: string;
        url: string;
    }
}

export type AboutStatsStrip = {
    id: string;
    stats: {
        id: string;
        label: string;
        imageurl: ImageData;
        subtitle: string;
    }[];
}

export type AboutOurStory = {
    id: string;
    heading: string;
    title: string;
    description: string;
    imageurl: ImageData;
    stats: { title: string; subtitle: string; imageurl: ImageData, id: string }[]
    ourCoreValues: { title: string; imageurl: ImageData, id: string }[]
}

export type AboutWhyChooseEnsis = {
    id: string;
    title: string;
    description: string;
    imageurl: ImageData;
    experience: {id: string; title: string; description: string; imageurl: ImageData }[]
}

export type AboutOurExpertise = {
    id: string;
    title: string; 
    items: { id: string; title: string; description: string; imageurl: ImageData, linkUrl: string}[]
}

export type AboutOurTurnkeyProcess = {
    id: string;
    title: string;
    imageurl: ImageData;
    steps: { id: string; title: string; description: string; imageurl: ImageData }[]
}

export type AboutIndustriesWeServe = {
    id: string;
    title: string;
    industries: { id: string; title: string; imageurl: ImageData, linkUrl: string }[]
}

export type TestimonialItem = { text: string; name: string; role: string; image: ImageData };
export type TestimonialsData = {
  id: string;
  subtitle: string;
  testimonials: TestimonialItem[];
};

export type HeaderData = {
  logo: ImageData & { href: string };
  email: string;
  phone: string;
  brochureUrl: string;
  contactInfo: {
    image: ImageData;
    text: string;
    href?: string;
  }[];
  navigation: {
    title: string;
    slug: string;
  }[];
  actions: {
    wishlist: boolean;
    cart: boolean;
    brochureButton: {
      text: string;
      href: string;
    };
  };
};

export type FooterData = {
  company: {
    name: string;
    designHouselogo: ImageData;
    description: string;
    ensisLogo: ImageData;
    socialLinks: { image: ImageData; url: string }[];
  };
  navigation: {
    title: string;
    links: { label: string; href: string }[];
  }[];
  contact: {
    address: string; // Changed to string
    phone: string; // Changed to string
    email: string; // Changed to string
    whatsappPhone: string; // Changed to string
  };
  copyright: { 
    text: string;
    links: { label: string; href: string }[];
  };
};

export type AboutFounderVision = {
    id: string;
    heading: string;
    title: string;
    description: string;
    founderImageurl: ImageData;
    signatureImageurl: ImageData;
    aboutFounder: { title: string; company: string; division: string }
}

export type AboutLetsBuild = {
    id: string;
    title: string;
    description: string;
    imageurl: ImageData;
    primaryAction: {
        label: string;
        url: string;
    }
    secondaryAction: {
        label: string;
        url: string;
    }
}

// ------ UNION TYPE FOR ALL ABOUT PAGE COMPONENTS ------types

export type AboutPageData =
 | AboutHero
 | AboutStatsStrip
 | AboutOurStory
 | AboutWhyChooseEnsis
 | AboutOurExpertise
 | AboutOurTurnkeyProcess
 | AboutIndustriesWeServe
 | TestimonialsData
 | AboutFounderVision
 | AboutLetsBuild
 | HeaderData
 | FooterData;

export const aboutpageKeys:{ key: AboutPageContentKeys; label:string; description:string }[] = [
    { key: "about.hero", label: "Hero Section", description: "The hero section of the about page, including title, description, and call-to-action buttons." },
    { key: "about.statsStrip", label: "Stats Strip", description: "A section showcasing key statistics about the company." },
    { key: "about.ourStory", label: "Our Story", description: "A brief overview of the company's history and core values." },
    { key: "about.whyChooseEnsis", label: "Why Choose Ensis", description: "A section highlighting the reasons to choose Ensis for software development." },
    { key: "about.ourExpertise", label: "Our Expertise", description: "An overview of the company's areas of expertise and services offered." },
    { key: "about.ourTurnkeyProcess", label: "Our Turnkey Process", description: "A description of the company's turnkey process for delivering software solutions." },
    { key: "about.industriesWeServe", label: "Industries We Serve", description: "A showcase of the industries that Ensis serves with its software solutions." },
    { key: "about.testimonials", label: "Testimonials", description: "A section featuring testimonials from satisfied clients." },
    { key: "about.founderVision", label: "Founder's Vision", description: "An insight into the founder's vision and the company's mission." },
    { key: "about.letsBuild", label: "Let's Build Together", description: "A call-to-action section encouraging visitors to get in touch and start building together." },
    { key: "layout.header", label: "Global Header", description: "Manage the site-wide header navigation and contact info." },
    { key: "layout.footer", label: "Global Footer", description: "Manage the site-wide footer columns and links." },
]


export const defaultAboutpageData :Record<AboutPageContentKeys, AboutPageData> = {
    "about.hero": {
    id: "default-hero-section",
    image: { imageUrl: '/media/about/hero-bg.jpg', alt: 'Ensis Hero Background' },
    title: 'Pioneering Digital Excellence with',
    highlight: 'Ensis Solutions',
    description: 'We blend artistic design with engineering precision to build software that scales, performs, and transforms businesses globally.',
    primaryAction: {
        label: 'Our Process',
        url: '#process',
    },
    secondaryAction: {
        label: 'Contact Us',
        url: '/contact',
    }
},
"about.statsStrip": {
    id: "default-stats-strip",
    stats: [
        { id: "stat-1", label: '10+', imageurl: { imageUrl: '/icons/calendar.svg', alt: 'Calendar' }, subtitle: 'Years of Innovation' },
        { id: "stat-2", label: '250+', imageurl: { imageUrl: '/icons/check.svg', alt: 'Check' }, subtitle: 'Projects Delivered' },
        { id: "stat-3", label: '50+', imageurl: { imageUrl: '/icons/users.svg', alt: 'Users' }, subtitle: 'Expert Engineers' },
        { id: "stat-4", label: '15+', imageurl: { imageUrl: '/icons/globe.svg', alt: 'Globe' }, subtitle: 'Countries Served' },
    ]
},
"about.ourStory": {
    id: "default-our-story",
    heading: 'OUR JOURNEY',
    title: 'From a Vision to a Global Tech Powerhouse',
    description: 'Founded on the principle of technical integrity, Ensis began as a small team of passionate developers. Today, we are a global partner for enterprises looking to redefine their digital footprint through custom turnkey solutions.',
    imageurl: { imageUrl: '/media/about/office-culture.jpg', alt: 'Office Culture' },
    stats: [
        { id: "story-stat-1", title: '98%', subtitle: 'Client Retention', imageurl: { imageUrl: '/icons/heart.svg', alt: 'Heart Icon' } },
        { id: "story-stat-2", title: '24/7', subtitle: 'Technical Support', imageurl: { imageUrl: '/icons/clock.svg', alt: 'Clock Icon' } }
    ],
    ourCoreValues: [
        { id: "value-1", title: 'Uncompromising Quality', imageurl: { imageUrl: '/icons/shield.svg', alt: 'Shield' } },
        { id: "value-2", title: 'Transparent Collaboration', imageurl: { imageUrl: '/icons/eye.svg', alt: 'Eye' } },
        { id: "value-3", title: 'Continuous Innovation', imageurl: { imageUrl: '/icons/zap.svg', alt: 'Bolt' } }
    ]
},
"about.whyChooseEnsis": {
    id: "default-why-ensis",
    title: 'Why Partners Choose Ensis',
    description: 'We don\'t just write code; we solve business problems. Our approach ensures that every line of software contributes to your bottom line.',
    imageurl: { imageUrl: '/media/about/why-us.jpg', alt: 'Why Choose Us' },
    experience: [
        { id: "exp-1", title: 'Domain Expertise', description: 'Deep knowledge in FinTech, Healthcare, and Logistics.', imageurl: { imageUrl: '/icons/briefcase.svg', alt: 'Briefcase' } },
        { id: "exp-2", title: 'Agile Methodology', description: 'Rapid iterations with constant feedback loops.', imageurl: { imageUrl: '/icons/repeat.svg', alt: 'Agile' } },
        { id: "exp-3", title: 'Future-Proof Tech', description: 'Building with stacks that remain relevant for years.', imageurl: { imageUrl: '/icons/cpu.svg', alt: 'CPU' } }
    ]
},
"about.ourExpertise": {
    id: "default-expertise",
    title: 'Our Technical Expertise',
    items: [
        { 
            id: "expertise-1", 
            title: 'Custom Web Apps', 
            description: 'Scalable React and Next.js applications tailored for high performance.', 
            imageurl: { imageUrl: '/media/expertise/web.jpg', alt: 'Web Apps' }, 
            linkUrl: '/services/web'
        },
        { 
            id: "expertise-2", 
            title: 'Mobile Solutions', 
            description: 'Native and Cross-platform apps that provide seamless user experiences.', 
            imageurl: { imageUrl: '/media/expertise/mobile.jpg', alt: 'Mobile Apps' }, 
            linkUrl: '/services/mobile'
        },
        { 
            id: "expertise-3", 
            title: 'Cloud & DevOps', 
            description: 'Modern infrastructure management on AWS and Azure.', 
            imageurl: { imageUrl: '/media/expertise/cloud.jpg', alt: 'Cloud Computing' }, 
            linkUrl: '/services/cloud'
        }
    ]
},
"about.ourTurnkeyProcess": {
    id: "default-turnkey-process",
    title: 'Our Seamless Turnkey Process',
    imageurl: { imageUrl: '/media/about/process-flow.png', alt: 'Turnkey Process Diagram' },
    steps: [
        { id: "step-1", title: 'Discovery', description: 'Understanding your goals.', imageurl: { imageUrl: '/icons/search.svg', alt: 'Search' } },
        { id: "step-2", title: 'Design', description: 'Creating intuitive UI/UX.', imageurl: { imageUrl: '/icons/pen.svg', alt: 'Pen' } },
        { id: "step-3", title: 'Development', description: 'Clean code.', imageurl: { imageUrl: '/icons/code.svg', alt: 'Code' } },
        { id: "step-4", title: 'Deployment', description: 'Rigorous testing.', imageurl: { imageUrl: '/icons/rocket.svg', alt: 'Rocket' } }
    ]
},
"about.industriesWeServe": {
    id: "default-industries",
    title: 'Industries We Empower',
    industries: [
        { id: "industry-1", title: 'Healthcare', imageurl: { imageUrl: '/media/industries/healthcare.jpg', alt: 'Healthcare Industry' }, linkUrl: '/industries/healthcare' },
        { id: "industry-2", title: 'Finance', imageurl: { imageUrl: '/media/industries/finance.jpg', alt: 'Finance Industry' }, linkUrl: '/industries/finance' },
        { id: "industry-3", title: 'Logistics', imageurl: { imageUrl: '/media/industries/logistics.jpg', alt: 'Logistics Industry' }, linkUrl: '/industries/logistics' },
        { id: "industry-4", title: 'E-commerce', imageurl: { imageUrl: '/media/industries/ecommerce.jpg', alt: 'E-commerce Industry' }, linkUrl: '/industries/ecommerce' }
    ]
},
"about.testimonials": {
    id: "default-testimonials",
    subtitle: 'What Our Global Partners Say',
    testimonials: [
        { 
            text: 'Ensis transformed our legacy systems into a modern cloud infrastructure within months. Their technical depth is unparalleled.', 
            name: 'Sarah Jenkins', 
            role: 'CTO, HealthFlow', 
            image: { imageUrl: '/media/testimonials/sarah.jpg', alt: 'Sarah Jenkins' } 
        },
        { 
            text: 'Working with Ensis feels like having an in-house expert team. They truly care about the product outcome.', 
            name: 'Michael Chen', 
            role: 'Product VP, FinNext', 
            image: { imageUrl: '/media/testimonials/michael.jpg', alt: 'Michael Chen' } 
        }
    ]
},
"about.founderVision": {
    id: "default-founder-vision",
    heading: 'FOUNDER\'S VISION',
    title: 'Code is Poetry, Architecture is Art',
    description: 'When we started Ensis, the goal wasn\'t just to build another software agency. We wanted to build a place where technical excellence meets business strategy. Every project we take on is a commitment to help our partners lead their industries through superior technology.',
    founderImageurl: { imageUrl: '/media/about/founder.jpg', alt: 'Founder Portrait' },
    signatureImageurl: { imageUrl: '/media/about/signature.png', alt: 'Founder Signature' },
    aboutFounder: { 
        title: 'Chief Executive Officer', 
        company: 'Ensis Global', 
        division: 'Strategic Operations' 
    }
},
"about.letsBuild": {
    id: "default-lets-build",
    title: 'Ready to Build Your Next Big Idea?',
    description: 'Connect with our engineering experts today for a free consultation and project roadmap.',
    imageurl: { imageUrl: '/media/about/contact-cta.jpg', alt: 'Contact Call to Action' },
    primaryAction: {
        label: 'Start a Project',
        url: '/contact',
    },
    secondaryAction: {
        label: 'View Case Studies',
        url: '/work',
    }
    },
    "layout.header": {
        logo: { imageUrl: "/images/ensis-logo.png", alt: "Ensis Logo", href: "/" },
        email: "info@ensis.in",
        phone: "+91 9654900525",
        brochureUrl: "https://ensis.in/pdf/e-broucher.pdf",
        contactInfo: [
          { image: { imageUrl: "/icons/factory.svg", alt: "Factory Icon" }, text: "Manufactured in India" },
          {
            image: { imageUrl: "/icons/phone.svg", alt: "Phone Icon" },
            text: "+91 9654900525",
            href: "tel:+919654900525",
          },
          {
            image: { imageUrl: "/icons/mail.svg", alt: "Mail Icon" },
            text: "info@ensis.in",
            href: "mailto:info@ensis.in",
          },
        ],
        navigation: [
          { title: "Home", slug: "/" },
          { title: "About Us", slug: "/about-us" },
          { title: "Products", slug: "/products" },
          { title: "Turnkey Solutions", slug: "/turnkey-solutions" },
          { title: "Consultancy", slug: "/consultancy" },
          { title: "Projects and Clients", slug: "/projects-and-clients" },
          { title: "Blog", slug: "/blog" },
          { title: "Enquiry", slug: "/enquiry" },
          { title: "Contact Us", slug: "/contact-us" },
        ],
        actions: {
          wishlist: true,
          cart: true,
          brochureButton: {
            text: "E-Brochure",
            href: "/brochure",
          },
        },
    },
    "layout.footer": {
        company: {
          name: "Design House India Pvt. Ltd.",
          designHouselogo: { imageUrl: "/images/design-house-logo.png", alt: "Design House Logo" },
          description: "Leading manufacturer of Ayurvedic, Spa & Wellness equipments. Crafting premium solutions for a healthier & better tomorrow.",
          ensisLogo: { imageUrl: "/images/ensis-logo.png", alt: "Ensis Logo" },
          socialLinks: [
            { image: { imageUrl: "/icons/facebook.svg", alt: "Facebook Icon" }, url: "https://facebook.com" },
            { image: { imageUrl: "/icons/instagram.svg", alt: "Instagram Icon" }, url: "https://instagram.com" },
            { image: { imageUrl: "/icons/youtube.svg", alt: "YouTube Icon" }, url: "https://youtube.com" },
            { image: { imageUrl: "/icons/linkedin.svg", alt: "LinkedIn Icon" }, url: "https://linkedin.com" },
          ],
        },
        navigation: [
          {
            title: "Quick Links",
            links: [
              { label: "Home", href: "/" },
              { label: "About Us", href: "/about-us" },
              { label: "Products", href: "/products" },
              { label: "Turnkey Solutions", href: "/turnkey-solutions" },
              { label: "Projects", href: "/projects" },
              { label: "Blog", href: "/blog" },
              { label: "Contact Us", href: "/contact-us" },
            ],
          },
          {
            title: "Product Categories",
            links: [
              { label: "Panchkarma Beds", href: "/products/panchkarma-beds" },
              { label: "Spa Massage Tables", href: "/products/spa-massage-tables" },
              { label: "Steam Chambers", href: "/products/steam-chambers" },
              { label: "Sauna Systems", href: "/products/sauna-systems" },
              { label: "Bronze Accessories", href: "/products/bronze-accessories" },
              { label: "Spa Furniture", href: "/products/spa-furniture" },
              { label: "Steam Generators", href: "/products/steam-generators" },
              { label: "Yoga & Wellness", href: "/products/yoga-wellness" },
            ],
          },
          {
            title: "Our Solutions",
            links: [
              { label: "Panchkarma Clinic Setup", href: "/solutions/panchkarma-clinic-setup" },
              { label: "Resort & Spa Setup", href: "/solutions/resort-spa-setup" },
              { label: "Wellness Retreat Design", href: "/solutions/wellness-retreat-design" },
              { label: "Ayurveda Hospital Setup", href: "/solutions/ayurveda-hospital-setup" },
              { label: "Interior & Equipment Integration", href: "/solutions/interior-equipment-integration" },
            ],
          },
        ],
        contact: {
          address: "12/29, Site-II, Loni Road, Industrial Area, Mohan Nagar - 201007, India, Uttar Pradesh, India",
          phone: "+91 9654900525",
          email: "info@ensis.in",
          whatsappPhone: "+919654900525",
        },
        copyright: {
          text: `© 2026 Ensis Panchkarma & Spa Solutions. All Rights Reserved.`,
          links: [
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Terms & Conditions", href: "/terms-and-conditions" }
          ]
        },
      }
};