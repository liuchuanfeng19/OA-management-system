<script setup lang="ts">
defineOptions({
  name: "TextInput"
});
defineProps({
  modelValue: {
    type: Object,
    default: () => {
      return {};
    }
  }
});
</script>

<template>
  <el-form-item label="提示文字">
    <el-input :modelValue="modelValue.placeholder" placeholder="请设置提示语" />
  </el-form-item>
</template>
