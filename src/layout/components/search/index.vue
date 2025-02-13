<script lang="ts" setup>
import { SearchModal } from "./components";
import { useBoolean } from "../../hooks/useBoolean";
const { bool: show, toggle } = useBoolean();
const envMode = import.meta.env.VITE_RUN_MODE;
function handleSearch() {
  toggle();
}
</script>

<template>
  <div
    v-if="envMode != ''"
    class="search-container w-[40px] h-[48px] flex-c cursor-pointer navbar-bg-hover"
    @click="handleSearch"
  >
    <IconifyIconOffline icon="search" />
  </div>
  <SearchModal v-model:value="show" />
</template>
