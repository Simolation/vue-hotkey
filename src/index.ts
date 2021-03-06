// export { IHotkey } from "./interfaces/IHotkey";
export { HotkeyEvent as HotKeyEvent } from "./interfaces/HotkeyEvent";
export { isMacOs } from "./helpers/buildHotKeyIndex";
export { useHotkey, getHotkey } from "./hooks/useHotkey";
import { platformSpecificHotkeys } from "./helpers/buildHotKeyIndex";

import { App, install as vueDemiInstall } from "vue-demi";
vueDemiInstall();

import Hotkey from "./components/Hotkey.vue";

function install(Vue: App) {
  Vue.component(Hotkey.name, Hotkey);
}

export default { install };
export { Hotkey, platformSpecificHotkeys };
