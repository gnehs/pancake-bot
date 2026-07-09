
[![GitHub license](https://img.shields.io/github/license/gnehs/pancake-bot)](https://github.com/gnehs/pancake-bot/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/gnehs/pancake-bot)](https://github.com/gnehs/pancake-bot/issues)
[![GitHub forks](https://img.shields.io/github/forks/gnehs/pancake-bot)](https://github.com/gnehs/pancake-bot/network)
[![GitHub stars](https://img.shields.io/github/stars/gnehs/pancake-bot)](https://github.com/gnehs/pancake-bot/stargazers)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/gnehs/pancake-bot/build.yaml)
[![made-with-grammY](https://img.shields.io/badge/Made%20with-grammY-0098ea.svg)](https://grammy.dev/)
[![Flat](https://gnehs.github.io/made-with-pancake-badge/flat.svg)](https://pancake.tw)
# 可愛鬆餅機器人

## Requirements

- Node.js 26+
- pnpm 11+

## Environment

- `BOT_TOKEN`: Telegram bot token.
- `DATABASE_PATH`: SQLite database path. Default: `data/pancake.sqlite`.
- `INLINE_CACHE_CHAT_IDS`: Comma-separated chat ids used to upload inline media and cache Telegram `file_id` values.
- `PRELOAD_PUFFY_CACHE`: Set to `false` to disable startup preloading for puffy images.

Inline sticker and puffy photo results need `INLINE_CACHE_CHAT_IDS`; otherwise the bot can still start, but those inline processors cannot upload new media.

## Usage

```sh
pnpm install
BOT_TOKEN='123:......' INLINE_CACHE_CHAT_IDS='-100123,-100456' pnpm dev
```

Production build:

```sh
pnpm build
BOT_TOKEN='123:......' INLINE_CACHE_CHAT_IDS='-100123,-100456' pnpm start
```

## Migrate Legacy JSON Data

The old app used `database.json` and `votes.json`. The new app stores data in SQLite and includes a migration script:

```sh
pnpm migrate:json -- --database-json ./database.json --votes-json ./votes.json
```

The migration normalizes active Bahamut subscriptions, puffy Telegram photo cache, and sent Bahamut item ids. It also keeps legacy JSON keys in `legacy_kv` so removed features can be inspected later without keeping them in the runtime.
