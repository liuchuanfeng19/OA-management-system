<script setup lang="ts">
import { ref, watch } from "vue";
import components from "@/views/oa/common/form/ComponentExport";

defineOptions({
  name: "FormDesignRender"
});

const props = defineProps({
  mode: {
    type: String,
    default: "DESIGN"
  },
  modelValue: {
    default: undefined
  },
  config: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

const formRef = ref();

function validate(call) {
  formRef.value.validate(call);
}
defineExpose({ validate });

watch(
  () => props.config,
  _newVal => {
    // console.log("FormDesignRender watch props.config", _newVal);
  },
  { immediate: true }
);
</script>

<template>
  <component
    :is="components[config.name]"
    ref="formRef"
    :mode="mode"
    :modelValue="modelValue"
    v-bind="config.props"
  />
</template>
