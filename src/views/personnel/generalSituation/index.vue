<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "GeneralSituation"
});

const content = ref("概况");
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
