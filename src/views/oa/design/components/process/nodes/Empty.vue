<script setup lang="ts">
import Node from "./Node.vue";

defineOptions({
  name: "Empty"
});
const emit = defineEmits(["insertNode"]);
</script>
<template>
  <Node :show="false" @insertNode="type => emit('insertNode', type)" />
</template>
