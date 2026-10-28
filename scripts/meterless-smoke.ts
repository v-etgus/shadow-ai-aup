import { meterlessChat, meterlessHealth } from "../src/meterless.ts";

const h = await meterlessHealth();
console.log("health:", h);
if (h !== "online") process.exit(1);
const r = await meterlessChat("Reply with one sentence confirming Meterless connection works.");
console.log("model:", r.model);
console.log("text:", r.text);