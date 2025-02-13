<script setup lang="ts">
import { ref } from "vue";
import ReQrcode from "@/components/ReQrcode";

const text = ref("");
const dialogVisible = ref(false);

const showDialog = _text => {
  text.value = _text;
  dialogVisible.value = true;
};
defineExpose({ showDialog });
</script>

<template>
  <el-dialog v-model="dialogVisible" title="查看二维码" width="300">
    <div class="flex justify-center">
      <ReQrcode
        :text="text"
        :logo="{
          src: 'https://avatars.githubusercontent.com/u/44761321?v=4',
          logoSize: 0.2,
          borderSize: 0.05,
          borderRadius: 50,
          bgColor: 'blue'
        }"
      />
    </div>
    <template #footer>
      <span>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>
