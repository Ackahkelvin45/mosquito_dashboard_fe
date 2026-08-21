import { apiFetch } from "@/api/base";
import type {
    Notification,
    NotificationPreferences,
    PushSubscriptionRecord,
} from "@/queries/notification/notificationQueries";

export type UpdateNotificationPreferencesPayload = Partial<NotificationPreferences>;

export type CreatePushSubscriptionPayload = {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    provider?: "WEBPUSH";
    browser?: string;
    platform?: string;
    device_name?: string;
};

export async function markNotificationRead(id: number): Promise<Notification> {
    try {
        const res = await apiFetch(`/notifications/${id}/read`, {
            method: "PATCH",
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function markNotificationUnread(id: number): Promise<Notification> {
    try {
        const res = await apiFetch(`/notifications/${id}/unread`, {
            method: "PATCH",
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
    try {
        const res = await apiFetch("/notifications/read-all", {
            method: "PATCH",
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function archiveNotification(id: number): Promise<Notification> {
    try {
        const res = await apiFetch(`/notifications/${id}/archive`, {
            method: "PATCH",
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function unarchiveNotification(id: number): Promise<Notification> {
    try {
        const res = await apiFetch(`/notifications/${id}/unarchive`, {
            method: "PATCH",
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function deleteNotification(id: number): Promise<null> {
    try {
        const res = await apiFetch(`/notifications/${id}`, {
            method: "DELETE",
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function updateNotificationPreferences(
    data: UpdateNotificationPreferencesPayload
): Promise<NotificationPreferences> {
    try {
        const res = await apiFetch("/notifications/preferences", {
            method: "PUT",
            body: JSON.stringify(data),
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function createPushSubscription(
    data: CreatePushSubscriptionPayload
): Promise<PushSubscriptionRecord> {
    try {
        const res = await apiFetch("/push/subscriptions", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function deletePushSubscription(endpoint: string): Promise<null> {
    try {
        const res = await apiFetch("/push/subscriptions", {
            method: "DELETE",
            body: JSON.stringify({ endpoint }),
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

/** SUPER_ADMIN: upsert global alert thresholds — takes effect immediately. */
export async function updateAlertSettings(changes: Record<string, number>) {
  return apiFetch("/notifications/alert-settings", {
    method: "PUT",
    body: JSON.stringify(changes),
  });
}
