"use client"

import { useCallback, useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getPushPublicKey } from "@/queries/notification/notificationQueries"
import { createPushSubscription, deletePushSubscription } from "@/actions/notificationMutation"

// VAPID keys arrive base64url-encoded; PushManager.subscribe wants raw bytes.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; i += 1) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

function detectBrowser(): string {
    const ua = navigator.userAgent
    if (/edg\//i.test(ua)) return "Edge"
    if (/firefox|fxios/i.test(ua)) return "Firefox"
    if (/chrome|crios/i.test(ua)) return "Chrome"
    if (/safari/i.test(ua)) return "Safari"
    return "Other"
}

export type PushPermission = NotificationPermission | "unsupported"

/**
 * Web-push registration flow. `subscribe` registers the service worker,
 * fetches the server VAPID key, subscribes the browser and stores the
 * subscription on the backend; `unsubscribe` reverses both sides.
 *
 * Everything is guarded for SSR and non-secure contexts: `supported` is false
 * until the browser confirms service workers + PushManager are available.
 */
export function usePushSubscription() {
    const queryClient = useQueryClient()

    // Dashboard pages only render client-side (the layout gates on store
    // hydration), so these initializers run in the browser; the typeof window
    // guard keeps them safe anywhere else.
    const [supported] = useState<boolean>(
        () =>
            typeof window !== "undefined" &&
            "serviceWorker" in navigator &&
            "PushManager" in window &&
            window.isSecureContext
    )
    const [permission, setPermission] = useState<PushPermission>(() =>
        typeof window !== "undefined" && "Notification" in window
            ? Notification.permission
            : "unsupported"
    )
    const [enabled, setEnabled] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Reflect an already-registered subscription (e.g. enabled on a previous visit).
    useEffect(() => {
        if (!supported) return
        let cancelled = false
        navigator.serviceWorker
            .getRegistration("/sw.js")
            .then(async (registration) => {
                const subscription = await registration?.pushManager.getSubscription()
                if (!cancelled) setEnabled(Boolean(subscription))
            })
            .catch(() => {
                /* no registration yet — leave disabled */
            })
        return () => {
            cancelled = true
        }
    }, [supported])

    const subscribe = useCallback(async (): Promise<boolean> => {
        if (!supported) {
            setError("Push notifications are not supported in this browser.")
            return false
        }
        setLoading(true)
        setError(null)
        try {
            const registration = await navigator.serviceWorker.register("/sw.js")

            const { publicKey } = await getPushPublicKey()
            if (!publicKey) {
                setError("Push is not configured on the server")
                return false
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
            })

            if ("Notification" in window) setPermission(Notification.permission)

            const json = subscription.toJSON()
            const p256dh = json.keys?.p256dh
            const auth = json.keys?.auth
            if (!json.endpoint || !p256dh || !auth) {
                await subscription.unsubscribe().catch(() => {})
                setError("The browser returned an incomplete push subscription.")
                return false
            }

            await createPushSubscription({
                endpoint: json.endpoint,
                keys: { p256dh, auth },
                provider: "WEBPUSH",
                browser: detectBrowser(),
                platform: navigator.platform || undefined,
            })

            setEnabled(true)
            queryClient.invalidateQueries({ queryKey: ["push-subscriptions"] })
            return true
        } catch (err) {
            if ("Notification" in window) setPermission(Notification.permission)
            if ("Notification" in window && Notification.permission === "denied") {
                setError("Notifications are blocked in your browser settings.")
            } else {
                setError(err instanceof Error ? err.message : "Could not enable push notifications.")
            }
            console.error(err)
            return false
        } finally {
            setLoading(false)
        }
    }, [supported, queryClient])

    const unsubscribe = useCallback(async (): Promise<boolean> => {
        if (!supported) return true
        setLoading(true)
        setError(null)
        try {
            const registration = await navigator.serviceWorker.getRegistration("/sw.js")
            const subscription = await registration?.pushManager.getSubscription()
            if (subscription) {
                const endpoint = subscription.endpoint
                await subscription.unsubscribe().catch(() => {})
                // DELETE is idempotent server-side; a failure here still leaves
                // the browser unsubscribed, which is the user-visible state.
                await deletePushSubscription(endpoint).catch(() => {})
            }
            setEnabled(false)
            queryClient.invalidateQueries({ queryKey: ["push-subscriptions"] })
            return true
        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : "Could not disable push notifications.")
            return false
        } finally {
            setLoading(false)
        }
    }, [supported, queryClient])

    return { supported, permission, enabled, subscribe, unsubscribe, loading, error }
}
