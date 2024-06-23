const letterList = {
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
const chooseRandomElementFromArray = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];
async function answer(ctx) {
  let results = [];
  // parse text
  let text = ctx.inlineQuery.query.split(" ");
  text.shift(); // remove first element
  text = text.join(" ");

  let pushResult = (title, result) => {
    results.push({
      type: "article",
      id: `Aa_${title}`,
      title: title,
      description: result,
      input_message_content: {
        message_text: result,
      },
    });
  };
  pushResult("25% 轉換", transformLetter(text, 0.25));
  pushResult("100% 通通轉換", transformLetter(text, 1));

  console.log(
    `[${ctx.inlineQuery.from.username ? "@" : ""} + ${
      ctx.inlineQuery.from.username || ctx.inlineQuery.from.first_name
    }][letter][${text}]處理完畢`
  );
  return ctx.answerInlineQuery(results, { cache_time: 60 * 60 /* second */ });
}
function transformLetter(text, randomRate = 1) {
  let result = "";
  for (let letter of text) {
    if (
      Object.keys(letterList).includes(letter) &&
      randomRate >= Math.random()
    ) {
      result += chooseRandomElementFromArray(letterList[letter]);
    } else {
      result += letter;
    }
  }
  return result;
}

module.exports = answer;
