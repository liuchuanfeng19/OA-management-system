<script lang="ts" setup>
import { ref } from "vue";

import oaappqr from "@/assets/login/oa_app_qr.png";
import oaappyjkjqr from "@/assets/login/oa_app_yjkj_qr.png";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
const dialogVisible = ref(false);
const envMode = import.meta.env.VITE_RUN_MODE;
function handleDownload() {
  dialogVisible.value = true;
}
</script>
<template>
  <div class="mr-4">
    <el-link
      :underline="false"
      target="_blank"
      :icon="useRenderIcon('IF-icon-QRcode')"
      @click="handleDownload"
    >
      扫码下载
    </el-link>
    <el-dialog v-model="dialogVisible" width="400px">
      <div class="flex-c flex-col">
        <el-image v-if="envMode == 'youjie'" :src="oaappyjkjqr" />
        <el-image v-else :src="oaappqr" />
        <div class="mb-4">
          <el-text size="large">扫我扫我</el-text>
        </div>
      </div>
      <template #footer />
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
:deep() {
  .el-link__inner {
    margin-left: 4px;
  }

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    border-radius: 80px;
  }

  .el-dialog__footer {
    display: none;
  }
}
</style>
