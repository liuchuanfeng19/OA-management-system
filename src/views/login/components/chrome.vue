<script lang="ts" setup>
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
</script>
<template>
  <div class="mr-4">
    <el-link
      :underline="false"
      href="/ChromeStandaloneSetup64.exe"
      target="_blank"
      :icon="useRenderIcon('IF-icon-chrome')"
    >
      浏览器下载
    </el-link>
  </div>
</template>
<style lang="scss" scoped>
:deep() {
  .el-link__inner {
    margin-left: 4px;
  }
}
</style>
