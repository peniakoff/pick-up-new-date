import { pickUpNewDate } from "./index.js";

const globalTarget = typeof window !== "undefined" ? window : globalThis;

globalTarget.pickUpNewDate = pickUpNewDate;

export { pickUpNewDate };
export default pickUpNewDate;
