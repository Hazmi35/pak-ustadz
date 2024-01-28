import { EventEmitter } from "node:events";
import type { PakUstadz } from "../structures/PakUstadz.js";

export class ImsakiyahClock extends EventEmitter {
    private isInitialized = false;
    public constructor(public pakUstadz: PakUstadz) { super(); }

    public async init(): Promise<void> {
        this.isInitialized = true;
        // await this.doClock();
        // setInterval(async () => this.doClock(), 1_000);
    }

    // This is promise because to control startup flow.
    // public async doClock(): Promise<void> {
    //     return new Promise(resolve => {
    //         if (!this.isInitialized) return;
    //         const now = new Date(Date.now());
    //         for (const [a, i] of this.pakUstadz.imsakiyah) {
    //             const today = i.find(i2 => i2.bulan === now.getMonth() && i2.tanggal === now.getDate());

    //             if (today === undefined) continue;

    //             if (now >= today.imsak && now < today.maghrib && this.pakUstadz.fastings.get(a) !== true) {
    //                 this.pakUstadz.fastings.set(a, true);
    //                 this.emit("imsak", a);
    //             }

    //             if (now >= today.maghrib && this.pakUstadz.fastings.get(a) !== false) {
    //                 this.pakUstadz.fastings.set(a, false);
    //                 this.emit("iftar", a);
    //             }
    //         }
    //         resolve();
    //     });
    // }
}

export type Imsakiyah = {
    bulan: number;
    tanggal: number;
    hari: number;
    imsak: Date;
    maghrib: Date;
};

