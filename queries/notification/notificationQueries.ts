import { apiFetch } from "@/api/base";
import { appendPagination, type Paginated, type PaginationParams } from "@/lib/pagination";

export type NotificationSeverity = "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";

export type NotificationCategory =
    | "MOSQUITO"
    | "SENSOR"
    | "DEVICE"
    | "ACCOUNT"
    | "RESEARCH"
    | "CLUSTER"
    | "SYSTEM";

export type Notification = {
    id: number;
    title: string;
    body: string;
    notification_type: string;
    severity: NotificationSeverity;
    category: NotificationCategory;
    payload: Record<string, unknown> | null;
    /** Lucide icon name hint from the backend (e.g. "battery-low"). */
    icon: string | null;
    /** FE route to open when the notification is clicked, e.g. "/devices/42". */
    action_url: string | null;
    cluster_id: number | null;
    device_id: number | null;
    read_at: string | null;
    archived_at: string | null;
    delivered_at: string | null;
    created_at: string;
    expires_at: string | null;
};

export type NotificationPreferences = {
    species_alerts: boolean;
    surge_alerts: boolean;
    environment_alerts: boolean;
    battery_alerts: boolean;
    offline_alerts: boolean;
    admin_alerts: boolean;
    researcher_alerts: boolean;
    email_enabled: boolean;
    push_enabled: boolean;
    in_app_enabled: boolean;
    // Personal thresholds (FR-18): null = use the system setting. Sending an
    // explicit null CLEARS a value — omitting the key leaves it unchanged.
    personal_temp_max: number | null;
    personal_humidity_max: number | null;
    personal_battery_min_v: number | null;
    personal_surge_threshold: number | null;
};

export type GetNotificationsFilters = {
    unread_only?: boolean;
    category?: NotificationCategory;
    severity?: NotificationSeverity;
    /** Fine-grained notification_type, e.g. "LOW_BATTERY". */
    type?: string;
    /** Server default is false (archived rows hidden). */
    archived?: boolean;
    search?: string;
    sort?: "newest" | "oldest";
};

export type PushSubscriptionRecord = {
    id: number;
    endpoint: string;
    provider?: string;
    browser?: string | null;
    platform?: string | null;
    device_name?: string | null;
    active?: boolean;
    created_at?: string;
};

export async function getNotifications(
    filters?: GetNotificationsFilters,
    pagination?: PaginationParams
): Promise<Paginated<Notification>> {
    const params = new URLSearchParams();
    if (typeof filters?.unread_only === "boolean") params.set("unread_only", String(filters.unread_only));
    if (filters?.category) params.set("category", filters.category);
    if (filters?.severity) params.set("severity", filters.severity);
    if (filters?.type) params.set("type", filters.type);
    if (typeof filters?.archived === "boolean") params.set("archived", String(filters.archived));
    if (filters?.search) params.set("search", filters.search);
    if (filters?.sort) params.set("sort", filters.sort);
    appendPagination(params, pagination);

    const query = params.toString();

    return apiFetch(`/notifications${query ? `?${query}` : ""}`, {
        method: "GET",
    });
}

export async function getUnreadCount(): Promise<{ count: number }> {
    return apiFetch("/notifications/unread-count", {
        method: "GET",
    });
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
    return apiFetch("/notifications/preferences", {
        method: "GET",
    });
}

export async function getPushPublicKey(): Promise<{ publicKey: string | null }> {
    return apiFetch("/push/public-key", {
        method: "GET",
    });
}

export async function getPushSubscriptions(): Promise<PushSubscriptionRecord[]> {
    return apiFetch("/push/subscriptions", {
        method: "GET",
    });
}

// ── Global alert thresholds (SUPER_ADMIN, FR-18 Phase A) ─────────────────────

export type AlertSettingsPayload = {
  values: Record<string, number>;
  bounds: Record<string, [number, number]>;
};

export async function getAlertSettings(): Promise<AlertSettingsPayload> {
  return apiFetch("/notifications/alert-settings");
}
