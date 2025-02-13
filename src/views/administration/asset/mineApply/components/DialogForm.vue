<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { ElMessage, FormInstance } from "element-plus";

import { Cancel, GetApply } from "@/api/asset";
import { useNav } from "@/layout/hooks/useNav";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  staffName: "",
  mobile: "",
  deptName: "",
  assetsId: "",
  assetsCode: "",
  assetsName: "",
  reason: "",
  qty: "",
  comment: "",
  applyTime: "",
  applyStatus: "",
  applyStatusExpr: "",
  img: [],
  canCancel: "",
  canApprove: "",
  currentReviewerId: "",
  reviewerDeptName: "",
  reviewerName: "",
  reviewerId: "",
  cancelReason: "",
  applyReason: ""
};
const fromRules = {
  cancelReason: [{ required: true, message: "请输入撤回理由", trigger: "blur" }]
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
const emit = defineEmits(["update:visible", "search"]);

enum AuditResult {
  agree,
  refuse,
  back
}

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const reviewers = ref([]); //审批人员
const showType = ref("add");
const formData = ref(null);
const formVisible = ref(false);
const formLoading = ref(false);
const { staffName } = useNav(); //用户名
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const canceFormRef = ref<FormInstance>();
const tableColumnData = ref([]);

const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "undo"
    ? "撤回申请"
    : showType.value == "edit"
      ? "编辑申请"
      : showType.value == "read"
        ? "查看申请"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    showType.value = _type;
    await getDetail(_formData.id);
  } else {
    showType.value = "add";
  }
  formData.value.staffName = staffName;
  formVisible.value = true;
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetApply({ id });
  formData.value = data || {};
  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });
  if (data) {
    reviewers.value = data.reviewers || [];
  }
  formLoading.value = false;
}

//撤回表单
const submitFormQuery = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await Cancel({
        id: formData.value.id,
        cancelReason: formData.value.cancelReason
      });
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
        resetForm(formEl);
        emit("search");
      }
    }
  });
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  reviewers.value = [];
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
  activeName.value = "baseInfo";
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="704"
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
      label-width="92px"
      :rules="fromRules"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="资产名称" prop="assetsName">
            <el-input
              v-model="formData.assetsName"
              :readonly="showType == 'undo' || showType == 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="资产编号" prop="assetsCode">
            <el-input
              v-model="formData.assetsCode"
              :readonly="showType == 'undo' || showType == 'read'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="申请数量" prop="qty">
            <el-input
              v-model="formData.qty"
              :readonly="showType == 'undo' || showType == 'read'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="申请时间" prop="applyTime">
            <el-date-picker
              v-model="formData.applyTime"
              :disabled="showType == 'undo' || showType == 'read'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="申请事由" prop="applyReason">
            <el-input
              v-model="formData.applyReason"
              :readonly="showType == 'undo' || showType == 'read'"
            />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0">
            <el-form-item label="备注" prop="leaveType">
              <el-input
                v-model="formData.leaveType"
                :disabled="showType == 'undo' || showType == 'read'"
              />
            </el-form-item>
          </el-col> -->
        <el-col :span="24" :offset="0">
          <el-form-item
            v-if="
              showType == 'undo' ||
              (showType == 'read' && formData.applyStatusExpr == '取消')
            "
            label="撤回理由"
            prop="cancelReason"
          >
            <el-input
              v-model="formData.cancelReason"
              :readonly="showType == 'read'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-form
      v-if="showType == 'undo'"
      v-show="activeName == 'baseInfo'"
      ref="canceFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="68px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item
            v-if="
              showType == 'undo' ||
              (formData.applyStatusExpr == '已撤销' && showType == 'read')
            "
            label="撤回理由"
            prop="cancelReason"
          >
            <el-input
              v-model="formData.cancelReason"
              :rows="2"
              placeholder="请输入"
              type="textarea"
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
      :label-width="activeName == 'auditInfo' ? '92px' : '92px'"
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
      <el-button v-if="showType == 'read'" @click="formVisible = false"
        >关闭</el-button
      >
      <el-button
        v-if="showType == 'edit' || showType == 'undo'"
        @click="formVisible = false"
        >取消</el-button
      >
      <!-- <el-button
        v-if="showType == 'edit'"
        type="primary"
        @click="submitFormApproval(ruleFormRef, true, false)"
        >确定
      </el-button> -->
      <el-button
        v-if="showType == 'undo'"
        type="danger"
        @click="submitFormQuery(canceFormRef)"
        >撤回</el-button
      >
    </template>
  </el-dialog>
</template>
