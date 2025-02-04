/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Sanitizes the given input by ensuring it conforms to the provided default structure.
 * If the input is an array, it returns the array if it's not empty; otherwise, it returns the defaults.
 * If the input is an object, it recursively sanitizes each key based on the defaults.
 * For primitive values, it returns the input if defined, otherwise the default value.
 *
 * @template T - The type of the sanitized output.
 * @param {unknown} input - The input value to be sanitized. It can be of any type (array, object, or primitive).
 * @param {Partial<T>} defaults - The default values to fall back on if the input is invalid or missing properties.
 * @returns {T} The sanitized value that conforms to the structure of the provided defaults.
 *
 * @example
 * // For an object input
 * sanitizeInput({ name: "John" }, { name: "Default", age: 30 });
 * // Returns: { name: "John", age: 30 }
 *
 * @example
 * // For an array input
 * sanitizeInput([], [1, 2, 3]);
 * // Returns: [1, 2, 3]
 *
 * @example
 * // For a primitive input
 * sanitizeInput(undefined, "Default Value");
 * // Returns: "Default Value"
 */
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
