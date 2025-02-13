<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { SaveStaffBenefits, getStaffList } from "@/api/personnel";
import { ElMessage, FormInstance } from "element-plus";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);
// 表单校验规则
const rules = {
  bankName: [{ required: true, message: "请输入所在银行", trigger: "blur" }],
  accountNo: [{ required: true, message: "请输入工资账号", trigger: "blur" }],
  housingFundNo: [
    { required: true, message: "请输入公积金账号", trigger: "blur" }
  ],
  socialInsureNo: [
    { required: true, message: "请输入社保账号", trigger: "blur" }
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
// console.log(formData.value, "formData");
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return props.data.type == "add"
    ? "添加薪酬福利"
    : props.data.type == "edit"
      ? "编辑薪酬福利"
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
    console.log(formData.value, "val");
  }
);

const submitForm = (formEl: FormInstance | undefined) => {
  const data = Object.assign({}, formData.value);
  delete data.type;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (props.data.type == "add") {
        const { code, message } = await SaveStaffBenefits(data);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (props.data.type == "edit") {
        const { code, message } = await SaveStaffBenefits(data);
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
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="460"
    draggable
    :before-close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="92px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="所在银行" prop="bankName">
            <el-input v-model="formData.bankName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="工资账号" prop="accountNo">
            <el-input v-model="formData.accountNo" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="公积金账号" prop="housingFundNo">
            <el-input v-model="formData.housingFundNo" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="社保账号" prop="socialInsureNo">
            <el-input v-model="formData.socialInsureNo" placeholder="请输入" />
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
