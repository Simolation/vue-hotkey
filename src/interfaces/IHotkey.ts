import { Ref } from "vue-demi";

export interface IHotkey {
  keys: string[];
  handler: (keys: string[]) => void;
  propagate?: Ref<boolean>;
  enabled?: Ref<boolean>;
}

interface IHotkeyMapEntry {
  hotKey: IHotkey;
  excludedElements?: string[];
}

export type IHotkeyMap = Map<string, IHotkeyMapEntry[]>;
