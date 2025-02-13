<script setup lang="ts">
defineOptions({
  name: "OrgItems"
});
const props = defineProps({
  modelValue: {
    type: Array<any>,
    default: () => {
      return [];
    }
  }
});
const emit = defineEmits(["update:modelValue"]);

function removeOrgItem(index) {
  const value = JSON.parse(JSON.stringify(props.modelValue));
  value.splice(index, 1);
  emit("update:modelValue", value);
}
</script>

<template>
  <div style="margin-top: 10px">
    <el-tag
      v-for="(org, index) in modelValue"
      :key="index + '_org'"
      class="org-item"
      :type="org.type === 'dept' ? '' : 'info'"
      closable
      @close="removeOrgItem(index)"
    >
      {{ org.name }}
    </el-tag>
  </div>
</template>

<style scoped>
.org-item {
  margin: 5px;
}
</style>
