<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";

import OrgItems from "../OrgItems.vue";
import { useOAStoreHook } from "@/store/modules/oa";
import OrgPicker from "@/components/common/OrgPicker.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "RootConfig"
});

const { selectedNode } = storeToRefs(useOAStoreHook());

const nodeProps = computed(() => {
  return selectedNode.value.props;
});

const orgPickerRef = ref();

const select = computed(() => {
  return nodeProps.value.assignedUser || [];
});

function selectOrg() {
  orgPickerRef.value.show();
}
function selected(select) {
  select.value.length = 0;
  select.forEach(val => select.value.push(val));
}
// function removeOrgItem(index) {
//   select.value.splice(index, 1);
// }
</script>

<template>
  <div>
    <p class="desc">选择能发起该审批的人员/部门，不选则默认开放给所有人</p>
    <el-button
      :icon="useRenderIcon('plus')"
      type="primary"
      round
      @click="selectOrg"
      >请选择</el-button
    >
    <OrgItems v-model="select" />
    <OrgPicker
      ref="orgPickerRef"
      title="请选择可发起本审批的人员/部门"
      multiple
      :selected="select"
      @ok="selected"
    />
  </div>
</template>

<style lang="scss" scoped>
.desc {
  font-size: small;
  color: #8c8c8c;
}

.org-item {
  margin: 5px;
}
</style>
