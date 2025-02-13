<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "RecruitmentPosition"
});

const content = ref("招聘岗位");
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
