import { CommandInteraction } from "discord.js";
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
        if (!ctx.memberPermissions!.has("MANAGE_CHANNELS")) return ctx.reply("Kamu harus punya permission: `MANAGE_CHANNELS` untuk menjalankan perintah ini!");

        let currentData = await this.pakUstadz.serverData.findFirst({ where: { serverId: ctx.guildId! } });
        if (currentData === null) {
            currentData = await this.pakUstadz.serverData.create({ data: { serverId: ctx.guildId!, enabled: false } });
        }

        const enabled = ctx.options.getBoolean("boolean")!;

        await this.pakUstadz.serverData.update({ where: { id: currentData.id }, data: { enabled } });
        await ctx.reply(`Berhasil ${enabled ? "menyalakan" : "mematikan"} bot di server ini!`);
    }
}
