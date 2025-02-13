<script setup lang="ts">
defineProps({
  itemData: {
    required: true,
    type: Object,
    default: () => {
      return {};
    }
  }
});
</script>

<template>
  <div class="flex flex-wrap justify-center">
    <IconifyIconOffline
      icon="document"
      class="p-4 text-white bg-red-300 icon mr-4"
    />
    <div class="flex flex-col flex-wrap justify-between">
      <div class="!font-bold text-lg text-stroke-fuchsia-500">
        {{ itemData.value }}
      </div>
      <div class="flex flex-wrap items-baseline">
        <span class="color-gr">{{ itemData.name }}</span>
        <span class="color-red">（{{ itemData.unit }}）</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.icon {
  width: 48px;
  height: 48px;
  box-shadow: 2px 2px 10px 1px rgba(255, 74, 74, 0.3);
  border-radius: 24px 24px 24px 24px;
}
</style>
