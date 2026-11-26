export interface Article {
  slug: string;
  title: string;
  summary: string;
  category: string;
  readTime: string;
  publishDate: string;
  modifiedDate: string;
  author: {
    name: string;
    role: string;
  };
  content: string[];
}

export const articles: Article[] = [
  {
    slug: 'legal-framework-surrogacy-nigeria',
    title: 'The Legal Framework for Surrogacy Agreements in Nigeria',
    summary:
      'A comprehensive guide to understanding parental rights, enforceable contract clauses, and court parentage orders in Lagos and across Nigeria.',
    category: 'Legal Coordination',
    readTime: '6 min read',
    publishDate: '2026-02-15T09:00:00+01:00',
    modifiedDate: '2026-03-01T10:00:00+01:00',
    author: {
      name: 'Chizaram Ata',
      role: 'Founder & Lead Coordinator',
    },
    content: [
      'Surrogacy in Nigeria has experienced substantial growth as more individuals and couples turn to assisted reproductive technology (ART) to complete their families. While there is no single codified federal surrogacy statute in Nigeria, gestational surrogacy is governed by well-established principles of contract law, constitutional rights, and High Court parentage orders.',
      'In a valid gestational surrogacy arrangement, the surrogate mother carries an embryo created with the intended parents’ or approved donors’ genetic material. Because there is no genetic relationship between the surrogate and the child, contracts drafted by independent legal counsel clearly affirm that the intended parents are the sole legal parents from the moment of conception.',
      'Key contractual clauses in Nigerian surrogacy agreements include: clear parental recognition upon birth, medical consent during pregnancy, financial expense management provisions, and birth registration procedures. Independent legal representation for both the intended parents and the gestational carrier is essential to ensure that consent is informed, uncoerced, and legally binding.',
      'At Zizo Surrogacy, we connect all parties with independent reproductive law specialists in Lagos before any clinical procedures begin. This guarantees total legal clarity and peace of mind for both families and surrogates.',
    ],
  },
  {
    slug: 'surrogate-care-and-privacy-standards-lagos',
    title: 'Privacy and Healthcare Standards for Gestational Surrogates in Lagos',
    summary:
      'How structured case management, accredited hospital partnerships, and total community anonymity protect surrogate mothers throughout pregnancy.',
    category: 'Surrogate Wellness',
    readTime: '5 min read',
    publishDate: '2026-02-20T09:00:00+01:00',
    modifiedDate: '2026-03-05T11:00:00+01:00',
    author: {
      name: 'Chizaram Ata',
      role: 'Founder & Lead Coordinator',
    },
    content: [
      'The decision to become a gestational surrogate is one of profound empathy and dedication. However, prospective surrogates frequently ask: How will my body cope? Will I receive proper medical care? And how will my privacy be guarded in my community?',
      'At Zizo Surrogacy, our core principle is that the well-being and dignity of the surrogate come first. We pair every surrogate with a dedicated personal case manager whose sole responsibility is providing support, arranging transportation to scans, and offering a continuous, non-judgmental point of contact.',
      'All clinical evaluations, IVF embryo transfers, and routine prenatal checkups are conducted at accredited private fertility hospitals in Lagos with licensed physicians. We ensure that our surrogates receive top-tier obstetric monitoring, nutritional support, and emergency healthcare coverage throughout their full gestational term.',
      'Furthermore, we maintain rigorous mutual anonymity standards. Personal details, family backgrounds, and home addresses are never shared without explicit written consent. This guarantees that surrogates can navigate their journey with full confidence, security, and respect.',
    ],
  },
  {
    slug: 'how-to-prepare-for-first-surrogacy-consultation',
    title: 'How to Prepare for Your First Surrogacy Consultation in Lagos',
    summary:
      'What intended parents can expect during an initial discovery call, what questions to ask, and why no medical records are needed to start.',
    category: 'Intended Parents',
    readTime: '4 min read',
    publishDate: '2026-03-01T09:00:00+01:00',
    modifiedDate: '2026-03-10T14:00:00+01:00',
    author: {
      name: 'Chizaram Ata',
      role: 'Founder & Lead Coordinator',
    },
    content: [
      'Taking the first step toward surrogacy is a major milestone. Many intended parents feel nervous before their first call, wondering if they need stacks of previous medical records or detailed fertility diagnoses ready to share.',
      'The initial consultation at Zizo Surrogacy is designed to be calm, introductory, and informational. We do not ask for or collect sensitive medical records, diagnoses, or invasive personal histories during your first meeting. The purpose of this call is simply to help you understand how surrogacy works in Lagos and whether our agency is the right fit for your family.',
      'During this complimentary private session, we will discuss: the differences between traditional and gestational surrogacy, our partner fertility clinic network, timeline expectations, the surrogate matching criteria, and how legal protections are established in Nigeria.',
      'We encourage you to come with any questions or concerns you have about privacy, timelines, and costs. You can schedule a call directly on our website or reach out via our confidential WhatsApp line at your own pace.',
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
