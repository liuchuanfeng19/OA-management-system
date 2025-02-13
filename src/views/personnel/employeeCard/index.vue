<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "EmployeeCard"
});

const content = ref("员工卡片");
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
