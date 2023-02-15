<script lang="ts">
import { defineComponent, PropType, ref, computed } from "vue-demi";
import { useMaybeBoolean } from "../helpers/maybeBoolean";
import { useHotkey } from "../hooks/useHotkey";

export default defineComponent({
  name: "Hotkey",
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
      type: [Boolean, String] as PropType<boolean | string>,
      default: false,
    },
    /**
     * Whether the hotkey is enabled or not
     */
    disabled: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: false,
    },
    /**
     * Exclude specific HTML elements from the hotkey.
     * ```vue
     * :exclude-elements="['input', 'textarea']"
     * ```
     */
    excludedElements: {
      type: Array as PropType<string[] | undefined>,
      default: undefined,
    },
  },
  emits: ["hotkey"],
  setup(props, { emit, slots }) {
    // Convert keys to array
    const keyValue =
      typeof props.keys === "string"
        ? (JSON.parse(props.keys.replace(/\'/gi, '"')) as string[])
        : props.keys;

    const clickRef = ref<(HTMLElement & { $el?: HTMLElement }) | null>(null);
    const focusRef = ref<(HTMLElement & { $el?: HTMLElement }) | null>(null);

    // Enable hotkey
    const { keys, keyCheckFn } = useHotkey(
      {
        keys: keyValue,
        handler: (keys: string[]) => {
          // When the element refs are not null, click/focus the element

          if (clickRef.value) {
            // Resolve custom component elements or native elements
            if (clickRef.value?.click) clickRef.value?.click();
            else if (clickRef.value?.$el?.click) clickRef.value?.$el?.click();
            else {
              console.warn(
                `[VueHotkey] The clickRef is not a valid clickable element.`
              );
            }
          }

          if (focusRef.value) {
            // Resolve custom component elements or native elements
            if (focusRef.value?.focus) focusRef.value?.focus();
            else if (focusRef.value?.$el?.focus) focusRef.value?.$el?.focus();
            else {
              console.warn(
                `[VueHotkey] The focusRef is not a valid focusable element.`
              );
            }
          }

          // Emit the hotkey action
          emit("hotkey", keys);
        },
        propagate: computed(() => useMaybeBoolean(props.propagate)),
        enabled: computed(() => !useMaybeBoolean(props.disabled)),
      },
      props.excludedElements
    );

    const keyCheck = keyCheckFn((action: (...params: any[]) => any | void) =>
      action()
    );

    // Render slot
    return () => {
      return slots.default?.({
        clickRef,
        focusRef,
        keys,
        keyCheck,
      });
    };
  },
});
</script>
