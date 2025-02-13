<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "RecruitmentList"
});

const content = ref("新建招聘");
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
