<script setup lang="ts">
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { ref, computed, watch } from "vue";
import { ElMessage, FormInstance } from "element-plus";

import {
  addFundApply,
  editFundApply,
  getFundApply,
  approveFundApply
  // GetFundApplyProcessTypeNV
} from "@/api/fundApply";

import { emitter } from "@/utils/mitt";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { getStaffListByDeptId } from "@/api/staff";
import { convertCurrency } from "@/utils/validate";
import { addFundPayRecord } from "@/api/fundPayRecord";
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
  staffId: "",
  staffName: "",
  mobile: "",
  companyId: "",
  companyName: "",
  deptId: "",
  deptName: "",
  applyReason: "",
  cancelReason: "",
  applyTime: "",
  applyFundDate: dayjs().format("YYYY-MM-DD"),
  applyDate: "",
  applyStatus: 0,
  applyStatusExpr: "",
  ccs: [],
  canTemp: true,
  canApprove: true,
  canReject: true,
  canCancel: true,
  canReturnBack: true,
  canEdit: true,
  canDel: true,
  busiType: "",
  doTemp: true,
  comment1: "",
  reviewers: [],
  reviewersShow: [],
  abCurrentStaffApproveResult: true,
  fundNature: 1,
  applyCompanyId: "",
  applyCompanyName: "",
  agentId: "",
  agent: "",
  amount: 0,
  amountCN: "",
  remark: "",
  preReturnTime: "",
  processState: "",
  fundPayRecordList: []
};
const invoiceAmountValidator = (rule: any, value: any, callback: any) => {
  if (!value && formData.value.amount == 0) {
    return callback(new Error("请输入借款数额"));
  } else {
    callback();
  }
};
const rules = {
  applyCompanyId: [
    { required: true, message: "请选择借款单位", trigger: "change" }
  ],
  fundNature: [
    { required: true, message: "请选择资金性质", trigger: "change" }
  ],
  preReturnTime: [
    { required: true, message: "请选择预计还款日期", trigger: "change" }
  ],
  applyReason: [{ required: true, message: "请输入借款理由", trigger: "blur" }],
  amount: [
    {
      required: true,
      message: "请输入借款数额",
      trigger: "blur",
      validator: invoiceAmountValidator
    }
  ]
};
const validateAuditForm = (rule: any, value: any, callback: any) => {
  if (!value && auditResult.value != AuditResult.agree) {
    return callback(new Error("审核意见不能为空"));
  } else {
    callback();
  }
};
const validateVoucher = (rule: any, value: any, callback: any) => {
  if (recordData.value.payWay == 1 && !value) {
    return callback(new Error("凭单号不能为空"));
  } else {
    callback();
  }
};
const validateCheckNo = (rule: any, value: any, callback: any) => {
  if (recordData.value.payWay == 2 && !value) {
    return callback(new Error("支票号不能为空"));
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
//付款记录表单验证规则
const recordFormRules = {
  voucherNo: [
    {
      // message: "审核意见不能为空",
      validator: validateVoucher
    }
  ],
  checkNo: [
    {
      // message: "审核意见不能为空",
      validator: validateCheckNo
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
const recordData = ref({
  id: undefined, //主键ID
  fundApplyId: undefined, //备用金/专项资金Id
  payTime: dayjs().format("YYYY-MM-DD HH:mm"), //付款日期
  payWay: 1, //付款方式 1 现金 2 支票
  voucherNo: "", //凭单号
  checkNo: "", //支票号
  payAmount: 0 //支付金额
  // payee: "",
  // payeeId: ""
});
const reviewers = ref([]); //审批人员
const staffOptions = ref([]); //职工选项
// const processType = ref([]); //办理状态
const showType = ref("apply");
const formVisible = ref(false);
const formLoading = ref(false);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const recordFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "apply"
    ? "备用金/专项资金申请"
    : showType.value == "edit"
      ? "备用金/专项资金编辑"
      : showType.value == "read"
        ? "备用金/专项资金查看"
        : showType.value == "audit"
          ? "备用金/专项资金审核"
          : showType.value == "record"
            ? "备用金/专项资金付款记录"
            : "";
});

watch(
  () => formData.value.applyCompanyId,
  newVal => {
    if (!newVal) {
      formData.value.applyCompanyName = "";
      staffOptions.value = [];
      return;
    }
    getStaffList("");
  }
);
watch(
  () => formData.value.amount,
  newVal => {
    if (newVal) {
      handleBlur();
    }
  }
);
watch(
  () => recordData.value.payWay,
  newVal => {
    if (newVal == 1) {
      recordData.value.checkNo = "";
    } else if (newVal == 2) {
      recordData.value.voucherNo = "";
    }
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  if (staffOptions.value.length < 1) {
    getStaffList("");
  }

  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  showType.value = _type;
  activeName.value = "baseInfo";
  if (_formData) {
    await getDetail(_formData.id);
    // await getProcessType();
  }
};
defineExpose({ show });

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getFundApply({ id });
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

function getStaffList(queryString) {
  return new Promise<any[]>(resolve => {
    getStaffListByDeptId({
      deptId: formData.value.applyCompanyId,
      staffName: queryString
    })
      .then(({ data }) => {
        staffOptions.value = data || [];
        resolve(data);
      })
      .catch(() => {
        resolve([]);
      });
  });
}

// //办理状态
// async function getProcessType() {
//   const { data } = await GetFundApplyProcessTypeNV();
//   processType.value = data;
// }

function handleBlur() {
  formData.value.amountCN = convertCurrency(formData.value.amount);
}

function handleCompanyChange(val) {
  const company = rootDepartment.value.find(item => item.id == val) || {};
  formData.value.applyCompanyName = company.fullName;
}

// const handleOperatorSelect = val => {
//   if (val) {
//     const staff = staffOptions.value.find(item => item.value == val);
//     recordData.value.payee = staff.name;
//   } else {
//     recordData.value.payee = "";
//   }
// };

// 提交表单
const submitForm = async (formEl: FormInstance | undefined, flag: boolean) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      formData.value.doTemp = flag;
      if (showType.value == "apply") {
        const { code, message } = await addFundApply(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { code, message } = await editFundApply(formData.value);
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

const submitPayForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      recordData.value.fundApplyId = formData.value.id;
      const { code, message } = await addFundPayRecord(recordData.value);
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
        resetForm(formEl);
        emit("search");
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
      approveFundApply({
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
  resetForm(recordFormRef.value);
  formVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="720"
    :class="showType == 'apply' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="closeDialog"
  >
    <AuditSteps
      v-if="showType != 'apply' && showType != 'edit'"
      :reviewers="reviewers"
      :marginWidth="5"
    />
    <el-tabs
      v-if="showType != 'apply' && showType != 'edit'"
      v-model="activeName"
      type="card"
      tab-position="top"
    >
      <el-tab-pane label="基础信息" name="baseInfo" />
      <el-tab-pane label="审核信息" name="auditInfo" />
      <el-tab-pane
        v-if="showType != 'audit'"
        label="付款记录"
        name="recordInfo"
      />
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
      label-width="110px"
      :disabled="
        showType == 'audit' || showType == 'read' || showType == 'record'
      "
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="资金性质" prop="fundNature">
            <el-select
              v-model="formData.fundNature"
              placeholder="请选择"
              :disabled="showType == 'audit' || showType == 'read'"
            >
              <el-option label="因公" :value="1" />
              <el-option label="因项目" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="借款日期" prop="applyFundDate">
            <el-date-picker
              v-model="formData.applyFundDate"
              :disabled="showType == 'audit' || showType == 'read'"
              type="date"
              :editable="false"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :clearable="false"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="预计归还日期" prop="preReturnTime">
            <el-date-picker
              v-model="formData.preReturnTime"
              :disabled="showType == 'audit' || showType == 'read'"
              type="date"
              :editable="false"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :clearable="false"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0" v-if="showType == 'process'">
          <el-form-item label="办理状态" prop="processState">
            <el-select v-model="formData.processState" placeholder="请选择">
              <el-option
                v-for="item in processType"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col> -->
        <el-col :span="24" :offset="0">
          <el-form-item label="借款单位" prop="applyCompanyId">
            <el-select
              v-model="formData.applyCompanyId"
              placeholder="请选择"
              :disabled="showType == 'audit' || showType == 'read'"
              @change="handleCompanyChange"
            >
              <el-option
                v-for="item in rootDepartment"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="借款理由" prop="applyReason">
            <el-input
              v-model="formData.applyReason"
              :rows="2"
              type="textarea"
              :placeholder="
                showType == 'audit' || showType == 'read' ? '' : '请输入'
              "
              :readonly="showType == 'audit' || showType == 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="借款数额" prop="amount">
            <el-input-number
              v-model="formData.amount"
              :controls="false"
              :readonly="showType == 'audit' || showType == 'read'"
              :min="0"
              value-on-clear="min"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="人民币大写" prop="amountCN">
            <el-input v-model="formData.amountCN" />
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
        showType != 'apply' && showType != 'edit' && activeName == 'auditInfo'
      "
      :showType="showType"
      :reviewers="reviewers"
    />
    <el-table
      v-if="showType != 'apply' && showType != 'edit' && showType != 'audit'"
      v-show="activeName == 'recordInfo'"
      :data="formData.fundPayRecordList"
      class="mb-4"
      border
      stripe
    >
      <el-table-column
        type="index"
        label="序号"
        width="60"
        fixed="left"
        align="center"
      />
      <el-table-column
        prop="payTime"
        label="付款日期"
        align="center"
        :min-width="140"
      />
      <el-table-column
        prop="payWay"
        label="付款方式"
        align="center"
        :min-width="100"
      >
        <template #default="{ row }">
          {{ row.payWay == 1 ? "现金支出凭单" : "支票" }}
        </template>
      </el-table-column>
      <el-table-column
        prop="checkNo"
        label="支票号"
        align="center"
        :min-width="140"
      />
      <el-table-column
        prop="voucherNo"
        label="凭单号"
        align="center"
        :min-width="140"
      />
      <!-- <el-table-column
        prop="payee"
        label="收款人"
        align="center"
        :min-width="140"
      /> -->
    </el-table>
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
    <el-form
      v-if="showType == 'record'"
      ref="recordFormRef"
      class="record-form"
      :class="{ 'mt-4.5': showType == 'record' }"
      :model="recordData"
      :rules="recordFormRules"
      :inline="false"
      :label-width="activeName == 'recordInfo' ? '92px' : '85px'"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item
            label="付款日期"
            prop="payTime"
            :class="{ editable: showType == 'record' }"
          >
            <el-date-picker
              v-model="recordData.payTime"
              type="datetime"
              :editable="false"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              :clearable="false"
              style="width: 100% !important"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item
            label="付款方式"
            prop="payWay"
            :class="{ editable: showType == 'record' }"
          >
            <el-select
              v-model.trim="recordData.payWay"
              :multiple="false"
              filterable
              placeholder="请选择"
            >
              <el-option label="现金支出凭单" :value="1" />
              <el-option label="支票" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="recordData.payWay == 1" :span="12" :offset="0">
          <el-form-item
            label="凭单号"
            prop="voucherNo"
            :class="{ editable: showType == 'record' }"
          >
            <el-input
              v-model="recordData.voucherNo"
              placeholder="请输入"
              clearable
            />

            <!-- <el-input-number
              v-model="recordData.voucherNo"
              :controls="false"
              :min="0"
              :precision="0"
              step-strictly
              value-on-clear="min"
            /> -->
          </el-form-item>
        </el-col>
        <el-col v-if="recordData.payWay == 2" :span="12" :offset="0">
          <el-form-item
            label="支票号"
            prop="checkNo"
            :class="{ editable: showType == 'record' }"
          >
            <el-input
              v-model="recordData.checkNo"
              placeholder="请输入"
              clearable
            />
            <!-- <el-input-number
              v-model="recordData.checkNo"
              :controls="false"
              :min="0"
              :precision="0"
              step-strictly
              value-on-clear="min"
            /> -->
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0">
          <el-form-item
            label="收款人"
            prop="payee"
            :class="{ editable: showType == 'record' }"
          >
            <el-select
              v-model.trim="recordData.payee"
              :multiple="false"
              filterable
              placeholder="请输入"
              @change="handleOperatorSelect"
            >
              <el-option
                v-for="item in staffOptions"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col> -->
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType == 'apply' || showType == 'edit'"
        type="success"
        @click="submitForm(ruleFormRef, true)"
        >暂存
      </el-button>
      <el-button
        v-if="showType == 'apply' || showType == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef, false)"
        >提交
      </el-button>
      <el-button
        v-if="showType == 'record'"
        type="primary"
        @click="submitPayForm(recordFormRef)"
        >提交
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
