<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { ElMessage, FormInstance } from "element-plus";

import {
  addSealBorrow,
  updateSealBorrow,
  getSealBorrowDetail,
  approveSealBorrow,
  getNVsByCatalogKey
} from "@/api/seal";
import { emitter } from "@/utils/mitt";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { userDepartmentStoreHook } from "@/store/modules/department";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

enum AuditResult {
  agree,
  refuse,
  back
}
const { getRootDeptList } = userDepartmentStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  sealType: "", //用章类型
  sealTypeList: [],
  purpose: "", //申请事由
  company: "", //部门
  user: "",
  remark: "", //备注
  comment1: ""
};
const rules = {
  company: [{ required: true, message: "请选择公司", trigger: "change" }],
  // sealTypeList: [{ required: true, message: "请选择类别", trigger: "change" }],
  purpose: [{ required: true, message: "请输入用途", trigger: "blur" }]
};
const validateAuditForm = (rule: any, value: any, callback: any) => {
  if (!value && auditResult.value != AuditResult.agree) {
    return callback(new Error("审核意见不能为空"));
  } else {
    callback();
  }
};

//审核表单验证规则
const auditFormRules = {
  comment1: [
    {
      message: "审核意见不能为空",
      validator: validateAuditForm
    }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});

const catalogLicense = ref([]); //借阅类型
const reviewers = ref([]); //审批人员
const showType = ref("apply");
const formVisible = ref(false);
const formLoading = ref(false);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "apply"
    ? "添加印章申请"
    : showType.value == "edit"
      ? "编辑印章申请"
      : showType.value == "read"
        ? "查看印章申请"
        : showType.value == "audit"
          ? "审核印章申请"
          : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  //获取借阅类型
  getCatalog();
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.sealTypeList = [];
  showType.value = _type;
  activeName.value = "baseInfo";
  if (_formData) {
    await getDetail(_formData.id);
  }
};
defineExpose({ show });

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getSealBorrowDetail({ id });
  formData.value = data || {};
  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });
  if (data) {
    reviewers.value = data.reviewers || [];
    catalogLicense.value = data.sealTypeList || [];
  }
  formLoading.value = false;
}

// 获取印章借阅类型
const getCatalog = async () => {
  const { data } = await getNVsByCatalogKey({
    catalogKey: "OA_SealType"
  });
  catalogLicense.value = data || [];
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "apply") {
        const { code, message } = await addSealBorrow(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { code, message } = await updateSealBorrow(formData.value);
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

// 提交审核表单
const submitAuditForm = async (
  formEl: FormInstance | undefined,
  _auditResult: AuditResult
) => {
  if (!formEl) return;
  auditResult.value = _auditResult;
  formEl.validate(valid => {
    if (valid) {
      formLoading.value = true;
      approveSealBorrow({
        id: formData.value.id,
        isApproved:
          _auditResult == AuditResult.agree
            ? true
            : _auditResult == AuditResult.refuse
              ? false
              : false,
        isReturnBack: _auditResult == AuditResult.back ? true : false,
        comment1: auditData.value.comment1
      })
        .then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
            emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
          }
        })
        .catch()
        .finally(() => {
          formLoading.value = false;
        });
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
  formVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="680"
    :class="showType == 'apply' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="closeDialog"
  >
    <AuditSteps
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      :reviewers="reviewers"
      :marginWidth="15"
    />
    <el-tabs
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      v-model="activeName"
      type="card"
      tab-position="top"
    >
      <el-tab-pane label="基础信息" name="baseInfo" />
      <el-tab-pane label="审核信息" name="auditInfo" />
    </el-tabs>
    <!-- 表单内容 -->
    <ReadDescriptions
      v-if="showType == 'audit' || showType == 'read' || showType == 'undo'"
      v-show="activeName == 'baseInfo'"
      title=""
      :columnData="tableColumnData"
      :rowData="formData"
      :column="2"
      class="mb-2"
    />
    <el-form
      v-else
      v-show="activeName == 'baseInfo'"
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="公司/单位" prop="company">
            <el-select
              v-model="formData.company"
              clearable
              placeholder="请选择"
              :disabled="showType == 'audit' || showType == 'read'"
              ><el-option
                v-for="item in rootDepartment"
                :key="item.id"
                :label="item.fullName"
                :value="item.fullName"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="用章类型" prop="sealTypeList">
            <el-select
              v-model="formData.sealTypeList"
              :collapse-tags="true"
              :collapse-tags-tooltip="true"
              multiple
              filterable
              :reserve-keyword="true"
              :placeholder="
                showType == 'audit' || showType == 'read' ? '' : '请选择'
              "
              :disabled="showType == 'audit' || showType == 'read'"
            >
              <el-option
                v-for="item in catalogLicense"
                :key="item.name"
                :label="item.value"
                :value="item.value"
              />
            </el-select>
            <!-- <el-input v-else v-model="formData.sealType" readonly /> -->
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="用途" prop="purpose">
            <el-input
              v-model="formData.purpose"
              :placeholder="
                showType == 'audit' || showType == 'read' ? '' : '请输入'
              "
              :readonly="showType == 'audit' || showType == 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              :rows="2"
              type="textarea"
              :placeholder="
                showType == 'audit' || showType == 'read' ? '' : '请输入'
              "
              :readonly="showType == 'audit' || showType == 'read'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <AuditForm
      v-if="
        (showType == 'read' || showType == 'undo' || showType == 'audit') &&
        activeName == 'auditInfo'
      "
      :showType="showType"
      :reviewers="reviewers"
    />
    <el-form
      v-if="showType == 'audit'"
      ref="auditFormRef"
      class="audit-form"
      :class="{ 'mt-4': activeName == 'baseInfo' }"
      :model="auditData"
      :rules="auditFormRules"
      :inline="false"
      :label-width="activeName == 'auditInfo' ? '92px' : '100px'"
    >
      <el-form-item label="审核意见" prop="comment1">
        <el-input
          v-model.trim="auditData.comment1"
          type="textarea"
          :rows="2"
          show-word-limit
          :maxlength="255"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType == 'apply'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >提交
      </el-button>
      <el-button
        v-if="showType == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="primary"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.agree)"
        >同意
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="danger"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.refuse)"
        >拒绝
      </el-button>
      <el-button
        v-if="false && showType == 'audit'"
        type="success"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >
    </template>
  </el-dialog>
</template>
