<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";

import type { FormInstance } from "element-plus";

import { GetListNVForApp } from "@/api/projectWinBid";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "",
  projectName: "",
  staffId: "",
  staffName: "",
  deptId: "",
  deptName: "",
  mobile: "",
  carLicensePlate: "",
  carName: "",
  returnTime: "",
  projectDuty: "",
  planPickTime: "",
  returnStatus: "",
  returnStatusName: "",
  planReturnTime: "",
  projectDutyMobile: ""
};

// 表单校验规则
const fromRules = {
  productCode: [
    { required: true, message: "产品编码不能为空", trigger: "change" }
  ],
  bomCode: [{ required: false, message: "BOM编码不能为空", trigger: "blur" }],
  mrpCalcNum: [
    { required: true, message: "MRP计算数不能为空", trigger: "blur" }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
// const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableData = ref([]);
// const loading = ref(false);
const showType = ref("add");
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const projectWinBidNV = ref([]); //获取中标项目列表

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "query" ? "查看项目用车" : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  tableData.value = [];
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };

  if (_formData) {
    formData.value = Object.assign({}, _formData);

    handleProjectChange(_formData.projectId);
    tableData.value = _formData.rows;
    // getBomItems();
  }
};
defineExpose({ show });

//获取中标项目列表NV;
async function getProjectWinBidNV() {
  const { data } = await GetListNVForApp();
  if (data) {
    projectWinBidNV.value = data;
  }
}
function handleProjectChange(val) {
  const project = projectWinBidNV.value.find(item => item.id == val);
  formData.value.projectName = project.fullName;
  formData.value.projectDuty = project.dutyStaffName;
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value);
};
getProjectWinBidNV();
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="750"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="项目名称" prop="projectName">
            <el-input v-model="formData.projectName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="项目负责人" prop="projectDuty">
            <el-input v-model="formData.projectDuty" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="项目负责人电话" prop="projectDutyMobile">
            <el-input v-model="formData.projectDutyMobile" readonly />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="车辆名称" prop="carName">
            <el-input v-model="formData.carName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="车牌号" prop="carLicensePlate">
            <el-input v-model="formData.carLicensePlate" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="申请人" prop="staffName">
            <el-input v-model="formData.staffName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="申请人电话" prop="mobile">
            <el-input v-model="formData.mobile" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="借车时间" prop="planPickTime">
            <el-date-picker
              v-model="formData.planPickTime"
              type="date"
              :clearable="false"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              readonly
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="预计还车时间" prop="planReturnTime">
            <el-date-picker
              v-model="formData.planReturnTime"
              type="date"
              :clearable="false"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              readonly
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <!-- <el-button
        v-if="showType != 'read'"
        type="primary"
        :loading="loading"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      > -->
    </template>
  </el-dialog>
</template>
