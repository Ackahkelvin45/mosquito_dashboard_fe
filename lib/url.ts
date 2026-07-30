// Notification action_url values come from the backend, but navigation from a
// notification click must never become an open redirect if a bad value slips
// through: only same-app relative paths are followed ("//host" is protocol-
// relative and would leave the app, so it is rejected too).
export function safeUrl(url: string | null | undefined): string {
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/notifications";
}
