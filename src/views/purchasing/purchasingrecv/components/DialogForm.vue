<script setup lang="ts">
import {
  ElMessage,
  UploadFile,
  UploadFiles,
  FormInstance,
  UploadUserFile,
  UploadInstance
} from "element-plus";
import { ref, computed } from "vue";

import {
  CreateBuyPay,
  ApproveBuyPay,
  UpdateBuyPay,
  GetBuyPay,
  GetSupplyListNV,
  Get,
  GetJoinSignNV,
  GetJoinSignSimple,
  getListNVByJoinSignId,
  Cancel
} from "@/api/purchasing";
import { emitter } from "@/utils/mitt";
import { uploadImg } from "@/api/common";
import { useNav } from "@/layout/hooks/useNav";
import { getCurrentStaffId } from "@/api/user";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { GetSimpleStaff, getStaffListByDeptCode } from "@/api/staff";
import { getConfigNameValueListByKey } from "@/api/config";
// import { convertCurrency } from "@/utils/validate";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

enum AuditResult {
  agree,
  refuse,
  back
}

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  staffName: "",
  mobile: "",
  deptName: "",
  applyReason: "",
  cancelReason: "",
  applyTime: "",
  applyStatus: 0,
  applyStatusExpr: "",
  canTemp: false,
  canApprove: false,
  canReject: false,
  canCancel: false,
  canReturnBack: false,
  canEdit: false,
  busiType: "",
  doTemp: false,
  comment1: "",
  reviewers: [],
  payCompany: "",
  feeType: "",
  payMethod: "",
  payTime: "",
  payPurpose: "",
  supplyId: "",
  supplyName: "",
  supplyContractCode: "",
  inBank: "",
  inBankAccount: "",
  projectId: "",
  projectName: "",
  contractAmount: "",
  payAmount: "",
  invoiceType: "",
  amount: 0,
  amountCHN: "",
  invoicePayAmount: 0,
  busiStaffId: "",
  busiStaffName: "",
  busiDeptId: "",
  busiDeptName: "采购部",
  attach: [],
  attachRecvSign: [],
  attachCheck: [],
  attachPay: [],
  remark: ""
};
// 表单校验规则;
const fromRules = {
  payCompany: [
    { required: true, message: "请选择付款单位", trigger: "change" }
  ],
  payMethod: [{ required: true, message: "请选择付款方式", trigger: "change" }],
  payPurpose: [{ required: true, message: "请付款用途", trigger: "blur" }],
  payTime: [{ required: true, message: "请选择付款时间", trigger: "change" }],
  supplyId: [{ required: true, message: "请选择收款单位", trigger: "change" }],
  joinSignId: [{ required: true, message: "请选择合同", trigger: "change" }],
  amount: [{ required: true, message: "请填写申请金额", trigger: "blur" }],
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
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const stauts = ref("");
const feeList = ref([]);
const userList = ref([]);
const uploadRef1 = ref<UploadInstance>();
const uploadRef2 = ref<UploadInstance>();
const uploadRef3 = ref<UploadInstance>();
const uploadRef4 = ref<UploadInstance>();
const fileList1 = ref<UploadUserFile[]>([]);
const fileList2 = ref<UploadUserFile[]>([]);
const fileList3 = ref<UploadUserFile[]>([]);
const fileList4 = ref<UploadUserFile[]>([]);
const reviewers = ref([]); //审批人员
const formData = ref(null);
const supplyList = ref([]);
const payMethodList = ref([]);
const showType = ref("apply");
const joinSignNoList = ref([]);
const joinSignProjectList = ref([]);
const formVisible = ref(false);
const formLoading = ref(false);
const invoiceTypeList = ref([]);
const { staffName } = useNav(); //用户名
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const auditFormRef = ref<FormInstance>();
const ruleFormRef = ref<FormInstance>();
const canceFormRef = ref<FormInstance>();
const tableColumnData = ref([]);
const attachContractUploading = ref(false);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  getfeeTypes();
  getpayMethods();
  //人员列表
  getStaffListByillegal();
  //供应商列表
  getSupply();
  getJoinSignNos();
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.attach = [];
  INITIAL_DATA.attachRecvSign = [];
  INITIAL_DATA.attachCheck = [];
  INITIAL_DATA.attachPay = [];

  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    showType.value = "apply";
    getinvoiceTypes();
    getStaffId();
  }
  formData.value.staffName = staffName;
  activeName.value = "baseInfo";
};
defineExpose({ show });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "apply"
    ? "申请付款"
    : showType.value == "read"
      ? "查看付款流程"
      : showType.value == "edit"
        ? "编辑付款流程"
        : showType.value == "undo"
          ? "撤回付款流程"
          : showType.value == "audit"
            ? "审核付款流程"
            : "";
});

