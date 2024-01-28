import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction, Interaction } from "discord.js";
import type { PakUstadz } from "./PakUstadz.js";

export class BaseCommand {
    public meta = new SlashCommandBuilder();

    public constructor(public pakUstadz: PakUstadz) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public execute(ctx: CommandInteraction | Interaction): any {
        return undefined;
    }
}
