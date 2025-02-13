<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
// import dayjs from "dayjs";
import { ref, computed } from "vue";
import {
  CreateInsurance,
  UpdateInsurance,
  GetInsurance,
  Get,
  GetListNV
} from "@/api/vehicle";
import { ElMessage, FormInstance } from "element-plus";
import moment from "moment";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  carInformationId: "",
  carName: "",
  carLicensePlate: "",
  insuranceCompany: "",
  insuranceContent: "",
  insuranceNo: "",
  insuranceFee: "",
  startTime: "",
  endTime: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const allCarTypes = ref([]); //车辆信息
const { staffName } = useNav(); //用户名
const type = ref("add");

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  //加载车辆;
  getcarTypes();
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
  } else {
    // fileList.value = [];
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
    formData.value.startTime = moment().format("YYYY/MM/DD");
    formData.value.endTime = moment().format("YYYY/MM/DD");
  }
  formData.value.staffName = staffName;
  formVisible.value = true;
};
defineExpose({ show });

const rules = {
  startTime: [
    { required: true, message: "请选择保险开始日期", trigger: "change" }
  ],
  endTime: [
    { required: true, message: "请选择保险结束日期", trigger: "change" }
  ],
  carInformationId: [
    { required: true, message: "请选择车辆", trigger: "change" }
  ],
  insuranceContent: [
    { required: true, message: "请输入保险内容", trigger: "change" }
  ],
  insuranceCompany: [
    { required: true, message: "请输入保险公司", trigger: "change" }
  ],
  insuranceNo: [
    { required: true, message: "请输入保险单号", trigger: "change" }
  ]
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
  return type.value == "add"
    ? "添加保险记录"
    : type.value == "edit"
      ? "编辑保险记录"
      : type.value == "query"
        ? "查看保险记录"
        : "";
});

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateInsurance(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await CreateInsurance(formData.value);
        if (data) {
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

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetInsurance({ id });
  formData.value = data || {};
  formLoading.value = false;
}

//获取车辆信息（获取id）
async function getcarTypes() {
  const { data } = await GetListNV();
  allCarTypes.value = data;
}

// 根据id获取详情数据;
async function Detail(val) {
  formLoading.value = true;
  const { data } = await Get({ id: val });
  formData.value.carLicensePlate = data.carLicensePlate;
  formData.value.carName = data.carName;
}
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="632"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="106px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="车辆" prop="carInformationId">
            <el-select
              v-model="formData.carInformationId"
              filterable
              :disabled="type == 'query'"
              :placeholder="type == 'query' ? '' : '请选择'"
              :style="{ width: '100%' }"
              @change="Detail"
              ><el-option
                v-for="item in allCarTypes"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="车辆牌照" prop="carLicensePlate">
            <el-input v-model="formData.carLicensePlate" readonly />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="车辆名称" prop="carName">
            <el-input v-model="formData.carName" disabled />
          </el-form-item>
        </el-col> -->
        <el-col :span="12" :offset="0">
          <el-form-item label="保险公司" prop="insuranceCompany">
            <el-input
              v-model="formData.insuranceCompany"
              :placeholder="type == 'query' ? '' : '请输入'"
              :readonly="type == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="保险费用" prop="insuranceFee">
            <el-input
              v-model="formData.insuranceFee"
              :placeholder="type == 'query' ? '' : '请输入'"
              type="number"
              :readonly="type == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="保险单号" prop="insuranceNo">
            <el-input
              v-model="formData.insuranceNo"
              :placeholder="type == 'query' ? '' : '请输入'"
              :readonly="type == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="保险开始日期" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              :placeholder="type == 'query' ? '' : '请选择'"
              :disabled="type == 'query'"
              format="YYYY-MM-DD"
              :style="{ width: '100%' }"
              type="date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="保险结束日期" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              :placeholder="type == 'query' ? '' : '请选择'"
              :disabled="type == 'query'"
              format="YYYY-MM-DD"
              :style="{ width: '100%' }"
              type="date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="保险内容" prop="insuranceContent">
            <el-input
              v-model="formData.insuranceContent"
              :readonly="type == 'query'"
              :rows="5"
              type="textarea"
              :style="{ width: '100%' }"
              :placeholder="type == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button
        v-if="type == 'add' || type == 'edit'"
        @click="formVisible = false"
        >取消</el-button
      >
      <el-button
        v-if="type == 'add' || type == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
      <el-button v-if="type == 'query'" @click="formVisible = false"
        >关闭</el-button
      >
    </template>
  </el-dialog>
</template>
