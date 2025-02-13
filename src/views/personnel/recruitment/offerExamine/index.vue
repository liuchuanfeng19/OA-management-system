<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "OfferExamine"
});

const content = ref("offer审核");
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
