import {
  computed,
  inject,
  InjectionKey,
  onMounted,
  onUnmounted,
  provide,
  Ref,
  ref,
} from "vue-demi";
import { IHotkey, IHotkeyMap, IHotkeyMapEntry } from "../interfaces/IHotkey";
import { HotkeyEvent } from "../interfaces/HotKeyEvent";
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
  excludedElements: string[] = ["input", "textarea"],
) => {
  const hotKeyString = buildHotkeyIndexFromString(hotKey.keys);
  const hotKeyEntry: IHotkeyMapEntry = {
    hotKey,
    excludedElements,
    isPressed: ref(false),
  };

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
      (entry) => entry !== hotKeyEntry,
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
      foundHotKeyEntries ? [...foundHotKeyEntries, hotKeyEntry] : [hotKeyEntry],
    );
  });

  onUnmounted(destroy);

  // Provide hotkey keys
  const keys = platformSpecificHotkeys(hotKeyString.split("+"));

  /**
   * Is the hotkey pressed
   */
  const isPressed = computed(() => hotKeyEntry.isPressed.value);

  /**
   * Trigger the action only when the hotkey is pressed while the keyCheck() function is called.
   * @param action The action to trigger
   */
  const keyCheckFn = <Args extends any[], O = any>(
    action: (...params: Args) => O,
  ) => {
    return (...params: Args) => {
      // Trigger the action only when the isPressed is true
      if (isPressed.value) return action(...params);
    };
  };

  // Provide the hotkey
  provide(InjectSymbol, { keys, enabled: hotKey.enabled });

  return { enable, disable, destroy, keys, isPressed, keyCheckFn };
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

    // Set the hotkey as pressed
    hotKeyEntry.isPressed.value = true;

    // Dispatch the handler if available
    if (hotKey.handler) {
      hotKey.handler(hotKey.keys);
    }

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
const keyup = (event: KeyboardEvent) => {
  const pressedKeys = buildHotkeyIndexFromEvent(event) as string;

  const hotKeyEntries = registeredHotKeys.get(pressedKeys);

  // Skip if the pressed keys are not registered as a hotkey
  if (!hotKeyEntries || hotKeyEntries.length === 0) return;

  // Loop all hotkeys
  for (const hotKeyEntry of hotKeyEntries) {
    if (hotKeyEntry.isPressed.value) {
      // Set the hotkey as released
      hotKeyEntry.isPressed.value = false;
    }
  }
};

// Register event listeners
// Add keydown listener
document.addEventListener("keydown", keydown, true);

// Add keyup listener
document.addEventListener("keyup", keyup, true);
