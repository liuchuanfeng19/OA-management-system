<script setup lang="ts">
import _ from "lodash";
import { ElMessage, FormInstance } from "element-plus";
import { ref, computed } from "vue";
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["wifiCallBack"]);
// 表单模型
const INITIAL_DATA = {
  macs: "",
  name: ""
};
const rules = {
  name: [{ required: true, message: "请输入WiFi名称", trigger: "blur" }],
  macs: [{ required: true, message: "请输入MAC地址", trigger: "blur" }]
};
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const formData = ref(null);
const requesting = ref(false);
const formVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "添加";
});

// 子组件暴露给父组件调用的方法
const show = () => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
};
defineExpose({ show });
// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      requesting.value = true;
      ElMessage.success("添加成功");
      formVisible.value = false;
      const param = {
        mac: formData.value.macs,
        name: formData.value.name
      };
      resetForm(formEl);
      emit("wifiCallBack", param);
      requesting.value = false;
    }
  });
}, 300);
// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="540"
    draggable
    @close="closeDialog"
  >
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="90px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="WiFi名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入WiFi名称" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="MAC地址" prop="macs">
            <el-input
              v-model="formData.macs"
              placeholder="请输入WiFi MAC地址"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="formVisible = false">取消</el-button>
      <el-button
        :loading="requesting"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >提交
      </el-button>
    </template>
  </el-dialog>
</template>
