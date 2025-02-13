<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";

import { useOAStoreHook } from "@/store/modules/oa";
import Approval from "./ApprovalNodeConfig.vue";
import Condition from "./ConditionNodeConfig.vue";
import Delay from "./DelayNodeConfig.vue";
import Cc from "./CcNodeConfig.vue";
import Trigger from "./TriggerNodeConfig.vue";
import FormAuthorityConfig from "./FormAuthorityConfig.vue";
import Root from "./RootNodeConfig.vue";

defineOptions({
  name: "NodeConfig"
});
const components = {
  approval: Approval,
  condition: Condition,
  delay: Delay,
  cc: Cc,
  trigger: Trigger,
  root: Root
};

const { selectedNode, design } = storeToRefs(useOAStoreHook());
const active = ref("properties");
const formConfig = computed(() => {
  return design.value.formItems;
});
const name = computed(() => {
  switch (selectedNode.value.type) {
    case "ROOT":
      return "设置发起人";
    case "APPROVAL":
      return "设置审批人";
    case "CC":
      return "设置抄送人";
    default:
      return null;
  }
});
</script>

<template>
  <div>
    <el-tabs v-if="name && formConfig.length > 0" v-model="active">
      <el-tab-pane :label="name" name="properties">
        <component
          :is="components[(selectedNode.type || '').toLowerCase()]"
          :config="selectedNode.props"
        />
      </el-tab-pane>
      <el-tab-pane label="表单权限设置" name="permissions">
        <FormAuthorityConfig />
      </el-tab-pane>
    </el-tabs>
    <component
      :is="components[(selectedNode.type || '').toLowerCase()]"
      v-else
      :config="selectedNode.props"
    />
  </div>
</template>
