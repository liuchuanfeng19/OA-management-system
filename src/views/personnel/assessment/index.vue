<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "AssessmentManagement"
});

const content = ref("考核管理");
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
