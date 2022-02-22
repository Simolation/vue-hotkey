![npm](https://img.shields.io/npm/v/@simolation/vue-hotkey) ![npm](https://img.shields.io/npm/dw/@simolation/vue-hotkey) ![NPM](https://img.shields.io/npm/l/@simolation/vue-hotkey)

Vue 3 keyboard shortcut library. Also usable in Vue 2 due to [VueDemi](https://github.com/vueuse/vue-demi).
For Vue 2 the `@vue/composition-api` is required.

## Install

Install the package as a dependency in your project:

```properties
npm install --save @simolation/vue-hotkey
# or with yarn
yarn add @simolation/vue-hotkey
```

## Usage

This package can be used as a Vue component or as a hook.

### Use as a Vue component

The idea behind the component is to wrap, for example, a button with the `Hotkey` component to have a strong connection between the element, which would trigger the action without the hotkey. There will be no hotkey code scattered throughout your application.

Import the `Hotkey` component in your Vue file:

```ts
import { Hotkey } from "@simolation/vue-hotkey";
```

Register it as a component:

```ts
export default defineComponent({
  // ...
  components: {
    Hotkey,
  },
  // ...
  setup() {
    return {
      // This is the action that will be triggered when the hotkey is activated
      action: () => {
        console.log("Ctrl + s has been pressed!");
      },
    };
  },
});
```

Use it in your template:

```html
<template>
  <Hotkey :keys="['ctrl', 's']" @hotkey="action">
    <!-- any content -->
  </Hotkey>
</template>
```

##### Click or focus element

It is also possible to click or focus the slot element:

```html
<Hotkey :keys="['ctrl', 's']" v-slot="{ clickRef }">
  <button :ref="clickRef" @click="action">Hotkey or click</button>
</Hotkey>
```

```html
<Hotkey :keys="['ctrl', 's']" v-slot="{ focusRef }">
  <input :ref="focusRef" type="text" />
</Hotkey>
```

##### Allow propagation

By default, the hotkey prevents the default action and is not propagated to the parent.
With `:propagate="true"` the event will be passed to the parent listeners as well and trigger the default action.

```html
<template>
  <Hotkey :keys="['ctrl', 's']" :propagate="true" @hotkey="action">
    <!-- any content -->
  </Hotkey>
</template>
```

##### Enable or Disable the hotkey

When the hotkey should not be usable, it can easily be disabled by setting `:enabled="false"`.

```html
<template>
  <Hotkey :keys="['ctrl', 's']" :enabled="false" @hotkey="action">
    <!-- any content -->
  </Hotkey>
</template>
```

##### Exclude HTML elements

By default, `input` and `textarea` fields are excluded. This can be overwritten and changed by specifying the `:excluded-elements="['radio', 'div']"` option.
It will prevent the hotkey when the currently focused HTML element is of the specified type.

```html
<template>
  <Hotkey
    :keys="['ctrl', 's']"
    :excluded-elements="['radio', 'div']"
    @hotkey="action"
  >
    <!-- any content -->
  </Hotkey>
</template>
```

### Use as a hook

When there is no specific element tied to the hotkey, it can be used as a hook with `useHotkey()`:

```ts
import { useHotkey } from "@simolation/vue-hotkey";

useHotkey({
  keys: ["ctrl" + "s"],
  handler: () => {
    console.log("Ctrl + s has been pressed!");
  },
  // optional:
  propagate: ref(false),
  enabled: ref(true),
});
```

##### Enable or Disable the hotkey

The hook returns three functions to enable, disable or destroy the hotkey.
The hotkey does not need to be destroyed `onUnmount`, as the hook already takes care of that.

```ts
const { enable, disable, destroy } = useHotkey({ ... })

// Enable or disable the hotkey
enable()
// or
disable()

// Completely destroy the hotkey. It can not be enabled() again.
destroy()
```

##### Exclude HTML elements

The excluded elements can be specified with the hook as well. The default is again `input` and `textarea`.

```ts
useHotkey(
  {
    keys: ["ctrl" + "s"],
    handler: () => {
      console.log("Ctrl + s has been pressed!");
    },
  },
  ["radio", "div"]
);
```
