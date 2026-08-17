import fs from "fs";
import { convertOpportunity } from "./convertOpportunity.js";

const commonHeart = JSON.parse(
    fs.readFileSync("./bot/output/common-heart.json", "utf8")
);

const matthews = JSON.parse(
    fs.readFileSync("./bot/output/matthews-help-center.json", "utf8")
);

console.log("\n========== COMMON HEART ==========\n");

console.log(
    JSON.stringify(
        convertOpportunity(commonHeart, 9),
        null,
        2
    )
);

console.log("\n========== MATTHEWS HELP CENTER ==========\n");

console.log(
    JSON.stringify(
        convertOpportunity(matthews, 1),
        null,
        2
    )
);