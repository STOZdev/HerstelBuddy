import { generateKeyPairSync } from "node:crypto";

const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const privateJwk = privateKey.export({ format: "jwk" });
const publicJwk = publicKey.export({ format: "jwk" });
const publicBytes = Buffer.concat([Buffer.from([4]), Buffer.from(publicJwk.x, "base64url"), Buffer.from(publicJwk.y, "base64url")]);

console.log(`VAPID_PUBLIC_KEY=${publicBytes.toString("base64url")}`);
console.log(`VAPID_PRIVATE_KEY=${privateJwk.d}`);
console.log("VAPID_SUBJECT=mailto:beheerder@example.invalid");
