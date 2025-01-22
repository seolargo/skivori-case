/* eslint-disable @typescript-eslint/no-explicit-any */

export const sanitizeInput = <T>(input: unknown, defaults: Partial<T>): T => {
    if (Array.isArray(input)) {
        return input.length ? (input as T) : (defaults as T);
    }

    if (typeof input === "object" && input !== null) {
        return Object.entries(defaults).reduce((acc, [key, value]) => {
            (acc as Record<string, any>)[key] = sanitizeInput(
                (input as Record<string, unknown>)[key],
                value as Partial<T>
            );

            return acc;
        }, {} as Record<string, any>) as T;
    }

    return (input ?? defaults) as T;
};

export default sanitizeInput;