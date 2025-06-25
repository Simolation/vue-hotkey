import { Ref } from "vue-demi";

export interface IHotkey {
  keys: string[];
  handler?: (keys: string[]) => void;
  propagate?: Ref<boolean>;
  enabled?: Ref<boolean>;
  priority?: number;
}

export interface IHotkeyMapEntry {
  hotKey: IHotkey;
  excludedElements?: string[];
  isPressed: Ref<boolean>;
  priority: number;
  registrationTime: number;
}

export type IHotkeyMap = Map<string, IHotkeyMapEntry[]>;
