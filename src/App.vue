<script setup lang="ts">
import { ref } from "vue-demi";
import Hotkey from "./components/Hotkey.vue";

const pressed = ref(0);

const action = (keys: string[]) => {
  pressed.value--;
};

const onClick = () => {
  pressed.value += 4;
};
</script>

<template>
  <h1>Press Ctrl+S or Shift+Ctrl+S</h1>

  <Hotkey :keys="['ctrl', 'shift', 's']" @hotkey="action"></Hotkey>

  <Hotkey :keys="['ctrl', 's']" v-slot="{ clickRef }">
    <button :ref="clickRef" @click="onClick">Add 4</button>
  </Hotkey>

  <br /><br />
  <div>Pressed {{ pressed }} times</div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
