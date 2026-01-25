/**
 * Deeply serializes an object or array, converting all BigInt values to strings.
 * This is necessary for passing data between Server Components/Actions and Client Components in Next.js.
 */
export function deepSerialize<T>(data: T): T {
    if (data === null || data === undefined) return data;

    try {
        return JSON.parse(
            JSON.stringify(data, (key, value) => {
                if (typeof value === 'bigint') return value.toString();
                return value;
            })
        );
    } catch (error) {
        console.error("Deep serialization failed:", error);
        return [] as any; // Fallback to safe array if everything fails
    }
}
