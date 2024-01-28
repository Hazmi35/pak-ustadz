import type { Guild, Snowflake, TextChannel } from "discord.js";
import { ChannelType } from "discord.js";
import { eq, inArray } from "drizzle-orm";
import { users } from "../structures/DatabaseSchema.js";
import type { PakUstadz } from "../structures/PakUstadz.js";

export type Options = { lock?: boolean; userId?: Snowflake; };

export class NsfwLocker {
    public constructor(public pakUstadz: PakUstadz) {}

    public async action(guild: Guild, options: Options): Promise<void> {
        const { userId, lock } = options;

        let enabledMembers: string[];

        if (userId === undefined) {
            const members = guild.members.cache.filter(a => !a.user.bot).map(a => a.id);

            enabledMembers = await this.pakUstadz.db
                .select({ id: users.id })
                .from(users)
                .where(inArray(users.id, members))
                .execute()
                .then(a => a.map(b => b.id));
        } else {
            enabledMembers = await this.pakUstadz.db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.id, userId))
                .execute()
                .then(a => a.map(b => b.id));
        }

        const channels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText && c.nsfw);

        for await (const [_, a] of channels) {
            const ch = await a.fetch(false) as TextChannel;
            for await (const [, b] of enabledMembers) {
                const member = await guild.members.fetch({ user: b });
                // Continue later
            }
        }

        // const enabledMembers = await this.pakUstadz.db
    }
}
