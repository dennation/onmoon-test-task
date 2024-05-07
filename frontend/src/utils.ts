import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function decodeJWTPayload<T extends any>(token: string): T {
    const parts = token.split(".")

    if (parts.length !== 3) {
        throw new Error("Invalid JWT token")
    }

    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const payload = atob(payloadBase64)
    const payloadData = JSON.parse(payload)

    return payloadData
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
