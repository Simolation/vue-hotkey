// export { IHotKey } from "./interfaces/IHotkey";
export { HotKeyEvent } from "./interfaces/HotKeyEvent";
export { useHotkey } from "./hooks/useHotKey";

import { App } from "vue-demi";
import HotKey from "./components/HotKey.vue";

function install(Vue: App) {
  Vue.component(HotKey.name, HotKey);
}

export default { install };
