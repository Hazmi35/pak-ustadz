/* import { ApplicationCommandOptionChoice, AutocompleteInteraction, CommandInteraction } from "discord.js";
import { BaseCommand } from "../structures/BaseCommand";
import { PakUstadz } from "../structures/PakUstadz";

export class KapanBukaCommand extends BaseCommand {
    public constructor(pakUstadz: PakUstadz) {
        super(pakUstadz);
        this.meta
            .setName("kapanbuka")
            .setDescription("Kapan buka?")
            .addStringOption(option => option
                .setName("daerah")
                .setAutocomplete(true)
                .setDescription("Daerah yang dimaksud")
                .setRequired(false));
    }

    public async execute(ctx: AutocompleteInteraction | CommandInteraction): Promise<void> {
        if (ctx.isAutocomplete()) {
            const search = ctx.options.getString("daerah")!.toLowerCase();
            return ctx.respond(this.generateOptions()
                .filter(o => o.name.toLowerCase().includes(search)).slice(0, 25));
        }

        const currentData = await this.pakUstadz.userData.findFirst({ where: { userId: ctx.user.id } });
        const daerah = ctx.options.getString("daerah");
        const daerahTujuan = daerah ?? currentData?.daerah;

        if (daerahTujuan === undefined) {
            return ctx.reply({ ephemeral: true, content: "Sepertinya kamu belum daftar dan tidak menyebutkan daerah di command ini" });
        }

        const namaDaerah = this.generateOptions().find(i => i.value === daerahTujuan)!.name;

        this.pakUstadz.imsakiyah.get(daerahTujuan);
        const now = new Date(Date.now());
        const today = this.pakUstadz.imsakiyah.get(daerahTujuan)!.find(i2 => i2.bulan === now.getMonth() && i2.tanggal === now.getDate());

        if (!today) return ctx.reply({ ephemeral: true, content: "Hari ini bukan Puasa Ramadhan." });

        return ctx.reply(`Maghrib di daerah \`${namaDaerah}\` adalah: <t:${Math.floor(today.maghrib.getTime() / 1000)}:R> (<t:${Math.floor(today.maghrib.getTime() / 1000)}:t>)`);
    }

    private generateOptions(): ApplicationCommandOptionChoice[] {
        return Array.from(this.pakUstadz.imsakiyah.keys())
            .map(i => ({ name: i.split("-").map(n => `${n.charAt(0).toUpperCase()}${n.slice(1)}`).join(" "), value: i }));
    }
}
 */
