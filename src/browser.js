import { pickUpNewDate } from "./index.js";

const globalTarget = typeof window !== "undefined" ? window : globalThis;

if (typeof globalTarget.pickUpNewDate === "undefined") {
    globalTarget.pickUpNewDate = pickUpNewDate;
}

export { pickUpNewDate };
