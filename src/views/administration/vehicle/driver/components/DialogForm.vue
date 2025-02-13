<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { ElMessage, FormInstance } from "element-plus";

import {
  createDriver,
  updateDriver,
  getDriverDetail,
  getDriverStatusList
} from "@/api/vehicle";
import { GetSimpleStaff } from "@/api/staff";
import { getConfigListByKey } from "@/api/config";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  driverName: "",
  drivePhone: "",
  driveIdCard: "",
  driverLicenceDocNo: "",
  driverLicenceCarNo: "",
  driverLicenceType: "C1",
  driverAddress: "",
  driverStatus: 0,
  driverStatusExpr: "",
  contactAddress: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const formLoading = ref(false);
const alldriverstatus = ref([]); //驾驶员状态列表
const driverLicense = ref([]); //驾驶证类型
const type = ref("add");
const { staffListNV } = storeToRefs(userStaffStoreHook());

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  //加载驾驶员状态;
  getdriver();
  getStaffListNV();
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formVisible.value = true;
};
defineExpose({ show });

const rules = {
  staffId: [{ required: true, message: "请选择驾驶员", trigger: "change" }],
  drivePhone: [
    { required: true, message: "请输入驾驶员手机号", trigger: "change" }
  ],
  driveIdCard: [
    { required: true, message: "请输入驾驶员身份证号", trigger: "change" }
  ],

  driverStatus: [
    { required: true, message: "请选择司机状态", trigger: "change" }
  ],
  contactAddress: [
    { required: true, message: "请输入驾驶员联系地址", trigger: "change" }
  ]
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加驾驶员"
    : type.value == "edit"
      ? "编辑驾驶员"
      : type.value == "query"
        ? "查看驾驶员"
        : "";
});

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await updateDriver(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await createDriver(formData.value);
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
  const { data } = await getDriverDetail({ id });
  formData.value = data || {};
  formLoading.value = false;
}

// 根据id获取人员详情数据;
async function SimpleStaff(val) {
  formLoading.value = true;
  const { data } = await GetSimpleStaff({ staffId: val });
  formData.value.driveIdCard = data.idCard;
  formData.value.drivePhone = data.mobile;
}

//司机状态
async function getdriver() {
  const { data } = await getDriverStatusList();
  alldriverstatus.value = data;
}

// 获取驾驶证类型
const getLicense = async () => {
  const { data } = await getConfigListByKey({
    catalogKey: "OACarDriverLicenceType"
  });
  driverLicense.value = data || [];
};

//驾驶证类型
getLicense();
//加载驾驶员状态;
getdriver();
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="660"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="姓名" prop="staffId">
            <el-select
              v-model="formData.staffId"
              filterable
              :disabled="type == 'query'"
              :placeholder="type == 'query' ? '' : '请选择'"
              :style="{ width: '100%' }"
              @change="SimpleStaff"
              ><el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="电话" prop="drivePhone">
            <el-input v-model="formData.drivePhone" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="身份证" prop="driveIdCard">
            <el-input v-model="formData.driveIdCard" readonly />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="驾驶证号" prop="driverLicenceCarNo">
            <el-input
              v-model="formData.driverLicenceCarNo"
              :placeholder="type == 'query' ? '' : '请输入'"
              :readonly="type == 'query'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="驾驶证类型" prop="driverLicenceType">
            <el-select
              v-model="formData.driverLicenceType"
              :disabled="type == 'query'"
              :placeholder="type == 'query' ? '' : '请选择'"
              :style="{ width: '100%' }"
              ><el-option
                v-for="item in driverLicense"
                :key="item.configKey"
                :label="item.configName"
                :value="item.configValue"
            /></el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="驾驶员状态" prop="driverStatus">
            <el-select
              :disabled="type == 'query'"
              v-model="formData.driverStatus"
              placeholder="请选择"
              :style="{ width: '100%' }"
              ><el-option
                v-for="item in alldriverstatus"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col> -->

        <el-col :span="24" :offset="0">
          <el-form-item label="驾驶员联系地址" prop="contactAddress">
            <el-input
              v-model="formData.contactAddress"
              :readonly="type == 'query'"
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
