import { onMounted, onUnmounted, ref } from "vue-demi";
import { IHotKey, IHotKeyMap } from "../interfaces/IHotkey";
import { HotKeyEvent } from "../interfaces/HotKeyEvent";
import {
  buildHotKeyIndexFromString,
  buildHotKeyIndexFromEvent,
} from "../helpers/buildHotKeyIndex";
import { isElementAvailable } from "../helpers/isElementAvailable";

const registeredHotKeys: IHotKeyMap = new Map();

export const useHotkey = (hotKey: IHotKey) => {
  const hotKeyString = buildHotKeyIndexFromString(hotKey.keys);

  hotKey.enabled = hotKey.enabled ?? ref(true);

  /**
   * Enable the hotkey
   */
  const enable = () => {
    hotKey.enabled!.value = true;
  };

  /**
   * Disable the hotkey
   */
  const disable = () => {
    hotKey.enabled!.value = false;
  };

  /**
   * Destroy the hotkey
   */
  const destroy = () => {
    registeredHotKeys.delete(hotKeyString);
  };

  onMounted(() => {
    registeredHotKeys.set(hotKeyString, hotKey);
  });

  onUnmounted(destroy);

  return { enable, disable, destroy };
};

/**
 * Dispatch the hot key event to the event bus
 * @param key The pressed key
 */
const dispatchHotKey = (key: string[]) => {
  // Create a new hotkey event
  const event = new HotKeyEvent(key);

  // Dispatch the event
  document.dispatchEvent(event);
};

/**
 * Handle the keydown event
 * @param event The keydown event
 */
const keydown = (event: KeyboardEvent) => {
  // Skip if the current element is not available
  if (!isElementAvailable()) return;

  const pressedKeys = buildHotKeyIndexFromEvent(event) as string;

  const hotKey = registeredHotKeys.get(pressedKeys);

  // Skip if the pressed keys are not registered as a hotkey
  if (!hotKey) return;

  // Skip if the hotkey is disabled
  if (!hotKey.enabled!.value) return;

  // Stop propagation to prevent the default action
  if (!hotKey.propagate?.value) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Dispatch the handler
  hotKey.handler(hotKey.keys);

  // Dispatch the hotkey event
  dispatchHotKey(hotKey.keys);
};

/**
 * Handle the keyup event
 * @param event The keyup event
 */
const keyup = (event: KeyboardEvent) => {};

// Register event listeners
// Add keydown listener
document.addEventListener("keydown", keydown, true);

// Add keyup listener
document.addEventListener("keyup", keyup, true);
