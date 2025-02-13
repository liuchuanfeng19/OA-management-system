<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "PersonalVacation"
});

const content = ref("个人假期");
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
