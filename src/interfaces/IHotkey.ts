import { Ref } from "vue-demi";

export interface IHotKey {
  keys: string[];
  handler: (keys: string[]) => void;
  propagate?: Ref<boolean>;
  enabled?: Ref<boolean>;
}

interface IHotKeyMapEntry {
  hotKey: IHotKey;
  exludedElements?: string[];
}

export type IHotKeyMap = Map<string, IHotKeyMapEntry>;
