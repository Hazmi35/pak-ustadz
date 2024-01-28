import { EventEmitter } from "node:events";
import { setTimeout } from "node:timers/promises";
import { Collection } from "discord.js";
import { DateTime } from "luxon";
import type { Imsakiyah, JadwalImsakiyah } from "./Imsakiyah.js";

export class ImsakiyahClock extends EventEmitter {
    private imsakiyah = new Collection<string, JadwalImsakiyah>();
    public constructor(public imsakUtil: Imsakiyah) { super(); }

    public async init(): Promise<void> {
        for await (const state of await this.imsakUtil.getStates()) {
            for await (const city of await this.imsakUtil.getCities(state.id)) {
                const imsakiyah = await this.imsakUtil.getImsakiyah(state.id, city.id);
                this.imsakiyah.set(`${state.name}:${city.name}`, imsakiyah);
            }
        }

        console.log(this.imsakiyah);

        // await this.doClock();
        // setInterval(async () => this.doClock(), 1_000);
    }

    public async doClock(): Promise<void> {
        const now = DateTime.now();
    }
}
