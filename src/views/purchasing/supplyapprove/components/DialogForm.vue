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
  CreateSupplyApply,
  ApproveSupply,
  SupplyCancel,
  GetSupply
} from "@/api/purchasing";
import { emitter } from "@/utils/mitt";
import { uploadImg } from "@/api/common";
import { isPhone } from "@pureadmin/utils";
import { useNav } from "@/layout/hooks/useNav";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { getConfigListByKey } from "@/api/config";
import { getConfigNameValueListByKey } from "@/api/config";
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
  deptName: "",
  mobile: "",
  catId: [],
  catName: "",
  name: "",
  contact: "",
  phone: "",
  contact2: "",
  phone2: "",
  applyType: 1,
  supplyId: "",
  applyStatus: "",
  applyStatusExpr: "",
  applyTime: "",
  inCompany: "",
  inBank: "",
  inBankAccount: "",
  busiLicense: [], //供应商营业执照
  authLicense: [], //管理认证体系
  taxLicense: [], //一般纳税人证明
  creditLicense: [], //国家企业信用信息公示系统相关公示信息
  applyReason: "", //申请事由
  cancelReason: "", //撤回理由
  canCancel: true,
  canApprove: true,
  invoiceImg: "",
  comment1: "",
  level: "" //供应商级别
};
// 表单校验规则;
const rules = {
  catId: [{ required: true, message: "请选择供应商分类", trigger: "change" }],
  name: [{ required: true, message: "请输入供应商名称", trigger: "blur" }],
  contact: [{ required: true, message: "请输入供应商销售员", trigger: "blur" }],
  phone: [
    {
      message: "电话格式不正确",
      validator: (rule, value, callback) => {
        if (value != "") {
          if (!isPhone(value)) {
            callback(new Error("电话格式不正确"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      }
    }
  ],
  phone2: [
    {
      message: "电话格式不正确",
      validator: (rule, value, callback) => {
        if (value != "") {
          if (!isPhone(value)) {
            callback(new Error("电话格式不正确"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      }
    }
  ],
  inCompany: [{ required: true, message: "请输入收款单位", trigger: "blur" }],
  inBank: [{ required: true, message: "请输入开户行", trigger: "blur" }],
  inBankAccount: [
    { required: true, message: "请输入开户行账号", trigger: "blur" }
  ],
  busiLicense: [
    { required: true, message: "请上传营业执照", trigger: "change" }
  ],
  authLicense: [
    { required: true, message: "请上传管理体系认证", trigger: "blur" }
  ],
  taxLicense: [
    { required: true, message: "请上传纳税人证明", trigger: "blur" }
  ],
  transCompany: [
    { required: true, message: "请输入物流公司", trigger: "blur" }
  ],
  creditLicense: [
    { required: true, message: "请上传企业信用公示", trigger: "change" }
  ],
  applyReason: [
    { required: true, message: "请输入申请事由", trigger: "change" }
  ],
  cancelReason: [
    { required: true, message: "请填写撤回理由", trigger: "blur" }
  ],
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
const showType = ref("apply");
const reviewers = ref([]); //审批人员
const formData = ref(null);
const Spplierlevel = ref([]); //供应商级别
const formVisible = ref(false);
const { staffName } = useNav(); //用户名
const formLoading = ref(false);
const allSpplierTypes = ref([]); //供应商类型
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const attachContractUploading = ref(false);
const ruleFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const uploadRef1 = ref<UploadInstance>();
const uploadRef2 = ref<UploadInstance>();
const uploadRef3 = ref<UploadInstance>();
const uploadRef4 = ref<UploadInstance>();
const fileList1 = ref<UploadUserFile[]>([]); //营业执照
const fileList2 = ref<UploadUserFile[]>([]); //管理认证体系
const fileList3 = ref<UploadUserFile[]>([]); //一般纳税人证明
const fileList4 = ref<UploadUserFile[]>([]); //国家企业信用信息公示系统相关公示信息
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "apply"
    ? "申请供应商"
    : showType.value == "read"
      ? "查看供应商"
      : showType.value == "querydraft"
        ? "查看"
        : showType.value == "undo"
          ? "撤销供应商申请"
          : showType.value == "audit"
            ? "审核供应商申请"
            : showType.value == "edit"
              ? "变更供应商"
              : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  //获取所有供应商类型
  getspplierTypes();
  getspplierlevel();
  formVisible.value = true;
  activeName.value = "baseInfo";
  formData.value = { ...INITIAL_DATA };

  INITIAL_DATA.busiLicense = [];
  INITIAL_DATA.authLicense = [];
  INITIAL_DATA.taxLicense = [];
  INITIAL_DATA.creditLicense = [];
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatus;
    await getDetail(_formData.id);
  } else {
    showType.value = "apply";
    formData.value.staffName = staffName;
  }
  if (_formData.staffName == staffName) {
    formData.value.staffName = staffName;
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetSupply({ id });
  formData.value = data || {};
  fileList1.value =
    formData.value.busiLicense != null && formData.value.busiLicense.length > 0
      ? formData.value.busiLicense.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList2.value =
    formData.value.authLicense != null && formData.value.authLicense.length > 0
      ? formData.value.authLicense.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList3.value =
    formData.value.taxLicense != null && formData.value.taxLicense.length > 0
      ? formData.value.taxLicense.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList4.value =
    formData.value.creditLicense != null &&
    formData.value.creditLicense.length > 0
      ? formData.value.creditLicense.map(item => {
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
  console.log("reviewers", reviewers.value);
  formLoading.value = false;
}

//获取所有供应商级别
function getspplierlevel() {
  getConfigNameValueListByKey({
    catalogKey: "OASupplyLevel"
  })
    .then(({ data }) => {
      Spplierlevel.value = data || [];
    })
    .catch(() => {
      Spplierlevel.value = [];
    });
}

//获取所有供应商类型
async function getspplierTypes() {
  const { data } = await getConfigListByKey({
    catalogKey: "OASupplyCategory"
  });
  allSpplierTypes.value = data;
}

//营业执照----------------
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

//管理认证体系----------------

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

//一般纳税人证明-----------------

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

//国家企业信用信息公示系统相关公示信息-------------------------

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
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formLoading.value = true;
  formEl.validate(valid => {
    if (valid) {
      CreateSupplyApply(formData.value)
        .then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            emit("search");
            beforeClose();
          }
        })
        .finally(() => {
          formLoading.value = false;
        });
    } else {
      formLoading.value = false;
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
  formLoading.value = true;
  formEl.validate(valid => {
    if (valid) {
      ApproveSupply({
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
        .finally(() => {
          formLoading.value = false;
        });
    } else {
      formLoading.value = false;
    }
  });
};

// 提交撤回表单
const submitFormQuery = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await SupplyCancel({
        id: formData.value.id,
        cancelReason: formData.value.cancelReason
      });
      if (code == 0) {
        ElMessage.success(message);
        emit("search");
        beforeClose();
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  ruleFormRef.value?.resetFields();
  fileList1.value = [];
  fileList2.value = [];
  fileList3.value = [];
  fileList4.value = [];
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
    :width="950"
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
      :rules="rules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="8" :offset="0">
          <el-form-item label="申请人" prop="staffName">
            <el-input v-model="formData.staffName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="供应商类别" prop="catId">
            <el-select
              v-model="formData.catId"
              :collapse-tags="true"
              :collapse-tags-tooltip="true"
              multiple
              :disabled="showType == 'read' || showType == 'querydraft'"
              :placeholder="
                showType == 'read' || showType == 'querydraft' ? '' : '请选择'
              "
              :style="{ width: '100%' }"
              ><el-option
                v-for="item in allSpplierTypes"
                :key="item.configKey"
                :label="item.configName"
                :value="item.configValue"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="供应商名称" prop="name">
            <el-input
              v-model="formData.name"
              :readonly="showType == 'read' || showType == 'querydraft'"
              :placeholder="
                showType == 'read' || showType == 'querydraft' ? '' : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="供应商级别" prop="level">
            <el-select
              v-model="formData.level"
              :disabled="showType == 'read' || showType == 'querydraft'"
              :placeholder="
                showType == 'read' || showType == 'querydraft' ? '' : '请选择'
              "
              :style="{ width: '100%' }"
              ><el-option
                v-for="item in Spplierlevel"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8" :offset="0">
          <el-form-item label="供应销售员" prop="contact">
            <el-input
              v-model="formData.contact"
              :placeholder="
                showType == 'read' || showType == 'querydraft' ? '' : '请输入'
              "
              :readonly="showType == 'read' || showType == 'querydraft'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="8" :offset="0">
          <el-form-item label="销售员电话" prop="phone">
            <el-input
              v-model.trim="formData.phone"
              :readonly="showType == 'read' || showType == 'querydraft'"
              :placeholder="
                showType == 'read' || showType == 'querydraft' ? '' : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="销售员领导" prop="contact2">
            <el-input
              v-model="formData.contact2"
              :placeholder="
                showType == 'read' || showType == 'querydraft' ? '' : '请输入'
              "
              :readonly="showType == 'read' || showType == 'querydraft'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="领导电话" prop="phone2">
            <el-input
              v-model.trim="formData.phone2"
              :readonly="showType == 'read' || showType == 'querydraft'"
              :placeholder="
                showType == 'read' || showType == 'querydraft' ? '' : '请输入'
              "
            />
          </el-form-item>
        </el-col>

        <!-- <el-col :span="8" :offset="0">
            <el-form-item label="收款单位" prop="inCompany">
              <el-input
                v-model.trim="formData.inCompany"
                :readonly="showType == 'read'|| showType == 'querydraft'"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col> -->
        <el-col :span="8" :offset="0">
          <el-form-item label="收款开户行" prop="inBank">
            <el-input
              v-model="formData.inBank"
              :placeholder="
                showType == 'read' || showType == 'querydraft' ? '' : '请输入'
              "
              :readonly="showType == 'read' || showType == 'querydraft'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="收款账号" prop="inBankAccount">
            <el-input
              v-model.trim="formData.inBankAccount"
              :readonly="showType == 'read' || showType == 'querydraft'"
              :placeholder="
                showType == 'read' || showType == 'querydraft' ? '' : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="16" :offset="0">
          <el-form-item label="备注" prop="comment">
            <el-input
              v-model="formData.comment"
              type="textarea"
              :placeholder="
                showType == 'read' || showType == 'querydraft' ? '' : '请输入'
              "
              :readonly="showType == 'read' || showType == 'querydraft'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="管理体系认证" prop="authLicense">
            <el-upload
              ref="uploadRef2"
              :disabled="
                showType == 'read' ||
                showType == 'querydraft' ||
                showType == 'audit' ||
                showType == 'undo'
              "
              accept="*"
              action="authLicense"
              :auto-upload="true"
              :file-list="fileList2"
              :http-request="fileUpload2"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove2(uploadFile, uploadFiles, 'authLicense');
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
        <el-col :span="24" :offset="0">
          <el-form-item label="营业执照" prop="busiLicense">
            <el-upload
              ref="uploadRef1"
              :disabled="
                showType == 'read' ||
                showType == 'querydraft' ||
                showType == 'audit' ||
                showType == 'undo'
              "
              accept="*"
              action="busiLicense"
              :auto-upload="true"
              :file-list="fileList1"
              :http-request="fileUpload1"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove1(uploadFile, uploadFiles, 'busiLicense');
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

        <el-col :span="24" :offset="0">
          <el-form-item label="纳税人证明" prop="taxLicense">
            <el-upload
              ref="uploadRef3"
              :disabled="
                showType == 'read' ||
                showType == 'querydraft' ||
                showType == 'audit' ||
                showType == 'undo'
              "
              accept="*"
              action="taxLicense"
              :auto-upload="true"
              :file-list="fileList3"
              :http-request="fileUpload3"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove3(uploadFile, uploadFiles, 'taxLicense');
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
        <el-col :span="24" :offset="0">
          <el-form-item label="企业信用公示" prop="creditLicense">
            <el-upload
              ref="uploadRef4"
              :disabled="
                showType == 'read' ||
                showType == 'querydraft' ||
                showType == 'audit' ||
                showType == 'undo'
              "
              accept="*"
              action="creditLicense"
              :auto-upload="true"
              :file-list="fileList4"
              :http-request="fileUpload4"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove4(uploadFile, uploadFiles, 'creditLicense');
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

        <!-- <el-col :span="24" :offset="0">
            <el-form-item label="申请事由" prop="applyReason">
              <el-input
                v-model="formData.applyReason"
                :rows="2"
                type="textarea"
                placeholder="请输入"
                :readonly="showType == 'audit' || showType == 'read' || showType == 'undo'"
              />
            </el-form-item>
          </el-col> -->
        <el-col :span="24" :offset="0">
          <el-form-item
            v-if="
              showType == 'undo' ||
              (stauts == '5' && showType == 'read') ||
              showType == 'undodraft'
            "
            label="撤销理由"
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
    <AuditForm
      v-if="
        (showType == 'read' || showType == 'undo' || showType == 'audit') &&
        activeName == 'auditInfo'
      "
      :type="showType"
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
      <el-button @click="formVisible = false">
        {{ showType == "read" || showType == "querydraft" ? "关闭" : "取消" }}
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
        v-if="false && showType == 'audit'"
        type="success"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >
      <el-button
        v-if="showType == 'undo'"
        type="danger"
        @click="submitFormQuery(ruleFormRef)"
        >撤销</el-button
      >
    </template>
  </el-dialog>
</template>
