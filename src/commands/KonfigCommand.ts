import type { Collection, CommandInteraction, InteractionResponse, Snowflake, TextChannel } from "discord.js";
import { ChannelType } from "discord.js";
import { BaseCommand } from "../structures/BaseCommand.js";
import { server } from "../structures/DatabaseSchema.js";
import type { PakUstadz } from "../structures/PakUstadz.js";

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

    public async execute(ctx: CommandInteraction): Promise<InteractionResponse | undefined> {
        const memberMissingPermissions = ctx.memberPermissions!.missing(["ManageChannels", "ManageRoles"]);
        if (memberMissingPermissions.length > 0) {
            return ctx.reply({ ephemeral: true, content: `Kamu harus punya permission: ${memberMissingPermissions.map(perm => `\`${perm}\``).join(", ")} untuk menjalankan perintah ini!` });
        }

        const botMissingPermissions = ctx.guild!.members.me!.permissions
            .missing(["ManageChannels", "ManageRoles"]);

        if (botMissingPermissions.length > 0) {
            return ctx.reply({ ephemeral: true, content: `Saya tidak punya permission: ${memberMissingPermissions.map(perm => `\`${perm}\``).join(", ")} untuk melakukan tugas saya!` });
        }

        const nsfwChannels = ctx.guild!.channels.cache.filter(c => c.type === ChannelType.GuildText && c.nsfw) as Collection<Snowflake, TextChannel>;

        const missingPerms: Snowflake[] = [];
        for (const c of nsfwChannels.values()) {
            const permsMissing = c.permissionsFor(ctx.client.user)!.missing("ManageChannels");
            if (permsMissing.length > 0) missingPerms.push(c.id);
        }

        if (missingPerms.length > 0) {
            const message = missingPerms.map(c => `**<#${c}>**`);
            return ctx.reply(`Saya tidak memiliki permission \`Manage Permissions\` di beberapa NSFW channel: ${message.join(", ")}`);
        }

        const enabled = ctx.options.get("boolean")!.value as boolean;

        const data = await this.pakUstadz.db
            .insert(server)
            .values({ id: ctx.guild!.id, enabled })
            .returning()
            .onConflictDoUpdate({ target: [server.id], set: { enabled } })
            .execute();

        // if (data[0].enabled!) await this.pakUstadz.nsfwLocker.action(ctx.guild!, {});

        return ctx.reply(`Berhasil ${enabled ? "menyalakan" : "mematikan"} bot di server ini!`);
    }
}

