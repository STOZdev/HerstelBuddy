import "server-only";

import { createECDH, createPrivateKey, createSign, hkdfSync, randomBytes, createCipheriv } from "node:crypto";
import type { StoredPushSubscription } from "./types";

type VapidConfiguration = { publicKey: string; privateKey: string; subject: string };

function base64Url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url");
}

export function vapidConfiguration(): VapidConfiguration | null {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return null;
  const publicBytes = decodeBase64Url(publicKey);
  const privateBytes = decodeBase64Url(privateKey);
  if (publicBytes.length !== 65 || publicBytes[0] !== 4 || privateBytes.length !== 32) return null;
  return { publicKey, privateKey, subject };
}

function hkdf(salt: Buffer, input: Buffer, info: Buffer, length: number) {
  return Buffer.from(hkdfSync("sha256", input, salt, info, length));
}

function encryptPayload(subscription: StoredPushSubscription, payload: string) {
  const recipientPublicKey = decodeBase64Url(subscription.keys.p256dh);
  const authSecret = decodeBase64Url(subscription.keys.auth);
  if (recipientPublicKey.length !== 65 || recipientPublicKey[0] !== 4 || authSecret.length < 16) {
    throw new Error("INVALID_PUSH_SUBSCRIPTION_KEYS");
  }

  const sender = createECDH("prime256v1");
  sender.generateKeys();
  const sharedSecret = sender.computeSecret(recipientPublicKey);
  const ikm = hkdf(authSecret, sharedSecret, Buffer.concat([
    Buffer.from("WebPush: info\0", "utf8"), recipientPublicKey,
  ]), 32);
  const salt = randomBytes(16);
  const contentEncryptionKey = hkdf(salt, ikm, Buffer.from("Content-Encoding: aes128gcm\0"), 16);
  const nonce = hkdf(salt, ikm, Buffer.from("Content-Encoding: nonce\0"), 12);
  const cipher = createCipheriv("aes-128-gcm", contentEncryptionKey, nonce);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(`${payload}\0`, "utf8")), cipher.final()]);
  const record = Buffer.concat([encrypted, cipher.getAuthTag()]);
  const publicKey = sender.getPublicKey();
  return Buffer.concat([salt, Buffer.from([0, 0, 16, 0, publicKey.length]), publicKey, record]);
}

function vapidJwt(endpoint: string, configuration: VapidConfiguration) {
  const audience = new URL(endpoint).origin;
  const publicKey = decodeBase64Url(configuration.publicKey);
  const privateKey = decodeBase64Url(configuration.privateKey);
  const header = base64Url(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const payload = base64Url(JSON.stringify({ aud: audience, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12, sub: configuration.subject }));
  const signer = createSign("SHA256");
  signer.update(`${header}.${payload}`);
  signer.end();
  const key = createPrivateKey({ key: {
    kty: "EC", crv: "P-256", d: base64Url(privateKey),
    x: base64Url(publicKey.subarray(1, 33)), y: base64Url(publicKey.subarray(33, 65)),
  }, format: "jwk" });
  const signature = signer.sign({ key, dsaEncoding: "ieee-p1363" });
  return `${header}.${payload}.${base64Url(signature)}`;
}

export async function sendWebPush(subscription: StoredPushSubscription, payload: { title: string; body: string; tag: string }) {
  const configuration = vapidConfiguration();
  if (!configuration) throw new Error("PUSH_NOT_CONFIGURED");
  const endpoint = new URL(subscription.endpoint);
  if (endpoint.protocol !== "https:") throw new Error("INVALID_PUSH_ENDPOINT");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      "TTL": "3600",
      "Urgency": "normal",
      "Authorization": `vapid t=${vapidJwt(subscription.endpoint, configuration)}, k=${configuration.publicKey}`,
    },
    body: encryptPayload(subscription, JSON.stringify(payload)),
  });
  return { ok: response.ok, status: response.status };
}
