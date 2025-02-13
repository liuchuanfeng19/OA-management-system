<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
// import dayjs from "dayjs";
import { ref, computed } from "vue";
import {
  CreateMaintain,
  UpdateMaintain,
  GetMaintain,
  GetListNV,
  Get,
  GetCarMaintainTypeNV
} from "@/api/vehicle";
import { ElMessage, FormInstance } from "element-plus";
import moment from "moment";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  carInformationId: "",
  carName: "",
  carLicensePlate: "",
  maintainType: 0,
  maintainContent: "",
  maintainDate: "",
  createTime: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const allCarTypes = ref([]); //车辆信息
const CarMaintainType = ref([]); //车辆状态(保养/维修)
const { staffName } = useNav(); //用户名
const type = ref("add");

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  //加载车辆;
  GetCarStatus();
  getcarTypes();
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
  } else {
    // fileList.value = [];
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
    formData.value.maintainDate = moment().format("YYYY/MM/DD");
  }
  formData.value.staffName = staffName;
  formVisible.value = true;
};
defineExpose({ show });

const rules = {
  maintainType: [{ required: true, message: "请选择类型", trigger: "change" }],
  maintainContent: [
    { required: true, message: "请输入检修内容", trigger: "change" }
  ],
  maintainDate: [
    { required: true, message: "请选择检修日期", trigger: "change" }
  ],
  createTime: [{ required: true, message: "请选择创建日期", trigger: "change" }]
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加保养/维修记录"
    : type.value == "edit"
      ? "编辑保养/维修记录"
      : type.value == "query"
        ? "查看保养/维修记录"
        : "";
});

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateMaintain(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await CreateMaintain(formData.value);
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
  const { data } = await GetMaintain({ id });
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

//获取状态(保养/维修)
async function GetCarStatus() {
  const { data } = await GetCarMaintainTypeNV({ includeAll: false });
  CarMaintainType.value = data || {};
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
      label-width="110px"
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
          <el-form-item label="类型" prop="maintainType">
            <el-select
              v-model="formData.maintainType"
              :style="{ width: '100%' }"
              :disabled="type == 'query'"
              :placeholder="type == 'query' ? '' : '请选择'"
            >
              <el-option
                v-for="item in CarMaintainType"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="保养/维修日期" prop="maintainDate">
            <el-date-picker
              v-model="formData.maintainDate"
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
          <el-form-item label="保养/维修内容" prop="maintainContent">
            <el-input
              v-model="formData.maintainContent"
              :readonly="type == 'query'"
              :rows="3"
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
