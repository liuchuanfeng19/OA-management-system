<script setup lang="ts">
import { ref, computed } from "vue";

import Node from "./Node.vue";

defineOptions({
  name: "Cc"
});
const emit = defineEmits(["selected", "delNode", "insertNode"]);
const props = defineProps({
  config: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

const errorInfo = ref("");
const showError = ref(false);

const content = computed(() => {
  if (props.config.props.shouldAdd) {
    return "由发起人指定";
  } else if (props.config.props.assignedUser.length > 0) {
    const texts = [];
    props.config.props.assignedUser.forEach(org => texts.push(org.name));
    return String(texts).replaceAll(",", "、");
  } else {
    return null;
  }
});

//校验数据配置的合法性
function validate(err) {
  showError.value = false;
  if (props.config.props.shouldAdd) {
    showError.value = false;
  } else if (props.config.props.assignedUser.length === 0) {
    showError.value = true;
    errorInfo.value = "请选择需要抄送的人员";
  }
  if (showError.value) {
    err.push(`抄送节点 ${props.config.name} 未设置抄送人`);
  }
  return !showError.value;
}

defineExpose({ validate });
</script>
<template>
  <Node
    :title="config.name"
    :show-error="showError"
    :content="content"
    :error-info="errorInfo"
    placeholder="请设置抄送人"
    header-bgc="#3296fa"
    header-icon="promotion"
    @selected="emit('selected')"
    @delNode="emit('delNode')"
    @insertNode="type => emit('insertNode', type)"
  />
</template>
