/**
 * Centralized Application Configuration — Zizo Surrogacy
 * Single source of truth for business data, contact channels, and canonical routes.
 */

export const siteConfig = {
  name: 'Zizo Surrogacy',
  legalName: 'Zizo Surrogacy Agency',
  description: 'Support for intended parents and surrogate applicants in Lagos, Nigeria. A calm, discreet, and ethically guided reproductive care coordination agency.',
  url: 'https://zizosurrogacy.com',
  ogImage: 'https://zizosurrogacy.com/og-image.jpg',

  // Verified Physical Location in Surulere, Lagos
  location: {
    street: 'Kernel St, Bode Thomas St',
    locality: 'Surulere',
    city: 'Lagos',
    region: 'Lagos State',
    postalCode: '101241',
    country: 'NG',
    countryName: 'Nigeria',
    coordinates: {
      latitude: 6.4888063,
      longitude: 3.348725,
    },
    googleMapsUrl: 'https://www.google.com/maps/place/Zizo+Donor+and+Surrogacy+Agency/@6.4888063,3.348725,17z/data=!3m1!4b1!4m6!3m5!1s0x103b8d000dd4fa41:0x86b04438128b0123!8m2!3d6.4888063!4d3.348725!16s%2Fg%2F11vm2xqbtj',
    formattedAddress: 'Kernel St, Bode Thomas St, Surulere, Lagos 101241, Lagos, Nigeria',
  },

  // Operating Hours (Africa/Lagos WAT)
  hours: {
    days: 'Monday – Friday',
    times: '9:00 AM – 5:00 PM WAT',
    timezone: 'Africa/Lagos',
  },

  // Verified Direct Communication Channels
  contact: {
    // General & Intended Parents
    phoneGeneral: '+234 902 494 4961',
    phoneGeneralRaw: '+2349024944961',
    
    // Surrogate Applicant Line
    phoneSurrogate: '+234 803 787 8910',
    phoneSurrogateRaw: '+2348037878910',

    // Email
    email: 'contact@zizosurrogacy.com',
  },

  // WhatsApp Endpoints with Audience-Specific Prefilled Greetings
  whatsapp: {
    intendedParent: {
      number: '+2349024944961',
      url: 'https://wa.me/2349024944961?text=Hello%2C%20I%20would%20like%20to%20ask%20about%20intended-parent%20support.',
      label: 'Chat about Intended Parent Support',
    },
    surrogate: {
      number: '+2348037878910',
      url: 'https://wa.me/2348037878910?text=Hello%2C%20I%20would%20like%20to%20ask%20about%20becoming%20a%20surrogate.',
      label: 'Chat about Becoming a Surrogate',
    },
    eggDonation: {
      number: '+2349024944961',
      url: 'https://wa.me/2349024944961?text=Hello%2C%20I%20would%20like%20to%20ask%20about%20egg%20donation%20services.',
      label: 'Chat about Egg Donation',
    },
    general: {
      number: '+2349024944961',
      url: 'https://wa.me/2349024944961?text=Hello%20Zizo%20Surrogacy%2C%20I%20have%20an%20inquiry.',
      label: 'Chat on WhatsApp',
    },
  },

  // Official Social Profiles
  socials: {
    instagram: 'https://instagram.com/zizosurrogacy/',
    tiktok: 'https://www.tiktok.com/@zizosurrogacy',
  },

  // Global Navigation Links
  navLinks: [
    { label: 'Home', href: '/' },
    { label: 'For Intended Parents', href: '/intended-parents/' },
    { label: 'Become a Surrogate', href: '/become-a-surrogate/' },
    { label: 'Egg Donation', href: '/egg-donation/' },
    { label: 'How It Works', href: '/how-surrogacy-works/' },
    { label: 'Agency Insights', href: '/insights/' },
    { label: 'About', href: '/about/' },
    { label: 'Contact', href: '/contact/' },
  ],
};
