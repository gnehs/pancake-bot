const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`);
  console.log(err);
});

// components
bot.use(
  require("./components/simple-reply"),
  require("./components/dayoff"),
  require("./components/help"),
  require("./components/start"),
  require("./components/stepstep"),
  require("./components/gonokami"),
  require(`./components/inline/index`),
  require("./components/subscribe/index")
);

bot.catch((err) => {
  console.log("[error]", err);
});

bot.launch();
