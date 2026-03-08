self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {}

  const title = payload.title || "Podsjetnik za transfer"
  const options = {
    body: payload.body || "Vrijeme je za transfer.",
    data: {
      url: payload.url || "/",
    },
    badge: "/apple-touch-icon.png",
    icon: "/apple-touch-icon.png",
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const url = event.notification?.data?.url || "/"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.navigate(url)
          return client.focus()
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url)
      }

      return undefined
    })
  )
})
