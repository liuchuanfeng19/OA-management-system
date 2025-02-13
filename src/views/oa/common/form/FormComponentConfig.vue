<script setup lang="ts">
import { storeToRefs } from "pinia";
// import TextInput from "./config/TextInputConfig.vue";
// import NumberInput from "./config/NumberInputConfig.vue";
// import AmountInput from "./config/AmountInputConfig.vue";
// import TextareaInput from "./config/TextareaInputConfig.vue";
// import MultipleSelect from "./config/SelectInputConfig.vue";
// import SelectInput from "./config/SelectInputConfig.vue";
// import DateTime from "./config/DateTimeConfig.vue";
// import DateTimeRange from "./config/DateTimeRangeConfig.vue";
// import ImageUpload from "./config/ImageUploadConfig.vue";
// import FileUpload from "./config/FileUploadConfig.vue";
// import Description from "./config/DescriptionConfig.vue";
// import MoneyInput from "./config/MoneyInputConfig.vue";
// import DeptPicker from "./config/OrgPickerConfig.vue";
// import UserPicker from "./config/OrgPickerConfig.vue";
// import TableList from "./config/TableListConfig.vue";
import { useOAStoreHook } from "@/store/modules/oa";

defineOptions({
  name: "FormComponentConfig"
});
const { selectFormItem } = storeToRefs(useOAStoreHook());
</script>
<template>
  <div>
    <el-form v-if="selectFormItem.name !== 'SpanLayout'" label-width="90px">
      <el-form-item label="表单项名称">
        <el-input v-model="selectFormItem.title" clearable />
      </el-form-item>
      <el-form-item label="字段名称">
        <el-input v-model="selectFormItem.field" clearable />
      </el-form-item>
      <component :is="selectFormItem.name" v-model="selectFormItem.props" />
      <el-form-item label="必填项">
        <el-switch v-model="selectFormItem.props.required" />
      </el-form-item>
      <el-form-item label="可打印">
        <el-switch v-model="selectFormItem.props.enablePrint" />
      </el-form-item>
    </el-form>
    <el-empty v-else description="当前组件不支持配置" />
  </div>
</template>
