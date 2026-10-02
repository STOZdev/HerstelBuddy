const serviceWorker = `
const CACHE = "recoverybuddy-static-v2";
const VAPID_PUBLIC_KEY = ${JSON.stringify(process.env.VAPID_PUBLIC_KEY ?? "")};
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const isStatic = url.pathname.startsWith("/_next/static/") || url.pathname === "/icon.svg";
  if (!isStatic) return;
  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
  );
});
self.addEventListener("push", event => {
  let payload = { title: "Een moment met je herstelbuddy", body: "Open RecoveryBuddy voor een klein herstelmoment.", tag: "recoverybuddy-reminder" };
  try { payload = { ...payload, ...event.data.json() }; } catch { /* generic fallback only */ }
  event.waitUntil(self.registration.showNotification(payload.title, {
    body: payload.body,
    tag: payload.tag,
    icon: "/apple-icon",
    badge: "/apple-icon",
    data: { url: "/" },
  }));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
    const existing = clientList.find(client => new URL(client.url).origin === self.location.origin);
    return existing ? existing.focus() : clients.openWindow(event.notification.data?.url || "/");
  }));
});
self.addEventListener("pushsubscriptionchange", event => {
  if (!VAPID_PUBLIC_KEY) return;
  const decodeKey = value => {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
    return Uint8Array.from(bytes, character => character.charCodeAt(0));
  };
  event.waitUntil(self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeKey(VAPID_PUBLIC_KEY) })
    .then(subscription => fetch("/api/notifications/subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription) }))
    .catch(() => undefined));
});
`;

export function GET() {
  return new Response(serviceWorker, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
