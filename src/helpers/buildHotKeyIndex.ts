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

export const buildHotKeyIndexFromEvent = (
  eKey: KeyboardEvent,
  asArray: boolean = false
): string | string[] => {
  let keys: string[] = [];
  if (eKey.key === "Shift" || eKey.shiftKey) keys.push("shift");
  if (eKey.key === "Control" || eKey.ctrlKey) keys.push("ctrl");
  if (eKey.key === "Meta" || eKey.metaKey) keys.push("meta");
  if (eKey.key === "Alt" || eKey.altKey) keys.push("alt");
  if (eKey.key === "ArrowUp") keys.push("arrowup");
  if (eKey.key === "ArrowLeft") keys.push("arrowleft");
  if (eKey.key === "ArrowRight") keys.push("arrowright");
  if (eKey.key === "ArrowDown") keys.push("arrowdown");
  if (eKey.key === "AltGraph") keys.push("altgraph");
  if (eKey.key === "Escape") keys.push("esc");
  if (eKey.key === "Enter") keys.push("enter");
  if (eKey.key === "Tab") keys.push("tab");
  if (eKey.key === " ") keys.push("space");
  if (eKey.key === "PageUp") keys.push("pageup");
  if (eKey.key === "PageDown") keys.push("pagedown");
  if (eKey.key === "Home") keys.push("home");
  if (eKey.key === "End") keys.push("end");
  if (eKey.key === "Delete") keys.push("del");
  if (eKey.key === "Backspace") keys.push("backspace");
  if (eKey.key === "Insert") keys.push("insert");
  if (eKey.key === "NumLock") keys.push("numlock");
  if (eKey.key === "CapsLock") keys.push("capslock");
  if (eKey.key === "Pause") keys.push("pause");
  if (eKey.key === "ContextMenu") keys.push("contextmenu");
  if (eKey.key === "ScrollLock") keys.push("scrolllock");
  if (eKey.key === "BrowserHome") keys.push("browserhome");
  if (eKey.key === "MediaSelect") keys.push("mediaselect");

  // Add all regular characters
  if (
    (eKey.key && eKey.key !== " " && eKey.key.length === 1) ||
    /F\d{1,2}|\//g.test(eKey.key)
  )
    keys.push(eKey.key.toLowerCase());

  if (asArray) return keys;

  return keys.join("+");
};

export const buildHotKeyIndexFromString = (pKey: string[]) => {
  const keys: any = {};
  keys.shiftKey = pKey.includes("shift");
  keys.ctrlKey = pKey.includes("ctrl");
  keys.metaKey = pKey.includes("meta");
  keys.altKey = pKey.includes("alt");
  let indexedKeys: string[] = buildHotKeyIndexFromEvent(keys, true) as string[];
  const vKey = pKey.filter(
    (item) => !["shift", "ctrl", "meta", "alt"].includes(item)
  );
  indexedKeys.push(...vKey);
  return indexedKeys.join("+");
};
