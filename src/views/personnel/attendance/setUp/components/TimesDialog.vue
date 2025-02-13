<script setup lang="ts">
import _ from "lodash";
import { ElMessage, FormInstance } from "element-plus";
import { ref } from "vue";
//上下班时间回调
const emit = defineEmits(["timeSetCallBack"]);
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  stimes: "",
  etimes: ""
};
const rules = {
  stimes: [{ required: true, message: "请选择上班时间", trigger: "change" }],
  etimes: [{ required: true, message: "请选择下班时间", trigger: "change" }]
};
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const formData = ref(null);
const requesting = ref(false);
const formVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = ref("");

// 子组件暴露给父组件调用的方法
const show = _formData => {
  dialogTitle.value = _formData.weekday;
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_formData.period != null && _formData.period != "") {
    const dates = _formData.period.split("-");
    formData.value.stimes = dates[0];
    formData.value.etimes = dates[1];
  }
};
defineExpose({ show });
// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      requesting.value = true;
      ElMessage.success("更新成功");
      formVisible.value = false;
      const times = formData.value.stimes + "-" + formData.value.etimes;
      resetForm(formEl);
      emit("timeSetCallBack", times);
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
          <el-form-item label="上班时间" prop="stimes">
            <el-time-picker
              v-model="formData.stimes"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="请选择"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="下班时间" prop="etimes">
            <el-time-picker
              v-model="formData.etimes"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="请选择"
              style="width: 100%"
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
