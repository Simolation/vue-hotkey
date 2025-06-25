<script setup lang="ts">
import { ref } from "vue-demi";
import Hotkey from "./components/HotKey.vue";

const pressed = ref(0);

const action = (keys: string[]) => {
    pressed.value--;
};

const onClick = () => {
    pressed.value += 4;
};
</script>

<template>
    <h1>Press Ctrl+Shift+S</h1>

    <Hotkey :keys="['primary', 'shift', 's']" @hotkey="action"></Hotkey>

    <Hotkey :keys="['primary', 's']" v-slot="{ clickRef }">
        <button :ref="clickRef" @click="onClick">Add 4</button>
    </Hotkey>

    <Hotkey :keys="['alt']" v-slot="{ keyCheck }">
        <button @click="keyCheck(onClick)">Add 4 while pressing Alt</button>
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
