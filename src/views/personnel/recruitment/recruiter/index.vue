<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "RecruiterInformation"
});

const content = ref("招聘者信息");
</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header">
        {{ content }}
      </div>
    </template>
  </el-card>
</template>
