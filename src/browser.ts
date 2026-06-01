import { pickUpNewDate } from "./index.js";

declare global {
    interface Window {
        pickUpNewDate?: typeof pickUpNewDate;
    }
}

interface PickUpNewDateGlobal {
    pickUpNewDate?: typeof pickUpNewDate;
}

const globalTarget = (typeof window !== "undefined" ? window : globalThis) as PickUpNewDateGlobal;

if (typeof globalTarget.pickUpNewDate === "undefined") {
    globalTarget.pickUpNewDate = pickUpNewDate;
}

export { pickUpNewDate };
