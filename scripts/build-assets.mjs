import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const IMG_OUT = path.join(ROOT, 'public', 'assets', 'img');
const VENDOR_OUT = path.join(ROOT, 'public', 'assets', 'vendor');

fs.mkdirSync(IMG_OUT, { recursive: true });
fs.mkdirSync(VENDOR_OUT, { recursive: true });

const SOURCE_IMAGES = [
  { src: 'src/assets/images/hero_family_1794700427128.jpg', out: 'hero-family' },
  { src: 'src/assets/images/service_surrogacy_1794700427474.jpg', out: 'service-surrogacy' },
  { src: 'src/assets/images/service_ovum_donation_1794700428496.jpg', out: 'service-ovum-donation' },
  { src: 'src/assets/images/service_matching_1794700428835.jpg', out: 'service-matching' },
  { src: 'src/assets/images/service_counseling_1794700431159.jpg', out: 'service-counseling' },
  { src: 'src/assets/images/become_surrogate_1794700429994.jpg', out: 'become-a-surrogate' },
  { src: 'src/assets/images/how_it_works_banner_1794700431930.jpg', out: 'how-it-works' },
  { src: 'src/assets/images/blog_default_cover_1794700431544.jpg', out: 'blog-default' },
];

const WIDTHS = [640, 1024, 1920, 3840];

async function buildResponsiveImages() {
  for (const item of SOURCE_IMAGES) {
    const srcPath = path.join(ROOT, item.src);
    if (!fs.existsSync(srcPath)) {
      console.warn(`[build-assets] Missing source image: ${item.src}`);
      continue;
    }

    for (const width of WIDTHS) {
      const webpPath = path.join(IMG_OUT, `${item.out}-${width}w.webp`);
      const avifPath = path.join(IMG_OUT, `${item.out}-${width}w.avif`);

      if (!fs.existsSync(webpPath)) {
        await sharp(srcPath)
          .resize({ width, withoutEnlargement: false })
          .webp({ quality: width >= 1920 ? 82 : 80 })
          .toFile(webpPath);
      }

      if (!fs.existsSync(avifPath)) {
        await sharp(srcPath)
          .resize({ width, withoutEnlargement: false })
          .avif({ quality: 58, effort: 2 })
          .toFile(avifPath);
      }
    }
  }

  // Open Graph 1200x630
  const ogDest = path.join(IMG_OUT, 'og-default.jpg');
  const heroSrc = path.join(ROOT, SOURCE_IMAGES[0].src);
  if (fs.existsSync(heroSrc) && !fs.existsSync(ogDest)) {
    await sharp(heroSrc)
      .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(ogDest);
  }
}

function writeBrandIconsAndCountryVectors() {
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
  <rect width="36" height="36" rx="8" fill="#FAF9F6"/>
  <circle cx="14" cy="18" r="9" stroke="#17191A" stroke-width="2" fill="none"/>
  <circle cx="22" cy="18" r="9" stroke="#17645F" stroke-width="2" fill="none"/>
</svg>`;
  fs.writeFileSync(path.join(IMG_OUT, 'favicon.svg'), faviconSvg);

  // Neutral non-person cartographic contour visuals for Programs by Country
  const countries = [
    { key: 'nigeria', label: 'West Africa / Lagos Coordination', arc: 'M60 175 Q180 85 320 130 T580 110 T740 160' },
    { key: 'europe', label: 'Europe Cross-Border Pathways', arc: 'M50 150 Q210 60 360 120 T620 95 T750 135' },
    { key: 'asia', label: 'Asia Fertility Coordination', arc: 'M65 140 Q230 190 400 115 T630 140 T745 95' },
    { key: 'canada', label: 'Canada Gestational Pathways', arc: 'M55 125 Q220 75 410 135 T600 90 T745 145' },
    { key: 'usa', label: 'United States Coordination', arc: 'M50 160 Q200 105 390 125 T590 85 T750 120' },
  ];

  for (const c of countries) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 240" fill="none">
  <rect width="800" height="240" fill="#FAF9F6"/>
  <g stroke="#E1E0DD" stroke-width="1">
    <line x1="0" y1="60" x2="800" y2="60"/>
    <line x1="0" y1="120" x2="800" y2="120"/>
    <line x1="0" y1="180" x2="800" y2="180"/>
    <line x1="160" y1="0" x2="160" y2="240"/>
    <line x1="320" y1="0" x2="320" y2="240"/>
    <line x1="480" y1="0" x2="480" y2="240"/>
    <line x1="640" y1="0" x2="640" y2="240"/>
  </g>
  <path d="${c.arc}" stroke="#8BB2AF" stroke-width="2" stroke-dasharray="6 6"/>
  <circle cx="160" cy="135" r="28" stroke="#E1E0DD" stroke-width="1.5"/>
  <circle cx="160" cy="135" r="5" fill="#17645F"/>
  <circle cx="580" cy="112" r="36" stroke="#8BB2AF" stroke-width="1.5"/>
  <circle cx="580" cy="112" r="5" fill="#17191A"/>
</svg>`;
    fs.writeFileSync(path.join(IMG_OUT, `country-${c.key}.svg`), svg);
  }
}

async function buildPngFavicons() {
  const brandFaviconSrc = path.join(IMG_OUT, 'zizo-donor-and-surrogacy-favicon.png');
  const fallbackSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 36 36">
      <rect width="36" height="36" rx="7" fill="#FAF9F6"/>
      <circle cx="14" cy="18" r="9" stroke="#17191A" stroke-width="2" fill="none"/>
      <circle cx="22" cy="18" r="9" stroke="#17645F" stroke-width="2" fill="none"/>
    </svg>`
  );
  const inputSource = fs.existsSync(brandFaviconSrc) ? brandFaviconSrc : fallbackSvg;

  const targets = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
  ];
  for (const t of targets) {
    const out = path.join(IMG_OUT, t.name);
    if (!fs.existsSync(out)) {
      await sharp(inputSource)
        .resize(t.size, t.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(out);
    }
  }
}

function copyVendorScripts() {
  const files = [
    { src: 'node_modules/lucide/dist/umd/lucide.min.js', dest: 'lucide.min.js' },
    { src: 'node_modules/marked/lib/marked.umd.js', dest: 'marked.umd.js' },
    { src: 'node_modules/dompurify/dist/purify.min.js', dest: 'purify.min.js' },
  ];
  for (const f of files) {
    const srcPath = path.join(ROOT, f.src);
    const destPath = path.join(VENDOR_OUT, f.dest);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  await buildResponsiveImages();
  writeBrandIconsAndCountryVectors();
  await buildPngFavicons();
  copyVendorScripts();
  console.log('[build-assets] Assets ready.');
}

main().catch((err) => {
  console.error('[build-assets] Failed:', err);
  process.exit(1);
});
