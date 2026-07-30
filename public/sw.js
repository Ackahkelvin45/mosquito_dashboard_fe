/* global self */
// Service worker for web push notifications. Registered by
// hooks/usePushSubscription.ts when the user enables the Push channel.

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Notification", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Mosquito Dashboard";
  const options = {
    body: data.body || "",
    icon: "/images/logo.png",
    data: { action_url: data.action_url || "/notifications" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = (event.notification.data && event.notification.data.action_url) || "/notifications";
  // Only follow same-app relative paths — openWindow would happily navigate to
  // an absolute external URL, and "//host" is protocol-relative (also external).
  const url = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/notifications";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Focus an existing tab already on the target route, otherwise open one.
      for (const client of windowClients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
