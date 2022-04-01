/* eslint-disable @typescript-eslint/naming-convention */
import { DiscordAPIError, Guild, GuildMember, NonThreadGuildBasedChannel, Snowflake, TextChannel } from "discord.js";
import { PakUstadz } from "../structures/PakUstadz";

export interface Options { daerah?: string; lock?: boolean; userId?: Snowflake }

export class NSFWLocker {
    public constructor(public pakUstadz: PakUstadz) {}

    public async action(guild: Guild, options: Options): Promise<void> {
        const { daerah, userId, lock } = options;
        const channels = guild.channels.cache.filter(c => c.type === "GUILD_TEXT" && c.nsfw);
        const enabledMembers = await this.pakUstadz.userData.findMany({ select: { userId: true, daerah: true }, where: { daerah, userId } });
        const members = await guild.members.fetch({ user: enabledMembers.map(e => e.userId) });
        for (const [, c] of channels) {
            const ch = await c.fetch(false) as TextChannel;
            for (const [, m] of members) {
                const m2 = enabledMembers.find(m3 => m3.userId === m.id);
                const toUnlock = lock === undefined ? this.pakUstadz.fastings.get(m2!.daerah) !== true : !lock;
                try {
                    if (toUnlock) await NSFWLocker.unlock(ch, m);
                    else await NSFWLocker.lock(ch, m);
                } catch (error: unknown) {
                    if ((error as DiscordAPIError).code === 50001) return;
                    this.pakUstadz.logger.error(error);
                }
            }
        }
    }

    public static lock(channel: TextChannel, member: GuildMember): Promise<NonThreadGuildBasedChannel> {
        return channel.permissionOverwrites.create(member, { VIEW_CHANNEL: false }, { reason: "Member ini sedang berpuasa" });
    }

    public static unlock(channel: TextChannel, member: GuildMember): Promise<NonThreadGuildBasedChannel> {
        return channel.permissionOverwrites.delete(member, "Member ini sudah berbuka puasa");
    }
}
