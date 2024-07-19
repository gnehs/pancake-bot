const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

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

bot.launch();

// catch error
process.on("unhandledRejection", (error) => {
  console.error(error);
});
