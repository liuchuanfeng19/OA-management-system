<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { ElMessage, type FormInstance } from "element-plus";
import { ReturnBack } from "@/api/vehicle";
import { getUserInfo } from "@/api/user";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  carName: "",
  carLicensePlate: "",
  returnStaffId: "" //还车人
};

// 表单校验规则
const fromRules = {
  returnStaffId: [
    {
      required: true,
      message: "请选择还车人",
      trigger: "change"
    }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const dialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const showType = ref("add");
const { staffListNV } = storeToRefs(userStaffStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加示例"
    : showType.value == "return"
      ? "还车"
      : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  getStaffListNV();
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  getUser();
  if (_formData) {
    formData.value = { ..._formData };
  }
};
defineExpose({ show });

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await ReturnBack(formData.value);
      if (code == 0) {
        ElMessage.success(message);
        dialogVisible.value = false;
        resetForm(formEl);
        emit("search");
      }
    }
  });
};

//获取当前登录人员id
const getUser = async () => {
  const { data } = await getUserInfo();
  formData.value.returnStaffId = data.staffId;
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="332"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="96px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="还车人员" prop="returnStaffId">
            <el-select
              v-model="formData.returnStaffId"
              placeholder="请选择"
              :style="{ width: '100%' }"
              filterable
              :disabled="showType == 'read'"
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
        <el-col :span="24" :offset="0">
          <el-form-item label="车辆名称" prop="carName">
            <el-input v-model="formData.carName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="车辆牌照" prop="carLicensePlate">
            <el-input v-model="formData.carLicensePlate" readonly />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'read'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
