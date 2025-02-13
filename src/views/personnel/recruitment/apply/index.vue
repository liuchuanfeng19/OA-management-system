<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "RecruitmentApply"
});

const content = ref("招聘申请");
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
