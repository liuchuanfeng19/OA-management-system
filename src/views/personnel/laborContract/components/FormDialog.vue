<script setup lang="ts">
import moment from "moment";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";

import {
  getStaffContract,
  addStaffContract,
  editStaffContract
} from "@/api/staffContract";
import { GetSimpleStaff } from "@/api/staff";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined, //主键ID
  scStaffId: "", //人员Id
  scSignYear: "", //签订时间（年）
  scContractCode: "", //合同编号
  scCompanyName: "", //签订公司(只读)
  scStaffCode: "", //员工编号(只读)
  scStaffName: "", //姓名(只读)
  scStartTime: "", //合同起始
  scEndTime: "", //合同终止
  scAmount: 0, //合同金额
  scDeptName: "", //部门(只读)
  scJobTitle: "", //岗位(只读)
  scSocialBase: 0, //社保基数
  scHouseBase: 0, //公积金基数
  scReason: "", //签订原因
  remark: "" //备注
};

// 表单校验规则
const fromRules = {
  scStaffId: [{ required: true, message: "请输入姓名", trigger: "change" }],
  scContractCode: [
    { required: true, message: "请输入合同编号", trigger: "blur" }
  ],
  scStartTime: [
    { required: true, message: "请选择合同起始日期", trigger: "change" }
  ],
  scEndTime: [
    { required: true, message: "请选择合同终止日期", trigger: "change" }
  ]
};

const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const showType = ref("add");
const formLoading = ref(false);
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const { staffListNV } = storeToRefs(userStaffStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加员工劳动合同"
    : showType.value == "renewal"
      ? "续签员工劳动合同"
      : showType.value == "edit"
        ? "编辑员工劳动合同"
        : showType.value == "read"
          ? "查看员工劳动合同"
          : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  getStaffListNV();
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_showType != "add") {
    getDetail(_formData.id);
  }
};
defineExpose({ show });

// 根据部门Id获取员工列表
const getDetail = async id => {
  const { data = {} } = await getStaffContract({
    id
  });
  formData.value = data || {};
  if (
    showType.value != "read" &&
    (formData.value.scStartTime == null || formData.value.scStartTime == "")
  ) {
    formData.value.scStartTime = moment().format("YYYY-MM-DD");
  }
  if (
    showType.value != "read" &&
    (formData.value.scEndTime == null || formData.value.scEndTime == "")
  ) {
    formData.value.scEndTime = moment().format("YYYY-MM-DD");
  }

  //续签特殊处理
  if (showType.value == "renewal") {
    formData.value.id = undefined;
    const startTime = formData.value.scEndTime;
    formData.value.scStartTime = startTime;
    formData.value.scEndTime = "";
  }
  formLoading.value = false;
};

// 获取员工列表
const getStaffDetail = async () => {
  const { data = {} } = await GetSimpleStaff({
    staffId: formData.value.scStaffId
  });
  formData.value.scCompanyName = data.companyName;
  formData.value.scStaffCode = data.staffCode;
  formData.value.scDeptName = data.deptName;
  formData.value.scJobTitle = data.jobTitleName;
};

function handleStaffChange(val) {
  if (val) {
    const staff = staffListNV.value.find(item => item.value == val);
    formData.value.scStaffName = staff.name;
    getStaffDetail();
    ruleFormRef.value.validateField("scStaffId", () => null);
  } else {
    formData.value.scCompanyName = "";
    formData.value.scStaffCode = "";
    formData.value.scDeptName = "";
    formData.value.scJobTitle = "";
  }
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "add" || showType.value == "renewal") {
        const params = { ...formData.value };
        const { code, message } = await addStaffContract(params);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (showType.value == "edit") {
        const params = { ...formData.value };
        const { code, message } = await editStaffContract(params);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
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
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="660"
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
          <el-form-item label="姓名" prop="scStaffId">
            <el-select
              v-model="formData.scStaffId"
              :disabled="showType != 'add'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
              filterable
              clearable
              @change="handleStaffChange"
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
          <el-form-item label="签订时间（年）" prop="scSignYear">
            <el-date-picker
              v-model="formData.scSignYear"
              type="year"
              :disabled="showType == 'read'"
              format="YYYY"
              value-format="YYYY"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同编号" prop="scContractCode">
            <el-input
              v-model="formData.scContractCode"
              :disabled="showType == 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="签订公司" prop="scCompanyName">
            <el-input
              v-model="formData.scCompanyName"
              placeholder=""
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="员工编号" prop="scStaffCode">
            <el-input v-model="formData.scStaffCode" placeholder="" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同起始" prop="scStartTime">
            <el-date-picker
              v-model="formData.scStartTime"
              type="date"
              :disabled="showType == 'read'"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同终止" prop="scEndTime">
            <el-date-picker
              v-model="formData.scEndTime"
              type="date"
              :disabled="showType == 'read'"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同金额" prop="scAmount">
            <el-input-number
              v-model="formData.scAmount"
              :disabled="showType == 'read'"
              :controls="false"
              :min="0"
              value-on-clear="min"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="部门" prop="scDeptName">
            <el-input v-model="formData.scDeptName" placeholder="" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="岗位" prop="scJobTitle">
            <el-input v-model="formData.scJobTitle" placeholder="" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="社保基数" prop="scSocialBase">
            <el-input-number
              v-model="formData.scSocialBase"
              :disabled="showType == 'read'"
              :controls="false"
              :min="0"
              value-on-clear="min"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="公积金基数" prop="scHouseBase">
            <el-input-number
              v-model="formData.scHouseBase"
              :disabled="showType == 'read'"
              :controls="false"
              :min="0"
              value-on-clear="min"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="签订原因" prop="scReason">
            <el-input
              v-model="formData.scReason"
              :rows="2"
              maxlength="255"
              show-word-limit
              type="textarea"
              :placeholder="showType == 'read' ? '' : '请输入'"
              :disabled="showType == 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              :rows="2"
              maxlength="255"
              show-word-limit
              type="textarea"
              :placeholder="showType == 'read' ? '' : '请输入'"
              :disabled="showType == 'read'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">{{
        showType != "read" ? "取消" : "关闭"
      }}</el-button>
      <el-button
        v-if="showType != 'read'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
:deep(.el-card__header) {
  padding: 10px;
}

:deep(.el-form-item) {
  &:nth-last-of-type(1) {
    margin-right: 0;
  }
}

:deep(.el-table__cell) {
  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
