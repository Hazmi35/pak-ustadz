import { EmbedBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import { BaseCommand } from "../structures/BaseCommand.js";
import type { PakUstadz } from "../structures/PakUstadz.js";

export class PingCommand extends BaseCommand {
    public constructor(public pakUstadz: PakUstadz) {
        super(pakUstadz);
        this.meta
            .setName("ping")
            .setDescription("Tampilkan ping bot dalam milisekon!");
    }

    public async execute(ctx: CommandInteraction): Promise<void> {
        await ctx.reply({ ephemeral: true, content: "🏓 PING..." });

        const msg = await ctx.fetchReply();
        const latency = msg.createdTimestamp - ctx.createdTimestamp;
        const wsLatency = this.pakUstadz.ws.ping.toFixed(0);
        const embed = new EmbedBuilder()
            .setAuthor({ name: "🏓 PONG!", iconURL: this.pakUstadz.user!.displayAvatarURL() })
            .setColor(PingCommand.searchHex(latency))
            .addFields({
                name: "📶 API Latency",
                value: `**\`${latency}\`** ms`,
                inline: true
            }, {
                name: "🌐 WebSocket Latency",
                value: `**\`${wsLatency}\`** ms`,
                inline: true
            })
            .setFooter({ text: `Diperintahkan oleh: ${ctx.user.tag}`, iconURL: ctx.user.displayAvatarURL() })
            .setTimestamp();

        await ctx.editReply({ content: " ", embeds: [embed] });
    }

    private static searchHex(ms: number): number {
        const listColorHex = [
            [0, 20, 0x0DFF00],
            [21, 50, 0x0BC700],
            [51, 100, 0xE5ED02],
            [101, 150, 0xFF8C00],
            [150, 200, 0xFF6A00]
        ];

        const defaultColor = 0xFF0D00;

        const min = listColorHex.map(a => a[0]);
        const max = listColorHex.map(b => b[1]);
        const hex = listColorHex.map(c => c[2]);
        let ret = 0x000000;

        for (let i = 0; i < listColorHex.length; i++) {
            if (min[i] <= ms && ms <= max[i]) {
                ret = hex[i];
                break;
            } else {
                ret = defaultColor;
            }
        }
        return ret;
    }
}
