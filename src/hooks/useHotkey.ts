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

// Global counter for registration order
let registrationCounter = 0;

// Lazy event listener management
let globalListenersRegistered = false;
let activeHotkeyCount = 0;

const registerGlobalListeners = () => {
  if (!globalListenersRegistered) {
    document.addEventListener("keydown", keydown, true);
    document.addEventListener("keyup", keyup, true);
    globalListenersRegistered = true;
  }
};

const unregisterGlobalListeners = () => {
  if (globalListenersRegistered && activeHotkeyCount === 0) {
    document.removeEventListener("keydown", keydown, true);
    document.removeEventListener("keyup", keyup, true);
    globalListenersRegistered = false;
  }
};

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

  // Set default priority if not provided (higher number = higher priority)
  const priority = hotKey.priority ?? 0;

  const hotKeyEntry: IHotkeyMapEntry = {
    hotKey,
    excludedElements,
    isPressed: ref(false),
    priority,
    registrationTime: ++registrationCounter,
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

    // Decrement active count and potentially unregister global listeners
    activeHotkeyCount--;
    if (activeHotkeyCount <= 0) {
      activeHotkeyCount = 0;
      unregisterGlobalListeners();
    }
  };

  onMounted(() => {
    // Register global listeners if this is the first hotkey
    if (activeHotkeyCount === 0) {
      registerGlobalListeners();
    }
    activeHotkeyCount++;

    // Get the already existing hot key entries
    const foundHotKeyEntries = registeredHotKeys.get(hotKeyString);

    // Add the new entry and sort by priority (highest first), then by registration time (newest first)
    const allEntries = foundHotKeyEntries
      ? [...foundHotKeyEntries, hotKeyEntry]
      : [hotKeyEntry];

    // Sort entries: higher priority first, then newer registration time first
    allEntries.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return b.registrationTime - a.registrationTime; // Newer first for same priority
    });

    registeredHotKeys.set(hotKeyString, allEntries);
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

  // Hotkeys are already sorted by priority (highest first) and registration time (newest first)
  // Loop through hotkeys in priority order
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

    // If propagate is false, only execute the highest priority hotkey and stop
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
