<script lang="ts">
import { defineComponent, PropType, computed } from "vue-demi";
import { useHotkey } from "../hooks/useHotKey";

export default defineComponent({
  name: "HotKey",
  props: {
    /**
     * The hotkey keys.
     *
     * @example
     * ```vue
     * <HotKey keys="['ctrl', 's']" @hotkey="action" />
     * // or
     * <HotKey :keys="['ctrl', 's']" @hotkey="action" />
     * ```
     */
    keys: {
      type: [Array, String] as PropType<string[] | string>,
      required: true,
    },
    /**
     * Propagate the hotkey event to the parent.
     */
    propagate: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    /**
     * Whether the hotkey is enabled or not
     */
    enabled: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
  emits: ["hotkey"],
  setup(props, { emit, slots }) {
    // Convert keys to array
    const keyValue =
      typeof props.keys === "string"
        ? (JSON.parse(props.keys.replace(/\'/gi, '"')) as string[])
        : props.keys;

    // Enable hotkey
    useHotkey({
      keys: keyValue,
      handler: (keys: string[]) => {
        emit("hotkey", keys);
      },
      propagate: computed(() => props.propagate),
      enabled: computed(() => props.enabled),
    });

    // Render slots
    return () => {
      return slots.default?.();
    };
  },
});
</script>
