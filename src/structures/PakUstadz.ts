import "dotenv/config";
import { Client, Collection, Guild } from "discord.js";
import { createLogger } from "../util/Logger";
import { CommandsRegistrar } from "../util/CommandsRegistrar";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BaseCommand } from "./BaseCommand";
import prisma, { Server } from "@prisma/client"; // @prisma/client is not ESM
import { Imsakiyah, ImsakiyahClock } from "../util/ImsakiyahClock";
import { NSFWLocker, Options } from "../util/NSFWLocker";
const { PrismaClient } = prisma;


const currentDirName = dirname(fileURLToPath(import.meta.url));
export class PakUstadz extends Client {
    public isProd = process.env.NODE_ENV === "production";
    public logger = createLogger("client", "id-ID", "shard", this.shard?.ids[0], !this.isProd);
    public commands = new Collection<string, BaseCommand>();
    public prisma = new PrismaClient();
    public userData = this.prisma.user;
    public serverData = this.prisma.server;
    public readonly imsakiyah: Collection<string, Imsakiyah[]> = new Collection();
    public readonly fastings: Collection<string, boolean> = new Collection();
    public readonly nsfwLocker = new NSFWLocker(this);
    public readonly imsakiyahClock = new ImsakiyahClock(this, resolve(currentDirName, "..", "imsakiyah"));
    private readonly commandsRegistrar = new CommandsRegistrar(this, resolve(currentDirName, "..", "commands"));

    public build(): void {
        this.on("ready", async () => {
            // Register slash commands
            await this.commandsRegistrar.register();

            // Connect to database
            await this.prisma.$connect();

            // Init imsakiyahClock system
            await this.imsakiyahClock.init();

            this.logger.info("Bot sudah ready dan online di Discord!");

            // Delete guildsData from database if the bot kicked in it
            const deletedGuilds = await this.deleteKickedGuilds();
            if (deletedGuilds.length > 0) this.logger.info(deletedGuilds, "Saya telah dikeluarkan dari guild-guild dibawah ini, datanya akan dihapus:");
            await this.doActionOnEnabledGuilds({});
        });

        this.on("interactionCreate", interaction => {
            if (!interaction.isCommand() && !interaction.isAutocomplete()) return undefined;

            if (interaction.isCommand() && interaction.channel?.type === "DM") {
                return interaction.reply("Maaf, bot ini hanya bisa digunakan di server / guild saja.");
            }

            const command = this.commands.get(interaction.commandName);

            command!.execute(interaction);
        });

        this.on("guildDelete", async g => {
            const guild = await this.serverData.findFirst({ where: { serverId: g.id } });
            if (!guild) return;
            await this.serverData.delete({ where: { id: guild.id } });
            this.logger.info(`Saya telah dikeluarkan dari guild: ${g.name}, data untuk server tersebut terhapus.`);
        });

        this.on("debug", m => this.logger.debug(m));

        // If Imsak and Iftar event from imsakiyahClock is emitted, then do the actions.
        this.imsakiyahClock.on("imsak", (daerah: string) => this.doActionOnEnabledGuilds({ daerah, lock: true }));
        this.imsakiyahClock.on("iftar", (daerah: string) => this.doActionOnEnabledGuilds({ daerah, lock: false }));
    }

    public start(): Promise<string> {
        return this.login(process.env.DISCORD_TOKEN);
    }

    private async doActionOnEnabledGuilds(option: Options): Promise<void> {
        for (const g of await this.getEnabledGuilds()) { await this.nsfwLocker.action(g, option); }
    }

    private async getEnabledGuilds(): Promise<Guild[]> {
        const enabledGuilds = await this.serverData.findMany({ select: { serverId: true }, where: { enabled: true } });
        return enabledGuilds.map<Guild | null>(g => this.guilds.resolve(g.serverId)!).filter(g => g !== null) as Guild[];
    }

    private async deleteKickedGuilds(): Promise<Server[]> {
        const deletedGuilds = await this.serverData.findMany({ where: { serverId: { notIn: (await this.getEnabledGuilds()).map(g => g.id) } } });
        await this.serverData.deleteMany({ where: { id: { in: deletedGuilds.map(d => d.id) } } });
        return deletedGuilds;
    }
}
