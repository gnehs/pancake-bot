const telegram = require("../telegram");
const sharp = require("sharp");
const chats = require("../../config").chats;
const getRandomChat = () => chats[Math.floor(Math.random() * chats.length)];
const svgNotoBold = require("text-to-svg").loadSync(
  "./components/inline/sticker/font/NotoSansCJKtc-Bold.otf"
);
const svgHuninn = require("text-to-svg").loadSync(
  "./components/inline/sticker/font/jf-openhuninn-1.1.ttf"
);
let cacheResult = {};
let cacheStickerId = {};
let moretextplz, tooManyRequests;
async function start() {
  moretextplz = await stickerFiletoId(
    "./components/inline/sticker/img/moretextplz.webp"
  );
  tooManyRequests = await stickerFiletoId(
    "./components/inline/sticker/img/tooManyRequests.webp"
  );
}
async function stickerFiletoId(url) {
  if (cacheStickerId[url]) return cacheStickerId[url];
  let msg = await telegram.sendDocument(getRandomChat(), {
    source: require("fs").readFileSync(url),
    filename: "sticker-gen.webp",
  });
  cacheStickerId[url] = msg.sticker.file_id;
  return msg.sticker.file_id;
}
async function stickerFileBuffertoId(source) {
  let msg = await telegram.sendDocument(getRandomChat(), {
    source,
    filename: "sticker-gen.webp",
  });
  return msg.sticker.file_id;
}
async function answer(ctx) {
  let text = ctx.inlineQuery.query.split(" ")[1];
  if (cacheResult[text]) {
    console.log(
      `[${
        ctx.inlineQuery.from.username || ctx.inlineQuery.from.first_name
      }][${text}] cached`
    );
    return ctx.answerInlineQuery(cacheResult[text], {
      cache_time: 60 * 40 /* second */,
    });
  }
  if (text.length < 1) {
    return ctx.answerInlineQuery(
      [{ type: "sticker", id: "plz", sticker_file_id: moretextplz }],
      { cache_time: 60 * 40 /* second */ }
    );
  }
  let results = [];
  try {
    async function genBlobbies() {
      let attributes, options, textRes, stickerRes;
      attributes = { fill: "#bcbdc8", stroke: "white" };
      options = { x: 0, y: 0, fontSize: 196, anchor: "top", attributes };
      textRes = await sharp(Buffer.from(svgNotoBold.getSVG(text, options)))
        .resize(332 - 30, 136 - 50, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .extend({
          top: 25,
          bottom: 25,
          left: 15,
          right: 15,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();
      stickerRes = await sharp("./components/inline/sticker/img/blobbies.png")
        .composite([{ input: textRes, top: 10, left: 0 }])
        .webp()
        .toBuffer();
      results.push({
        type: "sticker",
        id: "blobbies",
        sticker_file_id: await stickerFileBuffertoId(stickerRes),
      });
    }
    async function genDuck() {
      let attributes, options, textRes, stickerRes;
      attributes = { fill: "white" };
      options = {
        x: 0,
        y: 0,
        fontSize: 196,
        anchor: "top",
        attributes,
        y: -18,
      };
      textRes = await sharp(Buffer.from(svgHuninn.getSVG(text, options)))
        .resize(512 - 30, 225 - 80, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .extend({
          top: 40,
          bottom: 40,
          left: 15,
          right: 15,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();
      stickerRes = await sharp("./components/inline/sticker/img/duck.png")
        .composite([{ input: textRes, top: 0, left: 0 }])
        .webp()
        .toBuffer();
      results.push({
        type: "sticker",
        id: "duck",
        sticker_file_id: await stickerFileBuffertoId(stickerRes),
      });
    }
    async function genDono() {
      let attributes, options, textRes, stickerRes;
      attributes = { fill: "black" };
      options = {
        x: 0,
        y: 0,
        fontSize: 196,
        anchor: "top",
        attributes,
        y: -18,
      };
      textRes = await sharp(Buffer.from(svgHuninn.getSVG(text, options)))
        .resize(512 - 30, 106 - 20, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .extend({
          top: 10,
          bottom: 10,
          left: 15,
          right: 15,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();
      async function pushDono() {
        stickerRes = await sharp("./components/inline/sticker/img/dono.webp")
          .composite([{ input: textRes, top: 0, left: 0 }])
          .webp()
          .toBuffer();
        results.push({
          type: "sticker",
          id: "dono",
          sticker_file_id: await stickerFileBuffertoId(stickerRes),
        });
      }
      async function pushIknow() {
        stickerRes = await sharp("./components/inline/sticker/img/iknow.webp")
          .composite([{ input: textRes, top: 0, left: 0 }])
          .webp()
          .toBuffer();
        results.push({
          type: "sticker",
          id: "iknow",
          sticker_file_id: await stickerFileBuffertoId(stickerRes),
        });
      }
      return Promise.all([pushDono(), pushIknow()]);
    }
    async function genLeaf() {
      let attributes, options, textRes, stickerRes;
      attributes = { fill: "black" };
      options = { x: 0, y: 0, fontSize: 72, anchor: "top", attributes, y: -18 };
      textRes = await sharp(Buffer.from(svgNotoBold.getSVG(text, options)))
        .resize(346 - 30, 38 - 6, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .extend({
          top: 3,
          bottom: 3,
          left: 15,
          right: 15,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();
      stickerRes = await sharp("./components/inline/sticker/img/leaf.png")
        .composite([{ input: textRes, top: 262, left: 83 }])
        .webp()
        .toBuffer();
      results.push({
        type: "sticker",
        id: "leaf",
        sticker_file_id: await stickerFileBuffertoId(stickerRes),
      });
    }
    async function genSuck() {
      let attributes, options, textRes, stickerRes;
      attributes = { fill: "black", stroke: "white" };
      options = { x: 0, y: 0, fontSize: 96, anchor: "top", attributes, y: -18 };
      textRes = await sharp(Buffer.from(svgNotoBold.getSVG(text, options)))
        .resize(496 - 30, 112 - 6, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .extend({
          top: 3,
          bottom: 3,
          left: 15,
          right: 15,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();
      stickerRes = await sharp("./components/inline/sticker/img/suck.webp")
        .composite([{ input: textRes, top: 400, left: 0 }])
        .webp()
        .toBuffer();
      results.push({
        type: "sticker",
        id: "suck",
        sticker_file_id: await stickerFileBuffertoId(stickerRes),
      });
    }
    await Promise.all([genBlobbies(), genDono(), genDuck(), genSuck()]);
  } catch (e) {
    console.log(e);
    results.push({
      type: "sticker",
      id: "tooManyRequests",
      sticker_file_id: tooManyRequests,
    });
    return ctx.answerInlineQuery(results, { cache_time: 20 /* second */ });
  }
  console.log(
    `[${ctx.inlineQuery.from.username ? "@" : ""}${
      ctx.inlineQuery.from.username || ctx.inlineQuery.from.first_name
    }][${text}] 處理完畢`
  );
  cacheResult[text] = results;
  return ctx.answerInlineQuery(results, { cache_time: 60 * 40 /* second */ });
}

start();
module.exports = answer;