//获取费用类型
async function getfeeTypes() {
  const { data } = await getConfigNameValueListByKey({
    catalogKey: "OABuyPayFeeType"
  });
  feeList.value = data || [];
}

//获取付款方式
async function getpayMethods() {
  const { data } = await getConfigNameValueListByKey({
    catalogKey: "OABuyPayPayMethod"
  });
  payMethodList.value = data || [];
}

//获取发票类型
async function getinvoiceTypes() {
  const { data } = await getConfigNameValueListByKey({
    catalogKey: "SellInvoiceType"
  });
  invoiceTypeList.value = data || [];
  if (
    invoiceTypeList.value != null &&
    invoiceTypeList.value.length > 0 &&
    showType.value == "apply"
  ) {
    const item = invoiceTypeList.value[0];
    formData.value.invoiceType = item.name;
  }
}

// 获取人员列表
const getStaffListByillegal = async () => {
  const { data = {} } = await getStaffListByDeptCode({
    deptCode: "TYKJ-CGB",
    staffName: ""
  });
  userList.value = data || [];
};
const getStaffId = async () => {
  const { data } = await getCurrentStaffId();
  formData.value.busiStaffId = data || "";
};
// 根据id获取人员详情数据;
async function SimpleStaff(val) {
  const { data } = await GetSimpleStaff({ staffId: val });
  formData.value.busiDeptId = data.deptId;
  formData.value.busiDeptName = data.deptName;
}
// 获取供应商列表
const getSupply = async () => {
  const { data = {} } = await GetSupplyListNV();
  supplyList.value = data || [];
};
// 获取供应商
const getSupplyDetail = async ids => {
  const { data = {} } = await Get({ id: ids });
  const tdata = data || {};
  formData.value.inBank = tdata.inBank;
  formData.value.inBankAccount = tdata.inBankAccount;
};
function handleSupplyChange(val) {
  getSupplyDetail(val);
}

// 获取合同编号
const getJoinSignNos = async () => {
  const { data = {} } = await GetJoinSignNV();
  joinSignNoList.value = data || [];
};
// 获取合同项目
const getJoinSignProjects = async ids => {
  const { data = {} } = await getListNVByJoinSignId({ joinSignId: ids });
  joinSignProjectList.value = data || [];
};
// 获取合同详情
const getJoinSignDetail = async ids => {
  const { data = {} } = await GetJoinSignSimple({ id: ids });
  const tdata = data || {};
  formData.value.contractAmount = tdata.amount;
  formData.value.payAmount = tdata.payAmount;
  formData.value.invoicePayAmount = tdata.invoiceAmount;
};
function handleContractChange(val) {
  joinSignProjectList.value = [];
  formData.value.projectName = "";
  formData.value.projectId = "";
  getJoinSignDetail(val);
  getJoinSignProjects(val);
}
function handleProjectChange(val) {
  joinSignProjectList.value.forEach(item => {
    if (val == item.projectId) {
      formData.value.projectName = item.projectFullName;
    }
  });
}
// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetBuyPay({ id });
  formData.value = data || {};
  fileList1.value =
    formData.value.attach != null && formData.value.attach.length > 0
      ? formData.value.attach.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList2.value =
    formData.value.attachRecvSign != null &&
    formData.value.attachRecvSign.length > 0
      ? formData.value.attachRecvSign.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList3.value =
    formData.value.attachCheck != null && formData.value.attachCheck.length > 0
      ? formData.value.attachCheck.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList4.value =
    formData.value.attachPay != null && formData.value.attachPay.length > 0
      ? formData.value.attachPay.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });
  if (data) {
    reviewers.value = data.reviewers || [];
  }
  formLoading.value = false;
  getJoinSignProjects(data.joinSignId);
}

