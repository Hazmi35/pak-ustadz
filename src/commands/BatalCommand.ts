import { CommandInteraction } from "discord.js";
import { BaseCommand } from "../structures/BaseCommand";
import { PakUstadz } from "../structures/PakUstadz";

export class BatalCommand extends BaseCommand {
    public constructor(public pakUstadz: PakUstadz) {
        super(pakUstadz);
        this.meta
            .setName("batal")
            .setDescription("Yahh, kok kamu batal puasa")
            .addBooleanOption(input => input
                .setName("boolean")
                .setDescription("Batalkan pendaftaran")
                .setRequired(false));
    }

    public async execute(ctx: CommandInteraction): Promise<void> {
        let currentData = await this.pakUstadz.serverData.findFirst({ where: { serverId: ctx.guildId! } });
        if (currentData === null) {
            currentData = await this.pakUstadz.serverData.create({ data: { serverId: ctx.guildId!, enabled: false } });
        }

        const batalkanRegistrasi = ctx.options.getBoolean("boolean")!;
        const data = await this.pakUstadz.userData.findFirst({ where: { userId: ctx.user.id } });

        if (!data) return ctx.reply({ ephemeral: true, content: "Kamu belum terdaftar!" });

        await this.pakUstadz.nsfwLocker.action(ctx.guild!, { userId: data.userId, lock: false });

        if (batalkanRegistrasi) {
            await this.pakUstadz.userData.delete({ where: { id: data.id } });
            return ctx.reply("Yahh... Kamu membatalkan pendaftaran PakUstadz, semoga kamu diberikan Hidayah...");
        }
        this.pakUstadz.failed.add(ctx.user.id);
        return ctx.reply("Yahh... Kok kamu batal puasa hari ini? Lain kali kamu harus lebih baik ya!");
    }
}
