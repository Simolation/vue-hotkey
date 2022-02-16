<script setup lang="ts">
import { ref } from "vue";
import HotKey from "./components/HotKey.vue";

const pressed = ref(0);

const action = (keys: string[]) => {
  pressed.value++;
};
</script>

<template>
  <h1>Press Ctrl+S</h1>
  <HotKey :keys="['ctrl', 's']" @hotkey="action">
    Pressed {{ pressed }}
  </HotKey>
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
