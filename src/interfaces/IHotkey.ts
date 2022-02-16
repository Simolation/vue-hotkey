import { Ref } from "vue-demi";

export interface IHotKey {
  keys: string[];
  handler: (keys: string[]) => void;
  propagate?: Ref<boolean>;
  enabled?: Ref<boolean>;
}

export type IHotKeyMap = Map<string, IHotKey>;
