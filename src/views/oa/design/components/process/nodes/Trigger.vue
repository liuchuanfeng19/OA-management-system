<script setup lang="ts">
import { ref, computed } from "vue";
import { isAllEmpty } from "@pureadmin/utils";

import Node from "./Node.vue";

defineOptions({
  name: "Trigger"
});

const props = defineProps({
  config: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

const emit = defineEmits(["selected", "delNode", "insertNode"]);

const errorInfo = ref("");
const showError = ref(false);

const content = computed(() => {
  return "";
});

//校验数据配置的合法性
function validate(err) {
  showError.value = false;
  if (props.config.props.type === "WEBHOOK") {
    if (!isAllEmpty(props.config.props.http.url)) {
      showError.value = false;
    } else {
      showError.value = true;
      errorInfo.value = "请设置WEBHOOK的URL地址";
    }
  } else if (props.config.props.type === "EMAIL") {
    if (
      isAllEmpty(props.config.props.email.subject) ||
      props.config.props.email.to.length === 0 ||
      isAllEmpty(props.config.props.email.content)
    ) {
      showError.value = true;
      errorInfo.value = "请设置邮件发送配置";
    } else {
      showError.value = false;
    }
  }
  if (showError.value) {
    err.push(`${props.config.name} 触发动作未设置完善`);
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
    placeholder="请设置触发器"
    header-bgc="#47bc82"
    header-icon="set-up"
    @selected="emit('selected')"
    @delNode="emit('delNode')"
    @insertNode="type => emit('insertNode', type)"
  />
</template>
