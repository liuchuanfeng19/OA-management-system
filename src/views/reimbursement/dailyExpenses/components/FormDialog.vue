<script setup lang="ts">
import type {
  UploadFile,
  UploadFiles,
  UploadProps,
  UploadInstance,
  UploadUserFile,
  FormInstance
} from "element-plus";
import _ from "lodash";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { ref, computed, watch } from "vue";

import {
  addDailyExpense,
  editDailyExpense,
  getDailyExpense,
  approveDailyExpense
} from "@/api/dailyExpense";
import { emitter } from "@/utils/mitt";
import { uploadInvoice } from "@/api/common";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { getStaffListByDeptId } from "@/api/staff";
import { useUserStoreHook } from "@/store/modules/user";
import { PreviewButton } from "@/components/PreviewButton";
import { DownloadButton } from "@/components/DownloadButton";
import { userProjectStoreHook } from "@/store/modules/project";
import { userDepartmentStoreHook } from "@/store/modules/department";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

const { staffId, staffName, departmentId, departmentName } =
  storeToRefs(useUserStoreHook());
const { getRootDeptList } = userDepartmentStoreHook();
const { getDepartmentTree } = userDepartmentStoreHook();
const { getProjectWinBidNVList } = userProjectStoreHook();
//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};
// 表单模型
const INITIAL_DATA = {
  id: undefined, //业务表申请主键ID
  staffId: staffId.value, //经办人ID
  staffName: staffName.value, //经办人姓名
  // mobile: "",
  // companyId: "",
  // companyName: "",
  deptId: departmentId.value, //所属部门Id
  deptName: departmentName.value, //所属部门
  applyReason: "", //申请事由
  // cancelReason: "",
  // applyTime: "",
  // applyDate: "",
  // applyStatus: 0,
  // applyStatusExpr: "",
  // canTemp: true,
  // canApprove: true,
  // canReject: true,
  // canCancel: true,
  // canReturnBack: true,
  // canEdit: true,
  // canDel: true,
  // busiType: "",
  doTemp: false, //暂存：true，提交：false
  // comment1: "",
  reviewers: [
    // {
    //   id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   applyBusiId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   reviewerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   reviewerName: "string",
    //   deptName: "string",
    //   isApproved: true,
    //   approveTime: "2022-11-16T08:27:25.269Z",
    //   comment: "string",
    //   isReturnBack: true,
    //   hasApproved: true,
    //   isCurrentReviewer: true,
    //   isStarter: true,
    //   isCurrent: true
    // }
  ],
  reviewersShow: [
    // {
    //   id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   applyBusiId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   reviewerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   reviewerName: "string",
    //   deptName: "string",
    //   isApproved: true,
    //   approveTime: "2022-11-16T08:27:25.269Z",
    //   comment: "string",
    //   isReturnBack: true,
    //   hasApproved: true,
    //   isCurrentReviewer: true,
    //   isStarter: true,
    //   isCurrent: true
    // }
  ],
  // nonDailyExpenseId: "",
  belong: 1,
  projId: "",
  projName: "", //项目名称
  belongCompanyId: "",
  belongCompanyName: "",
  expenseCategory: "", //费用类别
  amount: 0, //金额
  invoiceAttachList: [
    // {
    //   id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   dailyExpenseId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   invoiceCategory: "string",
    //   invoiceCode: "string",
    //   invoiceNum: "string",
    //   filePath: "string"
    // }
  ],
  remark: ""
};
const projectValidator = (rule, value, callback) => {
  if (formData.value.belong == 1 && !value) {
    callback(new Error("请输项目名称"));
  } else {
    callback();
  }
};
const companyValidator = (rule, value, callback) => {
  if (formData.value.belong == 2 && !value) {
    callback(new Error("请输入公司名称"));
  } else {
    callback();
  }
};
// 表单校验规则
const fromRules = {
  expenseCategory: [
    { required: true, message: "请选择费用类别", trigger: "change" }
  ],
  invoiceAttachList: [
    { required: false, message: "请上传发票", trigger: "blur" }
  ],
  amount: [
    {
      required: true,
      message: "金额必须大于0",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error("金额必须大于0"));
        } else {
          callback();
        }
      }
    }
  ],
  deptId: [{ required: true, message: "请选中部门", trigger: "change" }],
  staffId: [{ required: true, message: "请输入经办人", trigger: "blur" }],
  projId: [
    {
      message: "请输项目名称",
      trigger: "change",
      validator: projectValidator
    }
  ],
  belongCompanyId: [
    {
      message: "请输入公司名称",
      trigger: "change",
      validator: companyValidator
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

//审核表单验证规则
const auditFormRules = {
  comment1: [
    {
      message: "审核意见不能为空",
      validator: validateAuditForm
    }
  ]
};
const fileRules = {
  invoiceCategory: [
    { required: true, message: "请选择发票类别", trigger: "change" }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);
const props = defineProps({
  expensesTypeIptions: {
    type: [],
    default: () => []
  },
  invoiceTypeOptions: {
    type: [],
    default: () => []
  },
  projectList: {
    type: [],
    default: () => []
  }
});

// 审核结果枚举
enum AuditResult {
  agree,
  refuse,
  back
}

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const reviewers = ref([]); //审批人员
const cascaderRef = ref();
const loading = ref(false);
const staffOptions = ref([]); //职工选项
const showType = ref("apply");
const dialogVisible = ref(false);
const fileUploading = ref(false);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const uploadRef = ref<UploadInstance>();
const fileRormRef = ref<FormInstance>();
const ruleFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const fileList = ref<UploadUserFile[]>([]);
const tableColumnData = ref([]);

const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const { departmentTree } = storeToRefs(userDepartmentStoreHook());
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
const { winBidProjectNVList } = storeToRefs(userProjectStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加日常费用报销"
    : showType.value == "edit"
      ? "编辑日常费用报销"
      : showType.value == "read"
        ? "查看日常费用报销"
        : showType.value == "apply"
          ? "申请日常费用报销"
          : showType.value == "audit"
            ? "审核日常费用报销"
            : "";
});
const uploadEnabled = computed(() => {
  return fileList.value.find(item => item.status != "success");
});

watch(
  () => formData.value.deptId,
  newVal => {
    if (!newVal) {
      formData.value.deptName = "";
      formData.value.staffName = "";
      formData.value.staffId = "";
      staffOptions.value = [];
      return;
    }
    getStaffList("");
  }
);
watch(
  () => formData.value.belong,
  newVal => {
    console.log("belong", newVal);
    if (newVal == 1) {
      formData.value.belongCompanyId = "";
    } else {
      formData.value.projId = "";
    }
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  getProjectWinBidNVList();
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    getDetail(_formData.id);
  }
  getStaffList("");
};
defineExpose({ show });

// 根据Id获取日常费用报销详情
const getDetail = async id => {
  loading.value = true;
  const { data = {} } = await getDailyExpense({
    id
  });
  formData.value = data || {};
  if (
    formData.value.invoiceAttachList &&
    formData.value.invoiceAttachList.length > 0
  ) {
    fileList.value = formData.value.invoiceAttachList.map(item => {
      return {
        name: item.filePath.substr(item.filePath.lastIndexOf("/") + 1),
        url: item.filePath,
        invoiceCategory: item.invoiceCategory,
        invoiceCode: item.invoiceCode,
        invoiceNum: item.invoiceNum,
        amount: item.amount
      };
    });
  }
  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });
  if (data) {
    reviewers.value = data.reviewers || [];
  }
  loading.value = false;
};

