<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { getStaffList, ConfirmStaffOn } from "@/api/personnel";
import { ElMessage, FormInstance } from "element-plus";
import moment from "moment";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);
// 表单校验规则
const rules = {
  onRealDate: [
    { required: true, message: "请输入实际转正日期", trigger: "blur" }
  ],
  onPlanDate: [
    { required: true, message: "请输入计划转正日期", trigger: "blur" }
  ]
};

// vue3 在 <script setup> 中使用 defineProps API 来声明 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(props.data);
const formLoading = ref(false);
// const timeRange = ref([]); //时间段
// console.log(formData.value, "formData");
// vue3 使用从vue导入的computed函数创建计算属性

// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => formVisible.value,
  val => {
    emit("update:visible", val);
  }
);
watch(
  () => props.visible,
  val => {
    formVisible.value = val;
  }
);
watch(
  () => props.data,
  val => {
    formData.value = val;
    if (!formData.value.opDate) {
      formData.value.opDate = moment().format("YYYY/MM/DD");
    }
    //日期缺省

    formData.value.onRealDate = moment().format("YYYY/MM/DD");
  }
);

const submitForm = (formEl: FormInstance | undefined, flag: boolean) => {
  const data = Object.assign({}, formData.value);
  data.isConfirmed = flag;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await ConfirmStaffOn(data);
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
        resetForm(formEl);
        emit("search");
      } else {
        ElMessage.error(message);
      }
    }
  });
};

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

// mounted周期函数
onMounted(async () => {
  const { data = {} } = await getStaffList({
    id: props.data.staffId
  });
  formData.value = data.data;
});
</script>

<template>
  <el-dialog
    v-model="formVisible"
    title="人员转正"
    :width="640"
    draggable
    :before-close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="员工姓名" prop="staffName">
            <el-input v-model="formData.staffName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="员工编号" prop="staffCode">
            <el-input v-model="formData.staffCode" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="部门名称" prop="deptName">
            <el-input v-model="formData.deptName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="岗位" prop="jobTitle">
            <el-input v-model="formData.jobTitle" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="入职日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              disabled
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="试用期(月)" prop="probationPeriod">
            <el-input v-model="formData.probationPeriod" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="计划转正日期" prop="onPlanDate">
            <el-date-picker
              v-model="formData.onPlanDate"
              disabled
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="实际转正日期" prop="onRealDate">
            <el-date-picker
              v-model="formData.onRealDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="转正备注" prop="onComment">
            <el-input
              v-model="formData.onComment"
              type="textarea"
              placeholder="请输入"
              maxlength="256"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef, true)"
        >同意</el-button
      >
    </template>
  </el-dialog>
</template>
