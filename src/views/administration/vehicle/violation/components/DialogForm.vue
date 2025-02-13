<script setup lang="ts">
import moment from "moment";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { ElMessage, FormInstance } from "element-plus";

import {
  CreateIllegal,
  UpdateIllegal,
  GeIllegal,
  Get,
  GetListNV
} from "@/api/vehicle";
import { useNav } from "@/layout/hooks/useNav";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  carInformationId: "",
  illegalAction: "",
  illegalTime: "",
  illegalAddress: "",
  illegalAmount: 0,
  illegalPoint: "",
  illegalPunishUnit: "",
  illegalPunishTime: "",
  staffId: "",
  lateFee: 0,
  staffName: "",
  contactAddress: "",
  createTime: "",
  carName: ""
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
const { staffListNV } = storeToRefs(userStaffStoreHook());

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  //加载车辆;
  getcarTypes();
  getStaffListNV();
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
    formData.value.illegalTime = moment().format("YYYY/MM/DD");
    formData.value.illegalPunishTime = moment().format("YYYY/MM/DD");
  }
  formData.value.staffName = staffName;
  formVisible.value = true;
};
defineExpose({ show });

const rules = {
  carInformationId: [
    { required: true, message: "请选择车辆", trigger: "change" }
  ],
  illegalAddress: [
    { required: true, message: "请输入违章地点", trigger: "change" }
  ],
  illegalAction: [
    { required: true, message: "请输入违章行为", trigger: "change" }
  ],
  illegalTime: [
    { required: true, message: "请选择违章日期", trigger: "change" }
  ],
  illegalPunishTime: [
    { required: true, message: "请选择处罚日期", trigger: "change" }
  ],
  staffId: [{ required: true, message: "请选择违章人", trigger: "change" }],
  createTime: [{ required: true, message: "请选择创建日期", trigger: "change" }]
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加违章记录"
    : type.value == "edit"
      ? "编辑违章记录"
      : type.value == "query"
        ? "查看违章记录"
        : "";
});

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateIllegal(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await CreateIllegal(formData.value);
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
  const { data } = await GeIllegal({ id });
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
    :width="576"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="78px"
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
        <el-col :span="12" :offset="0">
          <el-form-item label="车辆名称" prop="carName">
            <el-input v-model="formData.carName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="违章行为" prop="illegalAction">
            <el-input
              v-model="formData.illegalAction"
              :placeholder="type == 'query' ? '' : '请输入'"
              :readonly="type == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="违章日期" prop="illegalTime">
            <el-date-picker
              v-model="formData.illegalTime"
              :placeholder="type == 'query' ? '' : '请选择'"
              :disabled="type == 'query'"
              format="YYYY-MM-DD"
              :style="{ width: '100%' }"
              type="date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="违章地点" prop="illegalAddress">
            <el-input
              :disabled="type == 'query'"
              v-model="formData.illegalAddress"
            />
          </el-form-item>
        </el-col> -->
        <el-col :span="12" :offset="0">
          <el-form-item label="罚款金额" prop="illegalAmount">
            <el-input
              v-model="formData.illegalAmount"
              :placeholder="type == 'query' ? '' : '请输入'"
              :readonly="type == 'query'"
              type="number"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="记分" prop="illegalPoint">
            <el-input
              v-model="formData.illegalPoint"
              type="number"
              :placeholder="type == 'query' ? '' : '请输入'"
              :readonly="type == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="处罚机关" prop="illegalPunishUnit">
            <el-input
              v-model="formData.illegalPunishUnit"
              :placeholder="type == 'query' ? '' : '请输入'"
              :readonly="type == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="处罚日期" prop="illegalPunishTime">
            <el-date-picker
              v-model="formData.illegalPunishTime"
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
          <el-form-item label="违章人员" prop="staffId">
            <el-select
              v-model="formData.staffId"
              filterable
              :disabled="type == 'query'"
              :placeholder="type == 'query' ? '' : '请选择'"
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="滞纳金" prop="lateFee">
            <el-input
              v-model="formData.lateFee"
              :placeholder="type == 'query' ? '' : '请输入'"
              :readonly="type == 'query'"
              type="number"
            />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="创建日期" prop="createTime">
            <el-date-picker
              :disabled="type == 'query'"
              v-model="formData.createTime"
              format="YYYY-MM-DD"
              :style="{ width: '100%' }"
              type="date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col> -->
        <el-col :span="24" :offset="0">
          <el-form-item label="违章地点" prop="illegalAddress">
            <el-input
              v-model="formData.illegalAddress"
              :readonly="type == 'query'"
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
