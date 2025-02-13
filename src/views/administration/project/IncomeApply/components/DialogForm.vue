<script setup lang="ts">
import { ElMessage, type FormInstance } from "element-plus";

import {
  GetListNV,
  GetPrepare,
  UpdateApply,
  CreateApply,
  Approve,
  GetApply
} from "@/api/project";
import { ref, computed } from "vue";
import { emitter } from "@/utils/mitt";
import { useNav } from "@/layout/hooks/useNav";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";

enum AuditResult {
  agree,
  refuse,
  back
}

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projId: "",
  projName: "",
  projCode: "",
  projContractId: "",
  // projContractCode: "",
  // projContractName: "",
  // invoiceAmount: 0,
  // receiveAmount: 0,
  // leftContractAmout: 0,
  staffId: "",
  staffName: "",
  deptName: "",
  mobile: "",
  amount: 0,
  progress: "",
  content: "",
  reason: "",
  applyStatus: 1,
  // applyStatusExpr: "",
  applyTime: "",
  currentReviewerId: "",
  currentReviewerIds: "",
  reviewerIds: "",
  hReviewerIds: "",
  canApprove: true,
  comment: "",
  comment1: "",
  applyStatusExpr: null,
  invoiceAmount: null,
  leftContractAmout: null,
  projContractCode: null,
  projContractName: null,
  receiveAmount: null
  // reviewers: [{id: null, projIncApplyId: null, reviewerId: null, reviewerName: "管理员", deptName: "商务部",…},…]
};

// 表单校验规则;
const rules = {
  projId: [{ required: true, message: "请选择项目名称", trigger: "change" }],

  reason: [{ required: true, message: "请输入申请理由", trigger: "blur" }],
  amount: [{ required: true, message: "请输入本次收款金额", trigger: "blur" }],
  progress: [
    { required: true, message: "请输入本次收款进度", trigger: "blur" }
  ],
  content: [{ required: true, message: "请输入收款内容", trigger: "blur" }],
  // cancelReason: [
  //   { required: true, message: "请填写撤回理由", trigger: "blur" }
  // ],
  comment1: [{ required: true, message: "请填写审批意见", trigger: "blur" }]
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
const stauts = ref("");
const ProData = ref([]); //项目列表
const reviewers = ref([]); //审批人员
const PrepareData = ref([]); //关联数据
const showType = ref("apply");
const { staffName } = useNav(); //用户名
const formVisible = ref(false);
const formLoading = ref(false);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "apply"
    ? "申请项目收入"
    : showType.value == "read"
      ? "查看项目收入"
      : showType.value == "edit"
        ? "编辑项目收入"
        : // : showType.value == "undo"
          // ? "撤回采购"
          showType.value == "audit"
          ? "审核项目收入"
          : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  GetProStatus();
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    showType.value = "apply";
  }
  formData.value.staffName = staffName;
  formVisible.value = true;
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetApply({ id });
  console.log("data", data);
  formData.value = { ...INITIAL_DATA, ...data };
  if (data) {
    reviewers.value = data.reviewers || [];
  }
  formLoading.value = false;
}

//获取项目列表
async function GetProStatus() {
  const { data } = await GetListNV();
  ProData.value = data || {};
}

//根据id获取准备数据
async function GetProPrepare(val) {
  const { data } = await GetPrepare({ projId: val });
  PrepareData.value = data || {};
  if (data) {
    formData.value.projContractId = data.projContractId;
    formData.value.projContractCode = data.projContractCode;
    formData.value.projContractName = data.projContractName;
    formData.value.invoiceAmount = data.invoiceAmount;
    formData.value.receiveAmount = data.receiveAmount;
    formData.value.leftContractAmout = data.leftContractAmout;
    formData.value.staffName = data.staffName;
    formData.value.deptName = data.deptName;
    formData.value.mobile = data.mobile;
  }
}

// 提交申请表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateApply(formData.value);
        if (data) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
        }
      } else {
        const { message, data } = await CreateApply(formData.value);
        if (data) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
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
      Approve({
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
            emit("search");
            emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
            beforeClose();
          }
        })
        .catch()
        .finally(() => {
          formLoading.value = false;
        });
    } else {
      formLoading.value = false;
    }
  });
};

// 提交撤回表单
// const submitFormQuery = async (formEl: FormInstance | undefined) => {
//   if (!formEl) return;
//   formEl.validate(async valid => {
//     if (valid) {
//       const { code,message } = await Cancel({
//         id: formData.value.id,
//         cancelReason: formData.value.cancelReason
//       });
//       if (code==0) {
//         ElMessage.success(message);
//         formVisible.value = false;
//         resetForm(formEl);
//         emit("search");
//       }
//     }
//   });
// };

// 重置表单
const resetForm = () => {
  activeName.value = "baseInfo";
  ruleFormRef.value.resetFields();
};

//关闭对话框
const beforeClose = () => {
  resetForm();
  formVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="640"
    :class="showType == 'apply' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    :before-close="beforeClose"
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
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="项目名称" prop="projId">
            <el-select
              v-model="formData.projId"
              :disabled="showType != 'apply'"
              style="width: 100%"
              :placeholder="showType != 'apply' ? '' : '请选择'"
              @change="GetProPrepare"
            >
              <el-option
                v-for="item in ProData"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="合同ID" prop="projContractId">
            <el-input v-model="formData.projContractId" disabled />
          </el-form-item>
        </el-col> -->
        <el-col :span="12" :offset="0">
          <el-form-item label="合同编码" prop="projContractCode">
            <el-input v-model="formData.projContractCode" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同名称" prop="projContractName">
            <el-input v-model="formData.projContractName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="累计开票" prop="invoiceAmount">
            <el-input v-model="formData.invoiceAmount" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="累计到款" prop="receiveAmount">
            <el-input v-model="formData.receiveAmount" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="剩余合同款" prop="leftContractAmout">
            <el-input v-model="formData.leftContractAmout" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="申请人" prop="staffName">
            <el-input v-model="formData.staffName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="部门" prop="deptName">
            <el-input v-model="formData.deptName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="formData.mobile" disabled />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="本次收款金额" prop="amount">
            <el-input
              v-model="formData.amount"
              type="number"
              :disabled="showType == 'read' || showType == 'audit'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="本次收款进度" prop="progress">
            <el-input
              v-model="formData.progress"
              :disabled="showType == 'read' || showType == 'audit'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="收款内容" prop="content">
            <el-input
              v-model="formData.content"
              :disabled="showType == 'read' || showType == 'audit'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="申请理由" prop="reason">
            <el-input
              v-model="formData.reason"
              :disabled="showType == 'read' || showType == 'audit'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <AuditForm
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      v-show="activeName == 'auditInfo'"
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
      :label-width="activeName == 'auditInfo' ? '92px' : '110px'"
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
      <el-button v-if="showType != 'read'" @click="beforeClose">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>

      <el-button
        v-if="showType == 'apply' || showType == 'edit'"
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
        v-if="showType == 'audit'"
        type="success"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >

      <!-- <el-button
        v-if="showType == 'undo'"
        @click="submitFormQuery(ruleFormRef)"
        type="danger"
        >撤回</el-button
      > -->
    </template>
  </el-dialog>
</template>
