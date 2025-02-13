<script setup lang="ts">
import _ from "lodash";
import { ElMessage, FormInstance } from "element-plus";
import { ref, computed } from "vue";
import { addAttendWorkDay, updateAttendWorkDay } from "@/api/attendance";
const emit = defineEmits(["search"]);
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  workDayName: "",
  workDate: "",
  remark: ""
};
const rules = {
  workDayName: [{ required: true, message: "请输入补班名称", trigger: "blur" }],
  workDate: [{ required: true, message: "请选择日期", trigger: "change" }]
};
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const type = ref("add");
const formData = ref(null);
const requesting = ref(false);
const formVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add" ? "添加" : type.value == "edit" ? "编辑" : "";
});
// 子组件暴露给父组件调用的方法
const show = (_type, data) => {
  formVisible.value = true;
  type.value = _type;
  formData.value = { ...INITIAL_DATA };
  if (_type == "edit") {
    formData.value = { ...data };
  }
};
defineExpose({ show });
// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      requesting.value = true;
      if (type.value == "add") {
        const { code, message } = await addAttendWorkDay(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { code, message } = await updateAttendWorkDay(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      }
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
    :width="450"
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
          <el-form-item label="补班名称" prop="workDayName">
            <el-input v-model="formData.workDayName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="补班日期" prop="workDate">
            <el-date-picker
              v-model="formData.workDate"
              placeholder="请选择"
              type="date"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              placeholder="请输入"
              type="textarea"
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
