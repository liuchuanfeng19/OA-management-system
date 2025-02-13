<script setup lang="ts">
import { useDark } from "@pureadmin/utils";

interface Props {
  isActive: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false
});
const { isDark } = useDark();
const { version } = __APP_INFO__.pkg;

const emit = defineEmits<{
  (e: "toggleClick"): void;
}>();

const toggleClick = () => {
  emit("toggleClick");
};
</script>

<template>
  <div class="container">
    <el-tooltip
      placement="right"
      :effect="isDark ? 'dark' : 'light'"
      :content="props.isActive ? '点击折叠' : '点击展开'"
    >
      <IconifyIconOffline
        :icon="props.isActive ? 'menu-fold' : 'menu-unfold'"
        class="cursor-pointer inline-block align-middle text-white hover:text-white dark:hover:!text-white w-[16px] h-[16px] ml-4 mb-1"
        @click="toggleClick"
      />
    </el-tooltip>
    <div class="version inline-block align-middle h-[16px] ml-2 text-xs mb-1">
      V{{ version }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40px;
  line-height: 40px;
  box-shadow: 0 0 6px -2px var(--el-color-primary);

  .version {
    color: $menuText !important;
  }
}
</style>
