<script setup lang="ts">
import { ref } from "vue";
import FormDesignRender from "@/views/oa/common/form/FormDesignRender.vue";

defineOptions({
  name: "FormRender"
});
// const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  forms: {
    type: Array<any>,
    default: () => {
      return [];
    }
  },
  modelValue: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

const rules = ref({});
const formRef = ref();

function validate(call) {
  let success = true;
  formRef.value.validate(valid => {
    success = valid;
    if (valid) {
      //校验成功再校验内部
      for (let i = 0; i < props.forms.length; i++) {
        if (props.forms[i].name === "TableList") {
          const formRef = this.$refs[`sub-item_${props.forms[i].id}`];
          if (formRef && Array.isArray(formRef) && formRef.length > 0) {
            formRef[0].validate(subValid => {
              success = subValid;
            });
            if (!success) {
              break;
            }
          }
        }
      }
    }
    call(success);
  });
}
defineExpose({ validate });

function loadFormConfig(forms) {
  forms.forEach(item => {
    if (item.name === "SpanLayout") {
      loadFormConfig(item.props.items);
    } else {
      // this.$set(props.modelValue, item.id, this.value[item.id]);
      // props.modelValue[item.id] = props.modelValue[item.id];
      // emit("update:modelValue", props.modelValue);
      if (item.props.required) {
        rules.value[item.id] = [
          {
            type: item.valueType === "Array" ? "array" : undefined,
            required: true,
            message: `请填写${item.title}`,
            trigger: "blur"
          }
        ];
      }
    }
  });
}

loadFormConfig(props.forms);
</script>

<template>
  <!--渲染表单-->
  <el-form
    ref="formRef"
    class="process-form"
    label-position="top"
    :rules="rules"
    :model="modelValue"
  >
    <el-form-item
      v-for="(item, index) in forms"
      :key="item.name + index"
      :prop="item.id"
      :label="item.title"
    >
      <FormDesignRender
        v-if="item.name !== 'SpanLayout' && item.name !== 'Description'"
        :ref="`sub-item_${item.id}`"
        :modelValue="modelValue[item.id]"
        mode="PC"
        :config="item"
      />
      <FormDesignRender
        v-else
        ref="span-layout"
        :modelValue="modelValue"
        mode="PC"
        :config="item"
      />
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
.process-form {
  :deep(.el-form-item__label) {
    padding: 0;
  }
}
</style>
