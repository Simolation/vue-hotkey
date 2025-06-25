// Platform detection
export const isMacOs = /mac/i.test(
  // @ts-expect-error: https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/platform
  navigator.platform ?? navigator.userAgentData?.platform ?? ""
);

// Common modifier key constants
const MODIFIER_KEYS = {
  CTRL: "ctrl",
  SHIFT: "shift", 
  META: "meta",
  ALT: "alt",
  PRIMARY: "primary",
  SECONDARY: "secondary"
} as const;

/**
 * Mapping table for special keys to avoid multiple if statements
 */
const KEY_MAPPINGS = new Map([
  ["ArrowUp", "arrowup"],
  ["ArrowLeft", "arrowleft"], 
  ["ArrowRight", "arrowright"],
  ["ArrowDown", "arrowdown"],
  ["AltGraph", "altgraph"],
  ["Escape", "esc"],
  ["Enter", "enter"],
  ["Tab", "tab"],
  [" ", "space"],
  ["PageUp", "pageup"],
  ["PageDown", "pagedown"],
  ["Home", "home"],
  ["End", "end"],
  ["Delete", "del"],
  ["Backspace", "backspace"],
  ["Insert", "insert"],
  ["NumLock", "numlock"],
  ["CapsLock", "capslock"],
  ["Pause", "pause"],
  ["ContextMenu", "contextmenu"],
  ["ScrollLock", "scrolllock"],
  ["BrowserHome", "browserhome"],
  ["MediaSelect", "mediaselect"]
]);

/**
 * Transform the keyboard event to a hotkey string
 * @param eKey The keyboard event
 * @returns The hotkey string
 *
 * @example
 * ```ts
 * const hotkey = createShortcutIndex(eKey);
 * // hotkey = "ctrl+shift+b"
 * ```
 *
 * @source https://github.com/iFgR/vue-shortkey/blob/55d802ea305cadcc2ea970b55a3b8b86c7b44c05/src/index.js#L81
 */
export const buildHotkeyIndexFromEvent = (
  eKey: KeyboardEvent,
  asArray: boolean = false
): string | string[] => {
  const keys: string[] = [];
  
  // Handle modifier keys with platform awareness
  if (eKey.key === "Meta" || eKey.metaKey) {
    keys.push(isMacOs ? MODIFIER_KEYS.PRIMARY : MODIFIER_KEYS.META);
  }
  if (eKey.key === "Control" || eKey.ctrlKey) {
    keys.push(isMacOs ? MODIFIER_KEYS.SECONDARY : MODIFIER_KEYS.PRIMARY);
  }
  if (eKey.key === "Alt" || eKey.altKey) {
    keys.push(isMacOs ? MODIFIER_KEYS.ALT : MODIFIER_KEYS.SECONDARY);
  }
  if (eKey.key === "Shift" || eKey.shiftKey) {
    keys.push(MODIFIER_KEYS.SHIFT);
  }

  // Use lookup table for special keys
  const mappedKey = KEY_MAPPINGS.get(eKey.key);
  if (mappedKey) {
    keys.push(mappedKey);
  } else if (
    // Handle regular characters and function keys
    (eKey.key && eKey.key !== " " && eKey.key.length === 1) ||
    /F\d{1,2}|\//g.test(eKey.key)
  ) {
    keys.push(eKey.key.toLowerCase());
  }

  return asArray ? keys : keys.join("+");
};

export const buildHotkeyIndexFromString = (pKey: string[]): string => {
  // Replace primary key actions
  pKey = platformSpecificHotkeys(pKey);

  // Build key string
  const keys: any = {};
  keys.metaKey = pKey.includes(MODIFIER_KEYS.META);
  keys.ctrlKey = pKey.includes(MODIFIER_KEYS.CTRL);
  keys.altKey = pKey.includes(MODIFIER_KEYS.ALT);
  keys.shiftKey = pKey.includes(MODIFIER_KEYS.SHIFT);
  let indexedKeys: string[] = buildHotkeyIndexFromEvent(keys, true) as string[];
  const vKey = pKey.filter(
    (item) => ![MODIFIER_KEYS.CTRL, MODIFIER_KEYS.SHIFT, MODIFIER_KEYS.META, MODIFIER_KEYS.ALT].includes(item as any)
  );
  indexedKeys.push(...vKey);
  return indexedKeys.join("+");
};

/**
 * Map of alternative key names to standard internal key names
 * Includes commonly expected aliases for better developer experience
 */
const keyAliases = new Map([
  // Common key alternatives
  ["delete", "del"],
  ["escape", "esc"], 
  ["return", "enter"],
  ["spacebar", "space"],
  
  // Arrow key alternatives
  ["up", "arrowup"],
  ["down", "arrowdown"],
  ["left", "arrowleft"],
  ["right", "arrowright"],
  
  // Modifier alternatives
  ["control", "ctrl"],
  ["command", "meta"],
  ["cmd", "meta"],
  ["option", "alt"],
  ["opt", "alt"],
  
  // Page navigation alternatives
  ["pgup", "pageup"],
  ["pgdn", "pagedown"],
  ["pgdown", "pagedown"],
  ["pagedn", "pagedown"],
  
  // Lock key alternatives
  ["caps", "capslock"],
  ["capslock", "capslock"], // Some users might expect this
  ["num", "numlock"],
  ["scroll", "scrolllock"],
  
  // Other common alternatives
  ["context", "contextmenu"],
  ["menu", "contextmenu"],
  ["ins", "insert"],
  ["windows", "meta"],
  ["win", "meta"],
  ["super", "meta"], // Linux users
  
  // Function key alternatives
  ["function", "fn"],
  ["fn", "fn"]
]);

/**
 * Normalize key names by applying aliases and converting to lowercase
 * @param key The key name to normalize
 * @returns Normalized key name
 */
const normalizeKeyName = (key: string): string => {
  const lowercaseKey = key.toLowerCase();
  return keyAliases.get(lowercaseKey) || lowercaseKey;
};

/**
 * Replace primary key actions with the correct key for the current platform
 * and apply key aliases
 * @param pKey Array of hotkeys
 * @returns Adapted hotkeys array
 */
export const platformSpecificHotkeys = (pKey: string[]) => {
  return pKey.map((key) => {
    // First normalize the key name (apply aliases)
    let normalizedKey = normalizeKeyName(key);
    
    // Then apply platform-specific transformations
    if (isMacOs) {
      return normalizedKey
        .replace(MODIFIER_KEYS.PRIMARY, MODIFIER_KEYS.META)
        .replace(MODIFIER_KEYS.SECONDARY, MODIFIER_KEYS.CTRL);
    }
    return normalizedKey
      .replace(MODIFIER_KEYS.PRIMARY, MODIFIER_KEYS.CTRL)
      .replace(MODIFIER_KEYS.SECONDARY, MODIFIER_KEYS.ALT);
  });
};