//
async function fileUpload1(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList1.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError1 = () => {
  uploadRef1.value.clearFiles();
};

const handleSuccess1 = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove1(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}

//

async function fileUpload2(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList2.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError2 = () => {
  uploadRef2.value.clearFiles();
};

const handleSuccess2 = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove2(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}

//

async function fileUpload3(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList3.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError3 = () => {
  uploadRef3.value.clearFiles();
};

const handleSuccess3 = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove3(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}

//

async function fileUpload4(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList4.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError4 = () => {
  uploadRef3.value.clearFiles();
};

const handleSuccess4 = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove4(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}

// 提交申请表单
const submitForm = async (formEl: FormInstance | undefined, flag: boolean) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        formData.value.doTemp = flag;
        const { code, message } = await UpdateBuyPay(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
        }
      } else {
        formData.value.doTemp = flag;
        const { code, message } = await CreateBuyPay(formData.value);
        if (code == 0) {
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
      formLoading.value = true;
      ApproveBuyPay({
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
    }
  });
};

// 提交撤回表单
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
        beforeClose();
        emit("search");
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  if (ruleFormRef.value != null) {
    ruleFormRef.value.resetFields();
  }
  if (auditFormRef.value != null) {
    auditFormRef.value.resetFields();
  }
  reviewers.value = [];
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
    :width="800"
    :class="showType == 'apply' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="beforeClose"
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
      :rules="fromRules"
      label-width="125px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="付款单位" prop="payCompany">
            <el-select
              v-model="formData.payCompany"
              :disabled="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请选择'
              "
              :style="{ width: '100%' }"
            >
              <el-option
                label="某哦科技股份有限公司"
                value="某某科技股份有限公司"
              />
              <el-option
                label="北京某某科技有限公司"
                value="北京某某科技有限公司"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="费用类型" prop="feeType">
            <el-input
              v-if="showType == 'read' || showType == 'audit'"
              v-model="formData.feeType"
              readonly
            />
            <el-select
              v-else
              v-model="formData.feeType"
              clearable
              placeholder="请选择"
              ><el-option
                v-for="item in feeList"
                :key="item.value"
                :label="item.name"
                :value="item.name"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="付款方式" prop="payMethod">
            <el-input
              v-if="showType == 'read' || showType == 'audit'"
              v-model="formData.payMethod"
              readonly
            />
            <el-select
              v-else
              v-model="formData.payMethod"
              clearable
              placeholder="请选择"
              ><el-option
                v-for="item in payMethodList"
                :key="item.value"
                :label="item.name"
                :value="item.name"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="付款用途" prop="payPurpose">
            <el-input
              v-model="formData.payPurpose"
              :readonly="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="付款时间" prop="payTime">
            <el-date-picker
              v-model="formData.payTime"
              :disabled="showType == 'read' || showType == 'audit'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="收款单位" prop="supplyId">
            <el-select
              v-model="formData.supplyId"
              :disabled="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请选择'
              "
              :style="{ width: '100%' }"
              @change="handleSupplyChange"
            >
              <el-option
                v-for="item in supplyList"
                :key="item.value"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="收款单位开户行" prop="inBank">
            <el-input v-model="formData.inBank" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="收款单位银行账户" prop="inBankAccount">
            <el-input v-model.trim="formData.inBankAccount" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同编号" prop="joinSignId">
            <el-select
              v-model="formData.joinSignId"
              :disabled="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请选择'
              "
              :style="{ width: '100%' }"
              @change="handleContractChange"
            >
              <el-option
                v-for="item in joinSignNoList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <!-- <el-input v-model.trim="formData.projectName" readonly /> -->
            <el-select
              v-model="formData.projectId"
              :disabled="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请选择'
              "
              :style="{ width: '100%' }"
              clearable
              @change="handleProjectChange"
            >
              <el-option
                v-for="item in joinSignProjectList"
                :key="item.projectId"
                :label="item.projectFullName"
                :value="item.projectId"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="合同金额" prop="contractAmount">
            <el-input v-model="formData.contractAmount" readonly />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="累计已付金额" prop="payAmount">
            <el-input v-model="formData.payAmount" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="发票类型" prop="invoiceType">
            <el-input
              v-if="showType == 'read' || showType == 'audit'"
              v-model="formData.invoiceType"
              readonly
            />
            <el-select
              v-else
              v-model="formData.invoiceType"
              clearable
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请选择'
              "
              ><el-option
                v-for="item in invoiceTypeList"
                :key="item.value"
                :label="item.name"
                :value="item.name"
            /></el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="申请金额(小写)" prop="amount">
            <el-input-number
              v-model="formData.amount"
              :readonly="showType == 'read' || showType == 'audit'"
              :controls="false"
              :min="0"
              value-on-clear="min"
              align="left"
              @blur="handleBlur"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="申请金额(大写)" prop="amountCHN">
            <el-input v-model="formData.amountCHN" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="累计发票金额" prop="invoicePayAmount">
            <el-input-number
              v-model="formData.invoicePayAmount"
              :readonly="showType == 'read' || showType == 'audit'"
              :controls="false"
              :min="0"
              value-on-clear="min"
              style="text-align: left"
            />
          </el-form-item>
        </el-col>
        <el-col
          v-if="showType == 'apply' || showType == 'edit'"
          :span="6"
          :offset="0"
        >
          <el-form-item label="业务经办人" prop="busiStaffId">
            <el-select
              v-model="formData.busiStaffId"
              filterable
              style="width: 85px"
              @change="SimpleStaff"
              ><el-option
                v-for="item in userList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col
          v-if="showType == 'read' || showType == 'audit' || showType == 'undo'"
          :span="6"
          :offset="0"
        >
          <el-form-item label="业务经办人" prop="busiStaffName">
            <el-input
              v-model="formData.busiStaffName"
              style="width: 85px"
              readonly
            />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item
            label="所属部门"
            prop="busiDeptName"
            label-width="90px !important"
          >
            <el-input
              v-model="formData.busiDeptName"
              style="width: 85px"
              readonly
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
                showType == 'read' || showType == 'audit' ? '' : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="发票" prop="attach">
            <el-upload
              v-if="showType == 'apply' || showType == 'edit'"
              ref="uploadRef1"
              accept="*"
              action="attach"
              :auto-upload="true"
              :file-list="fileList1"
              :http-request="fileUpload1"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove1(uploadFile, uploadFiles, 'attach');
                }
              "
              :on-error="handleError1"
              :on-success="handleSuccess1"
            >
              <el-button type="primary" text :loading="attachContractUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="到货签收单" prop="attachRecvSign">
            <el-upload
              v-if="showType == 'apply' || showType == 'edit'"
              ref="uploadRef2"
              accept="*"
              action="attachRecvSign"
              :auto-upload="true"
              :file-list="fileList2"
              :http-request="fileUpload2"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove2(uploadFile, uploadFiles, 'attachRecvSign');
                }
              "
              :on-error="handleError2"
              :on-success="handleSuccess2"
            >
              <el-button type="primary" text :loading="attachContractUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="验收单" prop="attachCheck">
            <el-upload
              v-if="showType == 'apply' || showType == 'edit'"
              ref="uploadRef3"
              accept="*"
              action="attachCheck"
              :auto-upload="true"
              :file-list="fileList3"
              :http-request="fileUpload3"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove3(uploadFile, uploadFiles, 'attachCheck');
                }
              "
              :on-error="handleError3"
              :on-success="handleSuccess3"
            >
              <el-button type="primary" text :loading="attachContractUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="拨付单申请表" prop="attachPay">
            <el-upload
              v-if="showType == 'apply' || showType == 'edit'"
              ref="uploadRef4"
              accept="*"
              action="attachPay"
              :auto-upload="true"
              :file-list="fileList4"
              :http-request="fileUpload4"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove4(uploadFile, uploadFiles, 'attachPay');
                }
              "
              :on-error="handleError4"
              :on-success="handleSuccess4"
            >
              <el-button type="primary" text :loading="attachContractUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item
            v-if="
              showType == 'undo' ||
              (stauts == '已撤销' && showType == 'read') ||
              showType == 'undodraft'
            "
            label="撤回理由"
            prop="cancelReason"
          >
            <el-input
              v-model="formData.cancelReason"
              :disabled="showType == 'read' || showType == 'querydraft'"
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
              showType == 'undo' || (stauts == '已撤销' && showType == 'read')
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
      :label-width="activeName == 'auditInfo' ? '92px' : '125px'"
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
      <el-button @click="formVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType == 'apply' || showType == 'edit' || showType == 'draft'"
        type="success"
        @click="submitForm(ruleFormRef, true)"
        >暂存
      </el-button>
      <el-button
        v-if="showType == 'apply' || showType == 'edit' || showType == 'draft'"
        type="primary"
        @click="submitForm(ruleFormRef, false)"
        >提交
      </el-button>
      <el-button
        v-if="showType == 'undo' || showType == 'undodraft'"
        type="primary"
        @click="submitFormQuery(canceFormRef)"
        >提交</el-button
      >
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

<style lang="scss" scoped>
:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>
