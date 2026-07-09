export type InlineProcessorMetadata = {
  id: "puffy" | "sticker" | "alphabet";
  name: string;
  keywords: string[];
};

export const inlineProcessors: InlineProcessorMetadata[] = [
  {
    id: "puffy",
    name: "海綿寶寶圖片搜尋器",
    keywords: ["p", "puffy", "海"],
  },
  {
    id: "sticker",
    name: "貼圖產生器",
    keywords: ["s", "sticker", "貼"],
  },
  {
    id: "alphabet",
    name: "隨機變音符號轉換器（A→Å）",
    keywords: ["a", "alphabet", "英"],
  },
];
