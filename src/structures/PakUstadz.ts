import { dirname, resolve, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { ChannelType, Client, Collection } from "discord.js";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { CommandsRegistrar } from "../util/CommandsRegistrar.js";
import { createLogger } from "../util/Logger.js";
import type { BaseCommand } from "./BaseCommand.js";
import * as schema from "./DatabaseSchema.js";

const currentDirName = dirname(fileURLToPath(import.meta.url));
export class PakUstadz extends Client {
    public isProd = process.env.NODE_ENV === "production";
    public logger = createLogger("client", "id-ID", "shard", this.shard?.ids[0], !this.isProd);
    public commands = new Collection<string, BaseCommand>();
    public readonly sqlite = new Database(join(process.cwd(), "data", "database.db"));
    public readonly db = drizzle(this.sqlite, { schema });
    private readonly commandsRegistrar = new CommandsRegistrar(this, resolve(currentDirName, "..", "commands"));

    // public readonly fastings = new Collection<string, boolean>();
    // public readonly failed = new Set<Snowflake>();
    // public readonly nsfwLocker = new NSFWLocker(this);
    // public readonly imsakiyahClock = new ImsakiyahClock(this, resolve(currentDirName, "..", "imsakiyah"));

    public build(): void {
        this.on("ready", async () => {
            // Register slash commands
            await this.commandsRegistrar.register();

            // Prepare database
            await this.sqlite.pragma("journal_mode = WAL");

            // Init imsakiyahClock system
            // await this.imsakiyahClock.init();

            this.logger.info("Bot sudah ready dan online di Discord!");

            /*             // Delete guildsData from database if the bot kicked in it
            const deletedGuilds = await this.deleteKickedGuilds();
            if (deletedGuilds.length > 0) this.logger.info(deletedGuilds, "Saya telah dikeluarkan dari guild-guild dibawah ini, datanya akan dihapus:");
            await this.doActionOnEnabledGuilds({});

            // If Imsak and Iftar event from imsakiyahClock is emitted, then do the actions.
            this.imsakiyahClock.on("imsak", async (daerah: string) => {
                this.failed.clear();
                await this.doActionOnEnabledGuilds({ daerah, lock: true });
                this.logger.info(`${daerah.split("-").map(n => `${n.charAt(0).toUpperCase()}${n.slice(1)}`).join(" ")} Baru saja imsak.`);
            });
            this.imsakiyahClock.on("iftar", async (daerah: string) => {
                this.failed.clear();
                await this.doActionOnEnabledGuilds({ daerah, lock: false });
                this.logger.info(`${daerah.split("-").map(n => `${n.charAt(0).toUpperCase()}${n.slice(1)}`).join(" ")} Sudah berbuka puasa.`);
            }); */
        });

        this.on("interactionCreate", async interaction => {
            if (!interaction.isCommand() && !interaction.isAutocomplete()) return;

            if (interaction.isCommand() && interaction.channel?.type === ChannelType.DM) {
                await interaction.reply("Maaf, bot ini hanya bisa digunakan di server / guild saja.");
                return;
            }

            const command = this.commands.get(interaction.commandName);

            if (!command) return;

            await command.execute(interaction);
        });

        /*         this.on("guildDelete", async g => {
            const guild = await this.serverData.findFirst({ where: { serverId: g.id } });
            if (!guild) return;
            await this.serverData.delete({ where: { id: guild.id } });
            this.logger.info(`Saya telah dikeluarkan dari guild: ${g.name}, data untuk server tersebut terhapus.`);
        }); */

        this.on("warn", message => this.logger.warn(message));

        this.on("error", error => this.logger.error(error, "CLIENT_ERROR:"));

        this.on("rateLimit", ratelimitData => this.logger.warn(ratelimitData, "Bot mendapatkan ratelimit:"));

        this.on("debug", message => this.logger.debug(message));
    }

    public async start(): Promise<string> {
        return this.login(process.env.DISCORD_TOKEN);
    }

/*     private async doActionOnEnabledGuilds(option: Options): Promise<void> {
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
    } */
}
