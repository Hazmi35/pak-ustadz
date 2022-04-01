import "dotenv/config";
import { Intents, Options } from "discord.js";
import { PakUstadz } from "./structures/PakUstadz";
import { CustomError } from "./util/CustomErrror";

const pakUstadz = new PakUstadz({
    makeCache: Options.cacheWithLimits({
        ...Options.defaultMakeCacheSettings,
        // Don't cache these
        MessageManager: 0,
        ReactionManager: 0
    }),
    retryLimit: 3,
    shardCount: Number(process.env.SHARD_COUNT ?? 0),
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
});

process.on("unhandledRejection", e => {
    if (e instanceof Error) {
        pakUstadz.logger.error(e);
    } else {
        pakUstadz.logger.error(CustomError("PromiseError", e as string));
    }
});
process.on("uncaughtException", e => {
    pakUstadz.logger.fatal(e);
    process.exit(1);
});

pakUstadz.build();

await pakUstadz.start();
