/**
 * Deeply serializes an object or array, converting all BigInt values to strings.
 * This is necessary for passing data between Server Components/Actions and Client Components in Next.js.
 */
export function deepSerialize<T>(data: T): T {
    if (data === null || data === undefined) return data;

    try {
        // Simple but effective deep serialization for POJOs
        // converting BigInt to strings via replacer function
        return JSON.parse(
            JSON.stringify(data, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )
        );
    } catch (error) {
        console.error("Deep serialization failed:", error);

        // Fallback for objects with circular references or other issues
        if (Array.isArray(data)) {
            return data.map(item => deepSerialize(item)) as unknown as T;
        }

        if (typeof data === 'object') {
            const result: any = {};
            for (const [key, value] of Object.entries(data)) {
                result[key] = deepSerialize(value);
            }
            return result as T;
        }

        return data;
    }
}
