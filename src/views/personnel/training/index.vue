<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "TrainingManagement"
});

const content = ref("培训管理");
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
