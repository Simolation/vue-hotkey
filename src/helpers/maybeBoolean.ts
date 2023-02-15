export type MaybeBoolean = boolean | string;

/**
 * Return a boolean from a either boolean or string
 * @param value The value to convert
 * @returns The boolean value
 */
export const useMaybeBoolean = (value: MaybeBoolean) =>
  typeof value === "string" ? value === "true" : value;
