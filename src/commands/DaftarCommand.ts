import { ApplicationCommandOptionChoice, AutocompleteInteraction, CommandInteraction } from "discord.js";
import { BaseCommand } from "../structures/BaseCommand";
import { PakUstadz } from "../structures/PakUstadz";

export class DaftarCommand extends BaseCommand {
    public constructor(pakUstadz: PakUstadz) {
        super(pakUstadz);
        this.meta
            .setName("daftar")
            .setDescription("Daftarkan diri anda agar terhindar dari godaan channel NSFW Discord")
            .addStringOption(option => option
                .setName("daerah")
                .setAutocomplete(true)
                .setDescription("Daerah terdekat dengan mu")
                .setRequired(true));
    }

    public async execute(ctx: AutocompleteInteraction | CommandInteraction): Promise<void> {
        if (ctx.isAutocomplete()) {
            const search = ctx.options.getString("daerah")!.toLowerCase();
            return ctx.respond(this.generateOptions()
                .filter(o => o.name.toLowerCase().includes(search)).slice(0, 25));
        }

        const currentData = await this.pakUstadz.userData.findFirst({ where: { userId: ctx.user.id } });

        const daerah = this.generateOptions().find(i => i.value === ctx.options.getString("daerah")!)!;

        if (currentData !== null) {
            await this.pakUstadz.userData.update({ where: { id: currentData.id }, data: { daerah: daerah.value as string } });
            return ctx.reply(`Kamu sudah mendaftarkan ulang dirimu dengan daerah: ${daerah.name}`);
        }

        await this.pakUstadz.userData.create({ data: { userId: ctx.user.id, daerah: daerah.value as string } });
        return ctx.reply(`Kamu sudah mendaftarkan dirimu dengan daerah: ${daerah.name}`);
    }

    private generateOptions(): ApplicationCommandOptionChoice[] {
        return this.pakUstadz.imsakiyah
            .map(i => i.replace(".json", ""))
            .map(i => ({ name: i.split("-").map(n => `${n.charAt(0).toUpperCase()}${n.slice(1)}`).join(" "), value: i }));
    }
}
