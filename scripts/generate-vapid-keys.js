#!/usr/bin/env node

const webpush = require("web-push")

console.log("Generišem VAPID ključeve za Web Push...\n")

const vapidKeys = webpush.generateVAPIDKeys()

console.log("VAPID_PUBLIC_KEY:")
console.log(vapidKeys.publicKey)
console.log("\nVAPID_PRIVATE_KEY:")
console.log(vapidKeys.privateKey)
console.log("\nKopiraj ove vrijednosti u .env fajl.")
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY mora biti isti kao VAPID_PUBLIC_KEY.\n")
