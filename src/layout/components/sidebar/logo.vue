<script setup lang="ts">
import { useNav } from "../../hooks/useNav";
const props = defineProps({
  collapse: Boolean
});

const { title } = useNav();
</script>

<template>
  <div class="sidebar-logo-container">
    <transition name="sidebarLogoFade">
      <router-link
        :title="title"
        class="sidebar-logo-link flex"
        :class="[props.collapse ? 'flex' : '']"
        to="/"
      >
        <FontIcon
          class="icon"
          :style="{ 'margin-left': '6px' }"
          icon="icon-a-ziyuan2"
          svg
        />
        <span
          class="sidebar-title flex-1 w-[0px] text-ellipsis overflow-hidden whitespace-nowrap text-left"
          :class="{ hidden: props.collapse }"
          >{{ title }}</span
        >
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 48px;
  overflow: hidden;
  line-height: 48px;
  text-align: center;

  .sidebar-logo-link {
    height: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .icon {
      width: 24px;
      height: 24px;
      margin-top: 12px;
      margin-right: 8px;
    }
  }

  .collapse {
    .sidebar-logo {
      margin-right: 0;
    }
  }
}
</style>
