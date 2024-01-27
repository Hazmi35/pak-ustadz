/*
import { ChannelType } from "discord.js";
import type { DiscordAPIError, Guild, GuildMember, NonThreadGuildBasedChannel, Snowflake, TextChannel } from "discord.js";
import type { PakUstadz } from "../structures/PakUstadz.js";

export type Options = { city?: string; lock?: boolean; userId?: Snowflake; };

export class NSFWLocker {
    public constructor(public pakUstadz: PakUstadz) {}

    public async action(guild: Guild, options: Options): Promise<void> {
        const { city: daerah, userId, lock } = options;
        const channels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText && c.nsfw);
        const enabledMembers = await this.pakUstadz.db.query.users.findMany({ select: { id: true, daerah: true }, where: { city: daerah, userId } });
        const members = await guild.members.fetch({ user: enabledMembers.map(enabled => enabled.id) });
        for await (const [, c] of channels) {
            const ch = await c.fetch(false) as TextChannel;
            for await (const [, member] of members) {
                const enabledMember = enabledMembers.find(m3 => m3.id === member.id);
                // const toUnlock = lock === undefined ? this.pakUstadz.fastings.get(enabledMember!.daerah) !== true : !lock;
                // try {
                //     await (toUnlock ? NSFWLocker.unlock(ch, member) : NSFWLocker.lock(ch, member));
                // } catch (error: unknown) {
                //     if ((error as DiscordAPIError).code === 50_001) return;
                //     this.pakUstadz.logger.error(error);
                // }
            }
        }
    }

    public static async lock(channel: TextChannel, member: GuildMember): Promise<NonThreadGuildBasedChannel> {
        return channel.permissionOverwrites.create(member, { VIEW_CHANNEL: false }, { reason: "Member ini sedang berpuasa" });
    }

    public static async unlock(channel: TextChannel, member: GuildMember): Promise<NonThreadGuildBasedChannel> {
        return channel.permissionOverwrites.delete(member, "Member ini sudah berbuka puasa");
    }
}
 */
