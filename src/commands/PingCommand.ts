import { ColorResolvable, CommandInteraction, Message, MessageEmbed } from "discord.js";
import { BaseCommand } from "../structures/BaseCommand";
import { PakUstadz } from "../structures/PakUstadz";

export class PingCommand extends BaseCommand {
    public constructor(public pakUstadz: PakUstadz) {
        super(pakUstadz);
        this.meta
            .setName("ping")
            .setDescription("Tampilkan ping bot dalam milisekon!");
    }

    public execute(ctx: CommandInteraction): void {
        ctx.reply({ ephemeral: true, content: "🏓 PING..." }).then(async () => {
            const msg = await ctx.fetchReply();
            const latency = (msg instanceof Message ? msg.createdTimestamp : new Date(msg.timestamp).getTime()) - ctx.createdTimestamp;
            const wsLatency = this.pakUstadz.ws.ping.toFixed(0);
            const embed = new MessageEmbed()
                .setAuthor({ name: "🏓 PONG!", iconURL: this.pakUstadz.user!.displayAvatarURL() })
                .setColor(PingCommand.searchHex(wsLatency))
                .addFields({
                    name: "📶 API Latency",
                    value: `**\`${latency}\`** ms`,
                    inline: true
                }, {
                    name: "🌐 WebSocket Latency",
                    value: `**\`${wsLatency}\`** ms`,
                    inline: true
                })
                .setFooter({ text: `Diperintahkan oleh: ${ctx.user.tag}`, iconURL: ctx.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            ctx.editReply({ content: " ", embeds: [embed] }).catch(e => this.pakUstadz.logger.error(e));
        }).catch(e => this.pakUstadz.logger.error(e));
    }

    private static searchHex(ms: number | string): ColorResolvable {
        const listColorHex = [
            [0, 20, "#0DFF00"],
            [21, 50, "#0BC700"],
            [51, 100, "#E5ED02"],
            [101, 150, "#FF8C00"],
            [150, 200, "#FF6A00"]
        ];

        const defaultColor = "#FF0D00";

        const min = listColorHex.map(e => e[0]);
        const max = listColorHex.map(e => e[1]);
        const hex = listColorHex.map(e => e[2]);
        let ret: number | string = "#000000";

        for (let i = 0; i < listColorHex.length; i++) {
            if (min[i] <= ms && ms <= max[i]) {
                ret = hex[i];
                break;
            } else {
                ret = defaultColor;
            }
        }
        return ret as ColorResolvable;
    }
}
