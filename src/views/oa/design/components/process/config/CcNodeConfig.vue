<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { useOAStoreHook } from "@/store/modules/oa";

import OrgItems from "../OrgItems.vue";
import OrgPicker from "@/components/common/OrgPicker.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "CcNodeConfig.vue"
});

const config = computed(() => {
  return selectedNode.value.props;
});

const orgPickerRef = ref();
const { selectedNode } = storeToRefs(useOAStoreHook());

const select = computed(() => {
  return config.value.assignedUser || [];
});

function selectOrg() {
  orgPickerRef.value.show();
}
function selected(select) {
  console.log(select);
  select.value = Object.assign([], select);
}
// function removeOrgItem(index) {
//   this.select.splice(index, 1);
// }
</script>

<template>
  <div>
    <el-button
      :icon="useRenderIcon('plus')"
      type="primary"
      round
      @click="selectOrg"
      >选择抄送人</el-button
    >
    <div class="option">
      <el-checkbox v-model="config.shouldAdd" label="允许发起人添加抄送人" />
    </div>
    <OrgItems v-model="select" />
    <OrgPicker ref="orgPickerRef" multiple :selected="select" @ok="selected" />
  </div>
</template>

<style lang="scss" scoped>
.option {
  margin-top: 20px;
  font-size: small;
  color: #606266;
}

.desc {
  font-size: small;
  color: #8c8c8c;
}

.org-item {
  margin: 5px;
}
</style>
