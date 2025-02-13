<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import {
  CreateWorkExperience,
  UpdateWorkExperience,
  getStaffList
} from "@/api/personnel";
import { ElMessage, FormInstance } from "element-plus";
import moment from "moment";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);
// 表单校验规则
const rules = {
  // timeRange: [{ required: true, validator: validateTimeRange, trigger: "blur" }]
  companyName: [{ required: true, message: "请输入公司名称", trigger: "blur" }],
  jobTitle: [{ required: true, message: "请输入职位", trigger: "blur" }],
  startDate: [{ required: true, message: "请输入入职日期", trigger: "blur" }],
  endDate: [{ required: true, message: "请输入离职日期", trigger: "blur" }]
};
// 表单校验规则;
// const validateTimeRange = (rule: any, value: any, callback: any) => {
//   if (!timeRange.value || timeRange.value.length < 2) {
//     callback(new Error("请选择时间段"));
//   } else {
//     callback();
//   }
// };

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
const dialogTitle = computed(() => {
  return props.data.type == "add"
    ? "添加工作经历"
    : props.data.type == "edit"
      ? "编辑工作经历"
      : "";
});

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
    if (!formData.value.startDate && !formData.value.endDate) {
      formData.value.startDate = moment().format("YYYY/MM/DD");
      formData.value.endDate = moment().format("YYYY/MM/DD");
    }
  }
);

const submitForm = (formEl: FormInstance | undefined) => {
  const data = Object.assign({}, formData.value);
  delete data.type;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (props.data.type == "add") {
        const { code, message } = await CreateWorkExperience(data);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (props.data.type == "edit") {
        const { code, message } = await UpdateWorkExperience(data);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
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
// 日期缺省
formData.value.startDate = new Date(+new Date() + 8 * 3600 * 1000)
  .toISOString()
  .replace(/T/g, " ")
  .replace(/\.[\d]{3}Z/, "");
formData.value.endDate = new Date(+new Date() + 8 * 3600 * 1000)
  .toISOString()
  .replace(/T/g, " ")
  .replace(/\.[\d]{3}Z/, "");
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="580"
    draggable
    :before-close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="公司名称" prop="companyName">
            <el-input v-model="formData.companyName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="职位" prop="jobTitle">
            <el-input v-model="formData.jobTitle" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="薪资" prop="salary">
            <el-input
              v-model="formData.salary"
              type="number"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
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
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
