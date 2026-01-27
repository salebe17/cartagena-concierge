import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function sanitizeInput(input: string): string {
    if (!input) return "";
    // Remove HTML tags
    return input.replace(/<\/?[^>]+(>|$)/g, "").trim();
}
