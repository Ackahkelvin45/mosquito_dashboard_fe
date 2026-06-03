// Shared helpers for the paginated list envelope the API now returns for every
// list endpoint: { items, total, page, page_size, total_pages }.

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type PaginationParams = {
  page?: number;
  page_size?: number;
};

export const DEFAULT_PAGE_SIZE = 20;
// API caps page_size at 100; used where we need "all" items (maps, dropdowns).
export const MAX_PAGE_SIZE = 100;

/**
 * Read the item array from a response regardless of shape. Supports the new
 * paginated envelope ({ items }), the older ({ data }) shape, and a bare array,
 * so callers stay resilient if an endpoint lags the migration.
 */
export function extractItems<T = unknown>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

/** Normalize any list response into a full Paginated<T> envelope. */
export function toPaginated<T = unknown>(res: unknown): Paginated<T> {
  const items = extractItems<T>(res);
  const obj = (res && typeof res === "object" ? res : {}) as Record<string, unknown>;
  const total = typeof obj.total === "number" ? obj.total : items.length;
  const page = typeof obj.page === "number" ? obj.page : 1;
  const page_size = typeof obj.page_size === "number" ? obj.page_size : items.length || DEFAULT_PAGE_SIZE;
  const total_pages =
    typeof obj.total_pages === "number"
      ? obj.total_pages
      : page_size > 0
        ? Math.max(1, Math.ceil(total / page_size))
        : 1;
  return { items, total, page, page_size, total_pages };
}

/** Append page / page_size query params when provided. */
export function appendPagination(params: URLSearchParams, pagination?: PaginationParams): void {
  if (typeof pagination?.page === "number") params.set("page", String(pagination.page));
  if (typeof pagination?.page_size === "number") params.set("page_size", String(pagination.page_size));
}

/** True when the response carries server-side pagination metadata. */
function hasServerEnvelope(res: unknown): boolean {
  if (!res || typeof res !== "object" || Array.isArray(res)) return false;
  const obj = res as Record<string, unknown>;
  return typeof obj.total === "number" && (typeof obj.total_pages === "number" || typeof obj.page === "number");
}

/**
 * Resolve a list response into a Paginated<T> for the requested page.
 *
 * - If the server already paginated (envelope present), trust its envelope.
 * - Otherwise (the endpoint still returns a bare array), treat the whole array
 *   as the full dataset and slice it client-side. This keeps the pagination
 *   control working before the backend pagination is live.
 */
export function resolvePage<T = unknown>(res: unknown, page: number, pageSize: number): Paginated<T> {
  if (hasServerEnvelope(res)) return toPaginated<T>(res);

  const all = extractItems<T>(res);
  const total = all.length;
  const total_pages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const safePage = Math.min(Math.max(1, page), total_pages);
  const start = (safePage - 1) * pageSize;
  return {
    items: all.slice(start, start + pageSize),
    total,
    page: safePage,
    page_size: pageSize,
    total_pages,
  };
}
