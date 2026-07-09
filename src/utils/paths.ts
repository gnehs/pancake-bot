import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export const projectRoot = resolve(here, "../..");
export const puffyAssetsDir = resolve(projectRoot, "components/inline/puffy");
export const stickerAssetsDir = resolve(projectRoot, "components/inline/sticker");
export const stickerImageDir = resolve(stickerAssetsDir, "img");
export const stickerFontDir = resolve(stickerAssetsDir, "font");
