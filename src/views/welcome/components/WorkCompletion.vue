<script setup lang="ts"></script>

<template>
  <div class="flex flex-wrap justify-between">
    <div class="flex flex-col flex-wrap justify-between">
      <div class="!font-bold text-lg text-stroke-fuchsia-500">200</div>
      <div class="flex flex-wrap items-baseline">
        <span class="color-red mr-1">+50</span>
        <span class="color-gr">较上季度</span>
      </div>
    </div>
    <IconifyIconOffline
      icon="document"
      class="p-4 text-white bg-red-300 icon"
    />
  </div>
</template>

<style lang="scss" scoped>
.icon {
  width: 72px;
  height: 72px;
  box-shadow: 2px 2px 10px 1px rgba(255, 74, 74, 0.3);
  border-radius: 8px 8px 8px 8px;
}
</style>
