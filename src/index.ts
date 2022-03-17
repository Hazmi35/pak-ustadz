import { Intents, Options, Sweepers } from "discord.js";
import { PakUstadz } from "./structures/PakUstadz";
import { CustomError } from "./util/CustomErrror";

const pakUstadz = new PakUstadz({
    makeCache: Options.cacheWithLimits({
        ...Options.defaultMakeCacheSettings,
        MessageManager: { // Sweep messages every 5 minutes, removing messages that have not been edited or created in the last 3 hours
            maxSize: Infinity,
            sweepInterval: 300, // 5 Minutes
            sweepFilter: Sweepers.filterByLifetime({
                lifetime: 10800 // 3 Hours
            })
        },
        ThreadManager: { // Sweep threads every 5 minutes, removing threads that have been archived in the last 3 hours
            maxSize: Infinity,
            sweepInterval: 300, // 5 Minutes
            sweepFilter: Sweepers.filterByLifetime({
                lifetime: 10800, // 3 Hours
                getComparisonTimestamp: e => e.archiveTimestamp!,
                excludeFromSweep: e => !e.archived
            })
        }
    }),
    retryLimit: 3,
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS]
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

await pakUstadz.build();

await pakUstadz.start();
