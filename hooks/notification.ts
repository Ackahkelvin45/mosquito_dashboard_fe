import {
    keepPreviousData,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
    type QueryClient,
} from "@tanstack/react-query"
import {
    getNotificationPreferences,
    getNotifications,
    getPushSubscriptions,
    getUnreadCount,
    type GetNotificationsFilters,
    type Notification,
    type NotificationPreferences,
} from "@/queries/notification/notificationQueries"
import {
    archiveNotification,
    deleteNotification,
    markAllNotificationsRead,
    markNotificationRead,
    markNotificationUnread,
    unarchiveNotification,
    updateNotificationPreferences,
    type UpdateNotificationPreferencesPayload,
} from "@/actions/notificationMutation"
import { DEFAULT_PAGE_SIZE, type PaginationParams } from "@/lib/pagination"

// ---------------------------------------------------------------------------
// Cache helpers
//
// Notification lists live in two cache shapes: the plain Paginated<T> envelope
// (["notifications", filters, pagination]) and the useInfiniteQuery shape
// ({ pages: Paginated<T>[] }, ["notifications", "infinite", filters]). The
// helpers below apply one item-level transform to every cached list of either
// shape (like hooks/device.ts useDeleteDevice does for a single shape), leaving
// non-list entries under the same prefix (e.g. the unread-count) untouched.
// ---------------------------------------------------------------------------

function transformListData(
    oldData: unknown,
    transform: (items: Notification[]) => Notification[]
): unknown {
    if (!oldData) return oldData
    if (Array.isArray(oldData)) return transform(oldData as Notification[])
    if (typeof oldData === "object") {
        const record = oldData as Record<string, unknown>
        if (Array.isArray(record.items)) {
            return { ...record, items: transform(record.items as Notification[]) }
        }
        // useInfiniteQuery shape: { pages: Paginated<Notification>[], pageParams }.
        if (Array.isArray(record.pages)) {
            return {
                ...record,
                pages: (record.pages as unknown[]).map((page) => transformListData(page, transform)),
            }
        }
    }
    return oldData
}

function patchNotificationLists(
    queryClient: QueryClient,
    transform: (items: Notification[]) => Notification[]
): void {
    queryClient.setQueriesData({ queryKey: ["notifications"] }, (oldData: unknown) =>
        transformListData(oldData, transform)
    )
}

function adjustUnreadCount(queryClient: QueryClient, delta: number | "zero"): void {
    queryClient.setQueryData(["notifications", "unread-count"], (oldData: unknown) => {
        if (delta === "zero") return { count: 0 }
        if (oldData && typeof oldData === "object" && typeof (oldData as { count?: unknown }).count === "number") {
            return { count: Math.max(0, (oldData as { count: number }).count + delta) }
        }
        return oldData
    })
}

function invalidateNotifications(queryClient: QueryClient): void {
    queryClient.invalidateQueries({ queryKey: ["notifications"] })
    queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const useUnreadCount = () => {
    return useQuery({
        queryKey: ["notifications", "unread-count"],
        queryFn: getUnreadCount,
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    })
}

/** Plain paged list — used by the bell dropdown (10 latest). */
export const useNotifications = (
    pagination?: PaginationParams,
    filters?: GetNotificationsFilters,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ["notifications", filters ?? null, pagination ?? null],
        queryFn: () => getNotifications(filters, pagination),
        placeholderData: keepPreviousData,
        enabled: options?.enabled ?? true,
    })
}

/** Infinite list over `page` — used by the notification center. */
export const useNotificationsInfinite = (filters?: GetNotificationsFilters) => {
    return useInfiniteQuery({
        queryKey: ["notifications", "infinite", filters ?? null],
        queryFn: ({ pageParam }) =>
            getNotifications(filters, { page: pageParam, page_size: DEFAULT_PAGE_SIZE }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    })
}

export const useNotificationPreferences = () => {
    return useQuery({
        queryKey: ["notification-preferences"],
        queryFn: getNotificationPreferences,
    })
}

export const usePushSubscriptions = () => {
    return useQuery({
        queryKey: ["push-subscriptions"],
        queryFn: getPushSubscriptions,
    })
}

// ---------------------------------------------------------------------------
// Mutations — each optimistically patches the cached lists, then invalidates
// so the server-filtered lists (unread/archived tabs) settle to the truth.
// ---------------------------------------------------------------------------

export const useMarkRead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => markNotificationRead(id),
        onMutate: (id) => {
            let wasUnread = false
            patchNotificationLists(queryClient, (items) =>
                items.map((n) => {
                    if (n.id !== id) return n
                    if (!n.read_at) wasUnread = true
                    return { ...n, read_at: n.read_at ?? new Date().toISOString() }
                })
            )
            if (wasUnread) adjustUnreadCount(queryClient, -1)
        },
        onSettled: () => invalidateNotifications(queryClient),
    })
}

export const useMarkUnread = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => markNotificationUnread(id),
        onMutate: (id) => {
            let wasRead = false
            patchNotificationLists(queryClient, (items) =>
                items.map((n) => {
                    if (n.id !== id) return n
                    if (n.read_at) wasRead = true
                    return { ...n, read_at: null }
                })
            )
            if (wasRead) adjustUnreadCount(queryClient, +1)
        },
        onSettled: () => invalidateNotifications(queryClient),
    })
}

export const useMarkAllRead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => markAllNotificationsRead(),
        onMutate: () => {
            patchNotificationLists(queryClient, (items) =>
                items.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() }))
            )
            adjustUnreadCount(queryClient, "zero")
        },
        onSettled: () => invalidateNotifications(queryClient),
    })
}

export const useArchive = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => archiveNotification(id),
        onMutate: (id) => {
            patchNotificationLists(queryClient, (items) =>
                items.map((n) =>
                    n.id === id ? { ...n, archived_at: n.archived_at ?? new Date().toISOString() } : n
                )
            )
        },
        onSettled: () => invalidateNotifications(queryClient),
    })
}

export const useUnarchive = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => unarchiveNotification(id),
        onMutate: (id) => {
            patchNotificationLists(queryClient, (items) =>
                items.map((n) => (n.id === id ? { ...n, archived_at: null } : n))
            )
        },
        onSettled: () => invalidateNotifications(queryClient),
    })
}

export const useDeleteNotification = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => deleteNotification(id),
        onMutate: (id) => {
            let removedUnread = false
            patchNotificationLists(queryClient, (items) =>
                items.filter((n) => {
                    if (n.id !== id) return true
                    if (!n.read_at) removedUnread = true
                    return false
                })
            )
            if (removedUnread) adjustUnreadCount(queryClient, -1)
        },
        onSettled: () => invalidateNotifications(queryClient),
    })
}

export const useUpdatePreferences = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: UpdateNotificationPreferencesPayload) =>
            updateNotificationPreferences(data),
        onMutate: (data) => {
            queryClient.setQueryData(["notification-preferences"], (oldData: unknown) => {
                if (!oldData || typeof oldData !== "object") return oldData
                return { ...(oldData as NotificationPreferences), ...data }
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["notification-preferences"] })
        },
    })
}
