/* import { Collection, CommandInteraction, Snowflake, TextChannel } from "discord.js";
import { BaseCommand } from "../structures/BaseCommand";
import { PakUstadz } from "../structures/PakUstadz";

export class KonfigCommand extends BaseCommand {
    public constructor(public pakUstadz: PakUstadz) {
        super(pakUstadz);
        this.meta
            .setName("konfig")
            .setDescription("Lakukan konfigurasi bot terhadap server ini")
            .addBooleanOption(input => input
                .setName("boolean")
                .setDescription("Nyalakan bot?")
                .setRequired(true));
    }

    public async execute(ctx: CommandInteraction): Promise<void> {
        if (!ctx.memberPermissions!.has(["MANAGE_CHANNELS", "MANAGE_ROLES"])) {
            const missing = ctx.memberPermissions!.missing(["MANAGE_CHANNELS", "MANAGE_ROLES"]);
            return ctx.reply({ ephemeral: true, content: `Kamu harus punya permission: ${missing.map(p => `\`${p}\``).join(", ")} untuk menjalankan perintah ini!` });
        }

        const botPermissions = ctx.guild!.members.resolve(ctx.client.user!.id)!.permissions;

        if (!botPermissions.has(["MANAGE_CHANNELS", "MANAGE_ROLES"])) {
            const missing = botPermissions.missing(["MANAGE_CHANNELS", "MANAGE_ROLES"]);
            return ctx.reply({ ephemeral: true, content: `Saya tidak punya permission: ${missing.map(p => `\`${p}\``).join(", ")} untuk melakukan tugas saya!` });
        }

        const nsfwChannels = ctx.guild!.channels.cache.filter(c => c.type === "GUILD_TEXT" && c.nsfw) as Collection<Snowflake, TextChannel>;

        const missingPerms: Snowflake[] = [];
        for (const c of nsfwChannels.values()) {
            const permsMissing = c.permissionsFor(ctx.client.user!)!.missing("MANAGE_ROLES");
            if (permsMissing.length > 0) missingPerms.push(c.id);
        }

        if (missingPerms.length > 0) {
            const message = missingPerms.map(c => `**<#${c}>**`);
            return ctx.reply(`Saya tidak memiliki permission \`Manage Permissions\` di beberapa NSFW channel: ${message.join(", ")}`);
        }

        let currentData = await this.pakUstadz.serverData.findFirst({ where: { serverId: ctx.guildId! } });
        if (currentData === null) {
            currentData = await this.pakUstadz.serverData.create({ data: { serverId: ctx.guildId!, enabled: false } });
        }

        const enabled = ctx.options.getBoolean("boolean")!;

        await this.pakUstadz.serverData.update({ where: { id: currentData.id }, data: { enabled } });
        if (enabled) await this.pakUstadz.nsfwLocker.action(ctx.guild!, {});
        await ctx.reply(`Berhasil ${enabled ? "menyalakan" : "mematikan"} bot di server ini!`);
    }
}
 */
