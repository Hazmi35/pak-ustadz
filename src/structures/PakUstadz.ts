import { dirname, resolve, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import type { Guild } from "discord.js";
import { ChannelType, Client } from "discord.js";
import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createLogger } from "../util/Logger.js";
import { CommandsRegistrar } from "./CommandsRegistrar.js";
import * as schema from "./DatabaseSchema.js";
import { Imsakiyah } from "./Imsakiyah.js";
import { ImsakiyahClock } from "./ImsakiyahClock.js";

const currentDirName = dirname(fileURLToPath(import.meta.url));
export class PakUstadz extends Client {
    public isProd = process.env.NODE_ENV === "production";
    public logger = createLogger("client", "id-ID", "shard", this.shard?.ids[0], !this.isProd);

    // Commands Registrar
    private readonly commands = new CommandsRegistrar(this, resolve(currentDirName, "..", "commands"));

    // Database
    public readonly sqlite = new Database(join(process.cwd(), "data", "database.db"));
    public readonly db = drizzle(this.sqlite, { schema });

    // Imsakiyah
    public readonly imsakiyah = new Imsakiyah();
    public readonly imsakiyahClock = new ImsakiyahClock(this.imsakiyah);

    // public readonly fastings = new Collection<string, boolean>();
    // public readonly failed = new Set<Snowflake>();
    // public readonly imsakiyahClock = new ImsakiyahClock(this);

    // public readonly nsfwLocker = new NSFWLocker(this);

    public build(): void {
        this.on("ready", async () => {
            // Register slash commands
            await this.commands.register();

            // Prepare database
            migrate(this.db, { migrationsFolder: "drizzle" });
            await this.sqlite.pragma("journal_mode = WAL");

            // Init Imsakiyah util
            await this.imsakiyah.init();
            await this.imsakiyahClock.init();

            this.logger.info("Bot sudah ready dan online di Discord!");

            // Delete guildsData from database if the bot kicked in it
            const deletedGuilds = await this.deleteKickedGuilds();
            if (deletedGuilds.length > 0) this.logger.info(deletedGuilds, "Saya telah dikeluarkan dari guild-guild dibawah ini, datanya akan dihapus:");

            /* await this.doActionOnEnabledGuilds({});

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

        this.on("guildDelete", async guild => {
            const guildData = await this.db
                .select({ id: schema.server.id })
                .from(schema.server)
                .where(eq(schema.server.id, guild.id))
                .execute();

            if (guildData.length === 0) return;

            await this.db
                .delete(schema.server)
                .where(inArray(schema.server.id, guildData.map(a => a.id)))
                .execute();

            this.logger.info(`Saya telah dikeluarkan dari guild: ${guild.name}, data untuk server tersebut terhapus.`);
        });

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
    }*/

    private async getEnabledGuilds(): Promise<Guild[]> {
        const enabledGuilds = await this.db
            .select({ id: schema.server.id })
            .from(schema.server)
            .where(eq(schema.server.enabled, true))
            .execute();

        return enabledGuilds.map<Guild | null>(a => this.guilds.resolve(a.id))
            .filter(b => b !== null) as Guild[];
    }

    private async deleteKickedGuilds(): Promise<{ id: string; }[]> {
        const deletedGuilds = await this.db
            .select({ id: schema.server.id })
            .from(schema.server)
            .where(inArray(schema.server.id, this.guilds.cache.map(a => a.id)))
            .execute();

        if (deletedGuilds.length === 0) return [];

        await this.db
            .delete(schema.server)
            .where(inArray(schema.server.id, deletedGuilds.map(b => b.id)))
            .execute();

        return deletedGuilds;
    }
}
