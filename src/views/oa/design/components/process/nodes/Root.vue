<script setup lang="ts">
import { computed } from "vue";

import Node from "./Node.vue";

defineOptions({
  name: "Root"
});
const emit = defineEmits(["selected", "insertNode"]);
const props = defineProps({
  config: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

const content = computed(() => {
  if (props.config.props.assignedUser.length > 0) {
    const texts = [];
    props.config.props.assignedUser.forEach(org => texts.push(org.name));
    return String(texts).replaceAll(",", "、");
  } else {
    return "所有人";
  }
});
</script>

<template>
  <Node
    title="发起人"
    :is-root="true"
    :content="content"
    placeholder="所有人"
    header-bgc="#576a95"
    header-icon="epUser"
    @selected="emit('selected')"
    @insertNode="type => emit('insertNode', type)"
  />
</template>
