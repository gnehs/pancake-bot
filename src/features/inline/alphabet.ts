import type { InlineQueryResult } from "grammy/types";
import type { BotContext } from "../../types.ts";

const letterList: Record<string, string> = {
  A: "ÁÀĂẮẰẴẲÂẤẦẪẨǍÅǺÄǞÃȦǠĄĀẢȀȂẠẶẬḀȺ",
  a: "áàăắằẵẳâấầẫẩǎåǻäǟãȧǡąāảȁȃạặậḁⱥ",
  B: "ḂḄḆɃƁ",
  b: "ḃḅḇƀᵬƂᵬᶀ",
  C: "ĆĈČĊÇḈȻƇ",
  c: "ćĉčċçḉȼƈ",
  D: "ĎḊḐḌḒḎĐƉƊ",
  d: "ďḋḑḍḓḏđɖɗ",
  E: "ÉÈĔÊẾỀỄỂĚËẼĖȨḜĘĒḖḔẺȄȆẸỆḘḚɆ",
  e: "éèĕêếềễểěëẽėȩḝęēḗḕẻȅȇẹệḙḛɇ",
  F: "ḞƑ",
  f: "ḟƒᵮᶂ",
  G: "ǴĞĜǦĠĢḠǤ",
  g: "ǵğĝǧġģḡǥ",
  H: "ĤȞḦḢḨḤḪHĦⱧ",
  h: "ĥȟḧḣḩḥḫẖħⱨ",
  I: "ÍÌĬÎǏÏḮĨİĮĪỈȈȊỊḬIƗ",
  i: "íìĭîǐïḯĩiįīỉȉȋịḭıɨ",
  J: "ĴɈ",
  j: "ĵɉ",
  K: "ḰǨĶḲḴⱩ",
  k: "ḱǩķḳḵƘⱪ",
  L: "ĹĽĻḶḸḼḺŁĿȽⱠⱢ",
  l: "ĺľļḷḹḽḻłŀƚⱡɫ",
  M: "ḾṀṂM",
  m: "ḿṁṃ",
  N: "ŃǸŇÑṄŅṆṊṈ",
  n: "ńǹňñṅņṇṋṉ",
  O: "ÓÒŎÔỐỒỖỔǑÖȪŐÕṌṎȬȮȰØǾǪǬŌṒṐỎȌȎƠỚỜỠỞỢỌỘƟ",
  o: "óòŏôốồỗổǒöȫőõṍṏȭȯȱøǿǫǭōṓṑỏȍȏơớờỡởợọộɵ",
  P: "ṔṖⱣƤ",
  p: "ṕṗᵽƥ",
  Q: "Ɋ",
  q: "ɋ",
  R: "ŔŘṘŖȐȒṚṜṞɌ",
  r: "ŕřṙŗȑȓṛṝṟɍ",
  S: "ŚṤŜŠṦṠŞṢṨȘ$",
  s: "śṥŝšṧṡşṣṩș",
  T: "ŤTṪŢṬȚṰṮŦȾ",
  t: "ťẗṫţṭțṱṯŧⱦ",
  U: "ÚÙŬÛǓŮÜǗǛǙǕŰŨṸŲŪṺỦȔȖƯỨỪỮỬỰỤṲṶṴɄ",
  u: "úùŭûǔůüǘǜǚǖűũṹųūṻủȕȗưứừữửựụṳṷṵʉ",
  V: "ṼṾ",
  v: "ṽṿ",
  W: "ẂẀŴẄẆ",
  w: "ẃẁŵẘẅẇẉ",
  X: "ẌẊ",
  x: "ẍẋ",
  Y: "ÝỲŶYŸỸẎȲỶỴ",
  y: "ẙÿỹẏȳỷỵýỳŷ",
  Z: "ŹẐŽŻẒẔƵ",
  z: "źẑžżẓẕƶ",
};

function chooseRandomElement(value: string): string {
  return value[Math.floor(Math.random() * value.length)] ?? "";
}

function transformLetter(text: string, randomRate = 1): string {
  let result = "";
  for (const letter of text) {
    const candidates = letterList[letter];
    result += candidates && randomRate >= Math.random()
      ? chooseRandomElement(candidates)
      : letter;
  }
  return result;
}

function article(title: string, result: string): InlineQueryResult {
  return {
    type: "article",
    id: `Aa_${title}`,
    title,
    description: result,
    input_message_content: {
      message_text: result,
    },
  };
}

export async function answerAlphabetInlineQuery(ctx: BotContext): Promise<void> {
  const parts = ctx.inlineQuery?.query.split(" ") ?? [];
  parts.shift();
  const text = parts.join(" ");
  const results = [
    article("25% 轉換", transformLetter(text, 0.25)),
    article("100% 通通轉換", transformLetter(text, 1)),
  ];

  console.log(
    `[${ctx.inlineQuery?.from.username ? "@" : ""}${
      ctx.inlineQuery?.from.username ?? ctx.inlineQuery?.from.first_name ?? "unknown"
    }][letter][${text}]處理完畢`,
  );
  await ctx.answerInlineQuery(results, { cache_time: 60 * 60 });
}
