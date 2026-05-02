export function normalizeUsername(u: string): string {
    return u.replace(/[^a-zA-Z0-9\-_]/g, '').trim()
}