function getStaffList(queryString) {
  return new Promise<any[]>(resolve => {
    getStaffListByDeptId({
      deptId: formData.value.deptId,
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

const handleProjectSelect = val => {
  if (val) {
    const proj = winBidProjectNVList.value.find(item => item.value == val);
    formData.value.projName = proj.name;
  } else {
    formData.value.projName = "";
  }
};
const handleCompanySelect = val => {
  if (val) {
    const company = rootDepartment.value.find(item => item.id == val);
    formData.value.belongCompanyName = company.fullName;
  } else {
    formData.value.belongCompanyName = "";
  }
};

const handleOperatorSelect = val => {
  if (val) {
    const staff = staffOptions.value.find(item => item.value == val);
    formData.value.staffName = staff.name;
  } else {
    formData.value.staffName = "";
  }
};

function handleDeptChange() {
  formData.value.staffName = "";
  formData.value.staffId = "";
  const node = cascaderRef.value.getCheckedNodes();
  if (node) {
    formData.value.deptName = node[0]?.label;
  } else {
    formData.value.deptName = "";
  }
}

const handleBeforeUpload: UploadProps["beforeUpload"] = _rawFile => {
  // if (_rawFile.size / 1024 / 1024 > 50) {
  //   ElMessage.error("所选文件不能超过5Mb");
  //   return false;
  // }
  return true;
};

function handleFileChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
  if (uploadFile.status == "ready") {
    uploadFile.invoiceCategory = "";
    uploadFile.amount = 0;
  }

  console.log("handleFileChange uploadFile", uploadFile);
  console.log("handleFileChange uploadFiles", uploadFiles);
}

function handleRemove(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  console.log("handleRemove fileList", fileList.value);
  console.log("handleRemove uploadFiles", uploadFiles);
  formData.value[action] = fileList.value.map((item: any) => {
    return {
      filePath: item.url ? item.url : item.raw.temp,
      invoiceCode: item.invoiceCode ? item.invoiceCode : item.raw?.invoiceCode,
      invoiceNum: item.invoiceNum ? item.invoiceNum : item.raw?.invoiceNum,
      invoiceCategory: item.invoiceCategory
        ? item.invoiceCategory
        : item.raw?.invoiceCategory,
      amount: item.amount ? item.amount : item.raw?.amount
    };
  });
  ruleFormRef.value.validateField(action, () => null);
  calcAmount();
}
function handleExceed(_files: File[], _uploadFiles: UploadFiles) {
  // uploadRef.value!.clearFiles();
  // const file = _files[0] as UploadRawFile;
  // file.uid = genFileId();
  // uploadRef.value!.handleStart(file);
  // uploadRef.value!.submit();
}
const handleError = (
  error: Error,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  console.log("handleError error", error);
  console.log("handleError uploadFile", uploadFile);
  console.log("handleError uploadFiles", uploadFiles);
  uploadRef.value.abort(uploadFile);
  console.log("handleError abort");
};
const handleSuccess = async _response => {
  console.log("handleSuccess");
  // uploadRef.value.clearFiles();
};

function calcAmount() {
  formData.value.amount = 0;
  formData.value.amount = Number(
    Number(
      fileList.value.reduce(
        (accumulator, currentValue: any) =>
          accumulator + parseFloat(currentValue.amount),
        formData.value.amount
      )
    ).toFixed(2)
  );
}
//上传文件
async function handleUpLoad(options) {
  console.log("options", options);
  const currentFile = fileList.value.find(item => item.uid == options.file.uid);
  const path = "/tyOA/DailyExpenses";
  const param = {
    path: path,
    file: options.file,
    invoiceCategory: currentFile.invoiceCategory
  };
  fileUploading.value = true;
  return new Promise((resolve, reject) => {
    uploadInvoice(param)
      .then(({ code, message, data }) => {
        console.log("data", data);
        if (code == 0) {
          const hasInvoice = fileList.value.find(
            item =>
              item.invoiceNum == data.invoiceNum &&
              item.invoiceCode == data.invoiceCode
          );
          if (hasInvoice) {
            ElMessage.warning("不能重复上传同一张发票");
            reject();
          } else {
            ElMessage.success(message);
            options.file.temp = data.filePath;
            options.file.invoiceCode = data.invoiceCode;
            options.file.invoiceNum = data.invoiceNum;
            options.file.amount = data.amount;
            options.file.invoiceCategory = data.identifyInvoiceCategory;
            console.log("options", options);
            console.log("fileList", fileList.value);
            fileList.value.forEach(element => {
              if (element.uid == options.file.uid) {
                element.invoiceCode = data.invoiceCode;
                element.invoiceNum = data.invoiceNum;
                element.amount = data.amount;
                element.invoiceCategory = data.identifyInvoiceCategory;
              }
            });
            formData.value[options.action] = fileList.value.map((item: any) => {
              return {
                filePath: item.url ? item.url : item.raw.temp,
                invoiceCode: item.invoiceCode
                  ? item.invoiceCode
                  : item.raw.invoiceCode,
                invoiceNum: item.invoiceNum
                  ? item.invoiceNum
                  : item.raw.invoiceNum,
                amount: item.amount ? item.amount : item.raw.amount,
                invoiceCategory: item.invoiceCategory
              };
            });
            calcAmount();
            ruleFormRef.value.validateField(options.action, () => null);
            resolve("");
          }
        } else {
          reject();
        }
      })
      .catch(() => {
        reject();
      })
      .finally(() => {
        fileUploading.value = false;
      });
  });
}

const submitUpload = () => {
  fileRormRef.value.validate(_valid => {
    if (_valid) {
      uploadRef.value!.submit();
    } else {
      ruleFormRef.value.clearValidate("invoiceAttachList");
    }
  });
};

function removeFile(file) {
  uploadRef.value.handleRemove(file);
}

function handleInvoiceCategory(val, _file) {
  console.log("handleInvoiceCategory _file", _file);
  if (_file.raw) _file.raw.invoiceCategory = _file.invoiceCategory;
  formData.value.invoiceAttachList.forEach(element => {
    const url = _file.url ? _file.url : _file.raw.temp;
    if (element.filePath == url) {
      console.log("url", url);
      element.invoiceCategory = val;
    }
  });
  console.log("formData", formData.value);
}

function handleAmount(val, _file) {
  console.log("handleAmount", _file);
  _file.amount = val ? Math.abs(parseFloat(val)) : 0;
  if (_file.raw) _file.raw.amount = _file.amount;
  formData.value.invoiceAttachList.forEach(element => {
    const url = _file.url ? _file.url : _file.raw.temp;
    if (element.filePath == url) {
      console.log("url", url);
      element.amount = val;
    }
  });
  console.log("formData", formData.value);
  calcAmount();
}

// 提交表单
const submitForm = _.debounce(
  (formEl: FormInstance | undefined, doTemp: boolean) => {
    console.log("formData", formData.value);
    if (!formEl) return;
    console.log("fileList", fileList.value);
    loading.value = true;
    formEl.validate(valid => {
      if (valid) {
        formData.value.doTemp = doTemp;
        if (showType.value == "apply") {
          addDailyExpense(formData.value)
            .then(({ code, message }) => {
              if (code == 0) {
                ElMessage.success(message);
                dialogVisible.value = false;
                resetForm(formEl);
                emit("search");
              }
            })
            .finally(() => {
              loading.value = false;
            });
        } else if (showType.value == "edit") {
          editDailyExpense(formData.value)
            .then(({ code, message }) => {
              if (code == 0) {
                ElMessage.success(message);
                dialogVisible.value = false;
                resetForm(formEl);
                emit("search");
              }
            })
            .finally(() => {
              loading.value = false;
            });
        }
      } else {
        fileRormRef.value.clearValidate("invoiceCategory");
        loading.value = false;
      }
    });
  },
  300
);

// 提交审核表单
const submitAuditForm = _.debounce(
  (formEl: FormInstance | undefined, _auditResult: AuditResult) => {
    if (!formEl) return;
    auditResult.value = _auditResult;
    formEl.validate(valid => {
      if (valid) {
        loading.value = true;
        approveDailyExpense({
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
              dialogVisible.value = false;
              resetForm(formEl);
              emit("search");
              emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
            }
          })
          .catch()
          .finally(() => {
            loading.value = false;
          });
      }
    });
  },
  300
);

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  fileList.value = [];
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
    :width="900"
    :class="showType == 'add' || showType == 'edit' ? '' : 'auditDialog'"
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
      :disabled="showType == 'read' || showType == 'audit'"
      :model="formData"
      :rules="fromRules"
      label-width="78px"
    >
      <el-row :gutter="40">
        <el-col
          v-if="showType == 'add' || showType == 'edit' || showType == 'apply'"
          :span="8"
          :offset="0"
        >
          <el-form-item label="所属部门" prop="deptId">
            <el-cascader
              ref="cascaderRef"
              v-model="formData.deptId"
              :options="departmentTree"
              placeholder="请选择"
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
              @change="handleDeptChange"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col
          v-if="showType == 'read' || showType == 'audit'"
          :span="8"
          :offset="0"
        >
          <el-form-item label="所属部门" prop="deptName">
            <el-input v-model="formData.deptName" readonly />
          </el-form-item>
        </el-col>
        <el-col
          v-if="showType == 'add' || showType == 'edit' || showType == 'apply'"
          :span="8"
          :offset="0"
        >
          <el-form-item label="经办人" prop="staffId">
            <el-select
              v-model.trim="formData.staffId"
              :disabled="!formData.deptId"
              :title="!formData.deptId ? '请先选择所属部门' : ''"
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
        </el-col>
        <el-col
          v-if="showType == 'read' || showType == 'audit'"
          :span="8"
          :offset="0"
        >
          <el-form-item label="经办人" prop="staffName">
            <el-input v-model="formData.staffName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="报销归属" prop="belong">
            <el-select
              v-model="formData.belong"
              placeholder="请选择"
              :disabled="showType != 'apply'"
              :title="showType != 'apply' ? '仅申请时可编辑' : ''"
            >
              <el-option label="项目" :value="1" />
              <el-option label="非项目" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="formData.belong == 1" :span="8" :offset="0">
          <el-form-item label="项目名称" prop="projId">
            <el-select
              v-model.trim="formData.projId"
              :multiple="false"
              filterable
              placeholder="请输入"
              @change="handleProjectSelect"
            >
              <el-option
                v-for="item in winBidProjectNVList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="formData.belong == 2" :span="8" :offset="0">
          <el-form-item label="公司名称" prop="belongCompanyId">
            <el-select
              v-model.trim="formData.belongCompanyId"
              :multiple="false"
              filterable
              placeholder="请输入"
              @change="handleCompanySelect"
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
        <el-col :span="8" :offset="0">
          <el-form-item label="费用类别" prop="expenseCategory">
            <el-select v-model="formData.expenseCategory" placeholder="请选择">
              <el-option
                v-for="item in props.expensesTypeIptions"
                :key="item.value"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="金额" prop="amount">
            <template #label>
              <p class="flex items-center">
                <span>金额</span>
                <el-tooltip
                  content="不仅为电子票金额"
                  placement="top"
                  effect="dark"
                >
                  <IconifyIconOffline
                    icon="questionFilled"
                    class="icon ml-1 w-[15px] h-[15px] cursor-pointer text-gray-400"
                  />
                </el-tooltip>
              </p>
            </template>
            <el-input
              v-model.trim="formData.amount"
              :readonly="false"
              placeholder=""
              clearable
              type="number"
              @change="
                val => {
                  formData.amount = val ? Math.abs(Number(val)) : 0;
                }
              "
            >
              <template #suffix>
                {{ "元" }}
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="申请事由" prop="applyReason">
            <el-input
              v-model.trim="formData.applyReason"
              :readonly="showType == 'read'"
              type="textarea"
              show-word-limit
              :maxlength="255"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item
            :label="showType == 'read' ? '发票' : '发票上传'"
            prop="invoiceAttachList"
          >
            <el-upload
              ref="uploadRef"
              v-model:file-list="fileList"
              :disabled="showType == 'read' || fileUploading"
              accept=".pdf"
              action="invoiceAttachList"
              :auto-upload="true"
              :show-file-list="false"
              :before-upload="handleBeforeUpload"
              :on-change="handleFileChange"
              :http-request="handleUpLoad"
              :on-exceed="handleExceed"
              :on-error="handleError"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove(uploadFile, uploadFiles, 'invoiceAttachList');
                }
              "
              :on-success="handleSuccess"
            >
              <template v-if="showType != 'read'" #trigger>
                <el-button plain type="primary">选择文件</el-button>
              </template>
              <el-button
                v-if="false && showType != 'read'"
                plain
                type="primary"
                :loading="fileUploading"
                :disabled="!uploadEnabled"
                class="ml-4"
                @click="submitUpload"
                >上传</el-button
              >
              <DownloadButton
                v-if="false && showType == 'read' && fileList.length > 0"
                :loading="fileUploading"
                :showFileName="true"
                :srcList="fileList.map(item => item.url)"
              />
              <span v-if="showType == 'read' && fileList.length < 1">
                未上传
              </span>
              <template v-if="showType != 'read'" #tip>
                <div class="el-upload__tip text-red ml-4">仅支持pdf</div>
              </template>
            </el-upload>
            <el-form
              ref="fileRormRef"
              style="width: 100%"
              :model="fileList[fileList.length - 1]"
              :rules="fileRules"
              label-width="0"
              :inline="false"
            >
              <el-table :data="fileList" border stripe>
                <el-table-column
                  type="index"
                  label="序号"
                  width="60"
                  fixed="left"
                  align="center"
                />
                <el-table-column
                  prop="invoiceCategory"
                  label="发票类别"
                  align="center"
                  width="100"
                >
                  <template v-if="false" #default="{ row }">
                    <el-form-item label="" required prop="invoiceCategory">
                      <el-select
                        v-model="row.invoiceCategory"
                        :disabled="true"
                        placeholder="发票类别"
                        style="width: 100%"
                        @change="handleInvoiceCategory($event, row)"
                      >
                        <el-option
                          v-for="item in props.invoiceTypeOptions"
                          :key="item.value"
                          :label="item.name"
                          :value="item.name"
                        />
                      </el-select>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column
                  width="100"
                  prop="invoiceNum"
                  label="票号"
                  align="center"
                />
                <el-table-column
                  width="140"
                  prop="invoiceCode"
                  label="发票识别码"
                  align="center"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="name"
                  label="文件名"
                  min-width="140"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="amount"
                  label="金额（元）"
                  width="120"
                  align="right"
                >
                  <template #default="{ row }">
                    <el-form-item label="" required prop="amount">
                      <el-input
                        v-model="row.amount"
                        :disabled="showType == 'read' || showType == 'audit'"
                        placeholder=""
                        clearable
                        type="number"
                        @change="handleAmount($event, row)"
                      />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column
                  width="100"
                  label="操作"
                  align="center"
                  fixed="right"
                >
                  <template #default="{ row }">
                    <el-button-group>
                      <el-button
                        v-if="false"
                        type="primary"
                        :loading="fileUploading"
                        :disabled="row.status == 'success'"
                        :title="row.status == 'success' ? '已上传' : ''"
                        size="default"
                        @click="submitUpload"
                        >上传</el-button
                      >
                      <PreviewButton
                        v-if="showType != 'apply' && row.url"
                        :srcList="[row.url]"
                        size="default"
                      />
                      <el-button
                        v-if="showType == 'apply' || showType == 'edit'"
                        size="default"
                        link
                        type="danger"
                        @click="removeFile(row)"
                      >
                        删除
                      </el-button>
                      <DownloadButton
                        v-if="showType != 'apply' && showType != 'edit'"
                        :showFileName="false"
                        :srcList="[row.url]"
                      />
                    </el-button-group>
                  </template>
                </el-table-column>
              </el-table>
            </el-form>
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
      :label-width="activeName == 'auditInfo' ? '92px' : '78px'"
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
      <el-button @click="dialogVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'read' && showType != 'audit'"
        :disabled="fileUploading"
        :loading="loading"
        :title="fileUploading ? '文件上传中' : ''"
        type="success"
        @click="submitForm(ruleFormRef, true)"
      >
        暂存
      </el-button>
      <el-button
        v-if="showType != 'read' && showType != 'audit'"
        :disabled="fileUploading"
        :loading="loading"
        :title="fileUploading ? '文件上传中' : ''"
        type="primary"
        @click="submitForm(ruleFormRef, false)"
      >
        提交
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="primary"
        :loading="loading"
        @click="submitAuditForm(auditFormRef, AuditResult.agree)"
        >同意
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="danger"
        :loading="loading"
        @click="submitAuditForm(auditFormRef, AuditResult.refuse)"
        >拒绝
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="success"
        :loading="loading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
:deep() {
  .el-form-item__content .el-input__wrapper {
    width: auto !important;
  }

  .el-form-item__content > div {
    display: flex;
    align-items: center;
  }

  .el-upload--text,
  .el-upload--text > div {
    width: auto;
  }
}
</style>
