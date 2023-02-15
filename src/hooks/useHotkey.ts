import {
  inject,
  InjectionKey,
  onMounted,
  onUnmounted,
  provide,
  Ref,
  ref,
} from "vue-demi";
import { IHotkey, IHotkeyMap } from "../interfaces/IHotkey";
import { HotkeyEvent } from "../interfaces/HotkeyEvent";
import {
  buildHotkeyIndexFromString,
  buildHotkeyIndexFromEvent,
  platformSpecificHotkeys,
} from "../helpers/buildHotKeyIndex";
import { isElementAvailable } from "../helpers/isElementAvailable";

const registeredHotKeys: IHotkeyMap = new Map();

interface IHotkeyProvider {
  keys: string[];
  enabled: Ref<boolean>;
}

const InjectSymbol = Symbol("hotkey") as InjectionKey<IHotkeyProvider>;

export const useHotkey = (
  hotKey: IHotkey,
  excludedElements: string[] = ["input", "textarea"]
) => {
  const hotKeyString = buildHotkeyIndexFromString(hotKey.keys);
  const hotKeyEntry = { hotKey, excludedElements };

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
    const foundHotKeyEntries = registeredHotKeys.get(hotKeyString);
    if (!foundHotKeyEntries) return;

    // Remove the current hotkey from the list
    const updatedHotKeyEntries = foundHotKeyEntries.filter(
      (entry) => entry !== hotKeyEntry
    );

    // Update the hotkey list
    if (updatedHotKeyEntries.length === 0) {
      registeredHotKeys.delete(hotKeyString);
    } else {
      registeredHotKeys.set(hotKeyString, updatedHotKeyEntries);
    }
  };

  onMounted(() => {
    // Get the already existing hot key entries
    const foundHotKeyEntries = registeredHotKeys.get(hotKeyString);

    // Append to the existing hot key entries or create a new entry
    registeredHotKeys.set(
      hotKeyString,
      foundHotKeyEntries ? [...foundHotKeyEntries, hotKeyEntry] : [hotKeyEntry]
    );
  });

  onUnmounted(destroy);

  // Provide hotkey keys
  const keys = platformSpecificHotkeys(hotKeyString.split("+"));

  // Provide the hotkey
  provide(InjectSymbol, { keys, enabled: hotKey.enabled });

  return { enable, disable, destroy, keys };
};

/**
 * Get the latest registered hotkey
 * @returns The hotkey combination
 */
export const getHotkey = () => {
  const injected = inject(InjectSymbol, null);

  if (!injected || !injected.enabled.value) return;

  return { keys: injected.keys };
};

/**
 * Dispatch the hot key event to the event bus
 * @param key The pressed key
 */
const dispatchHotKey = (key: string[]) => {
  // Create a new hotkey event
  const event = new HotkeyEvent(key);

  // Dispatch the event
  document.dispatchEvent(event);
};

/**
 * Handle the keydown event
 * @param event The keydown event
 */
const keydown = (event: KeyboardEvent) => {
  const pressedKeys = buildHotkeyIndexFromEvent(event) as string;

  const hotKeyEntries = registeredHotKeys.get(pressedKeys);

  // Skip if the pressed keys are not registered as a hotkey
  if (!hotKeyEntries || hotKeyEntries.length === 0) return;

  // Loop all hotkeys
  for (const hotKeyEntry of hotKeyEntries) {
    const hotKey = hotKeyEntry.hotKey;

    // Skip if the hotkey is disabled
    if (!hotKey.enabled!.value) continue;

    // Skip if the current element is not available
    if (!isElementAvailable(hotKeyEntry.excludedElements)) continue;

    // Stop propagation to prevent the default action
    if (!hotKey.propagate?.value) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Dispatch the handler
    hotKey.handler(hotKey.keys);

    // Dispatch the hotkey event
    dispatchHotKey(hotKey.keys);

    if (!hotKey.propagate?.value) {
      break;
    }
  }
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
