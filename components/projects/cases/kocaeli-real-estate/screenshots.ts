/**
 * Product screenshots for the Kocaeli case page.
 * Set available: true only when the file exists under public/projects/kocaeli-real-estate/.
 * See SCREENSHOTS.md in that folder for expected filenames and ratios.
 */
export type KocaeliScreenshot = {
  id: string;
  /** Path under /public */
  src: string;
  available: boolean;
  alt: { en: string; tr: string };
  caption: { en: string; tr: string };
};

export const kocaeliScreenshots: KocaeliScreenshot[] = [
  {
    id: "map-selection",
    src: "/projects/kocaeli-real-estate/map-selection.png",
    available: false,
    alt: {
      en: "Map location selection in the prediction app",
      tr: "Tahmin uygulamasında haritadan konum seçimi",
    },
    caption: {
      en: "Location / map selection",
      tr: "Konum / harita seçimi",
    },
  },
  {
    id: "site-inputs",
    src: "/projects/kocaeli-real-estate/site-inputs.png",
    available: false,
    alt: {
      en: "Site or project selection and dwelling inputs",
      tr: "Site veya proje seçimi ve konut girdileri",
    },
    caption: {
      en: "Site / project selection or dwelling inputs",
      tr: "Site/proje seçimi veya konut girdileri",
    },
  },
  {
    id: "prediction-result",
    src: "/projects/kocaeli-real-estate/prediction-result.png",
    available: false,
    alt: {
      en: "Prediction result with reasonable value band",
      tr: "Makul değer bandı ile tahmin sonucu",
    },
    caption: {
      en: "Prediction result / value band",
      tr: "Tahmin sonucu / değer bandı",
    },
  },
];

export function getAvailableScreenshots(): KocaeliScreenshot[] {
  return kocaeliScreenshots.filter((s) => s.available);
}
