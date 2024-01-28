import "source-map-support/register.js";
import process from "node:process";
import { IntentsBitField, Options } from "discord.js";
import { PakUstadz } from "./structures/PakUstadz.js";
import { CustomError } from "./util/CustomError.js";

const pakUstadz = new PakUstadz({
    makeCache: Options.cacheWithLimits({
        ...Options.DefaultMakeCacheSettings,

        // Don't cache these
        MessageManager: 0,
        ReactionManager: 0,
        GuildEmojiManager: 0,
        BaseGuildEmojiManager: 0,
        DMMessageManager: 0,
        GuildForumThreadManager: 0,
        GuildMessageManager: 0,
        GuildStickerManager: 0,
        GuildTextThreadManager: 0,
        GuildInviteManager: 0,
        GuildBanManager: 0,
        PresenceManager: 0,
        ReactionUserManager: 0,
        StageInstanceManager: 0,
        ThreadManager: 0,
        VoiceStateManager: 0
    }),
    shardCount: Number(process.env.SHARD_COUNT ?? 1),
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers]
});

process.on("unhandledRejection", err => {
    if (err instanceof Error) {
        pakUstadz.logger.error(err);
    } else {
        pakUstadz.logger.error(new CustomError("PromiseError", err as string));
    }
});
process.on("uncaughtException", err => {
    pakUstadz.logger.fatal(err);
    process.exit(1);
});

pakUstadz.build();

await pakUstadz.start();
