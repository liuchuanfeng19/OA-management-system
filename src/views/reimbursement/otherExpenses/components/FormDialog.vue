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
  addNonDailyExpense,
  editNonDailyExpense,
  getNonDailyExpense,
  approveNonDailyExpense
} from "@/api/nonDailyExpense";
import { emitter } from "@/utils/mitt";
import { uploadImg } from "@/api/common";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { getStaffListByDeptId } from "@/api/staff";
import { useUserStoreHook } from "@/store/modules/user";
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
  // nonNonDailyExpenseId: "",
  belong: 1,
  projId: "",
  projName: "", //项目名称
  belongCompanyId: "",
  belongCompanyName: "",
  expenseCategory: "", //费用类别
  invoiceCategory: "", //发票类别
  amount: 0, //金额
  invoiceAttachList: [],
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
  invoiceCategory: [
    { required: false, message: "请选择发票类别", trigger: "change" }
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
  },
  treeData: {
    type: [],
    default: () => []
  }
});

enum AuditResult {
  agree,
  refuse,
  back
}

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const auditResult = ref<AuditResult>(); //审批结果
const reviewers = ref([]); //审批人员
const cascaderRef = ref();
const loading = ref(false);
const staffOptions = ref([]); //职工选项
const showType = ref("apply");
const dialogVisible = ref(false);
const fileUploading = ref(false);
const activeName = ref("baseInfo");
const uploadRef = ref<UploadInstance>();
const ruleFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const fileList = ref<UploadUserFile[]>([]);
const { departmentTree } = storeToRefs(userDepartmentStoreHook());
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
const { winBidProjectNVList } = storeToRefs(userProjectStoreHook());
const tableColumnData = ref([]);

const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加非日常费用报销"
    : showType.value == "edit"
      ? "编辑非日常费用报销"
      : showType.value == "read"
        ? "查看非日常费用报销"
        : showType.value == "apply"
          ? "申请非日常费用报销"
          : showType.value == "audit"
            ? "审核非日常费用报销"
            : "";
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

// 根据Id获取非日常费用报销详情
const getDetail = async id => {
  loading.value = true;
  const { data = {} } = await getNonDailyExpense({
    id
  });
  formData.value = data || {};
  if (
    formData.value.invoiceAttachList &&
    formData.value.invoiceAttachList.length > 0
  ) {
    fileList.value = formData.value.invoiceAttachList.map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
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

function handleRemove(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = fileList.value.map((item: any) =>
    item.url ? item.url : item.raw.temp
  );
  ruleFormRef.value.validateField(action, () => null);
}
function handleExceed(_files: File[], _uploadFiles: UploadFiles) {
  // uploadRef.value!.clearFiles();
  // const file = _files[0] as UploadRawFile;
  // file.uid = genFileId();
  // uploadRef.value!.handleStart(file);
  // uploadRef.value!.submit();
}
const handleError = () => {
  uploadRef.value.clearFiles();
};
const handleSuccess = async _response => {
  // uploadRef.value.clearFiles();
};
//上传文件
async function handleUpLoad(options) {
  const path = "/tyOA/FileManage";
  const param = { path: path, file: options.file };
  fileUploading.value = true;
  uploadImg(param)
    .then(res => {
      options.file.temp = res["data"][0];
      formData.value[options.action] = fileList.value.map((item: any) =>
        item.url ? item.url : item.raw.temp
      );
      ruleFormRef.value.validateField(options.action, () => null);
    })
    .finally(() => {
      fileUploading.value = false;
    });
}

// 提交表单
const submitForm = _.debounce(
  (formEl: FormInstance | undefined, doTemp: boolean) => {
    if (!formEl) return;
    loading.value = true;
    formEl.validate(valid => {
      if (valid) {
        formData.value.doTemp = doTemp;
        if (showType.value == "apply") {
          addNonDailyExpense(formData.value)
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
          editNonDailyExpense(formData.value)
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
      console.log("valid", valid);
      if (valid) {
        loading.value = true;
        approveNonDailyExpense({
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
    :width="700"
    :class="
      showType == 'add' || showType == 'edit' || showType == 'apply'
        ? ''
        : 'auditDialog'
    "
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
          :span="12"
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
          :span="12"
          :offset="0"
        >
          <el-form-item label="所属部门" prop="deptName">
            <el-input v-model="formData.deptName" readonly />
          </el-form-item>
        </el-col>
        <el-col
          v-if="showType == 'add' || showType == 'edit' || showType == 'apply'"
          :span="12"
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
          :span="12"
          :offset="0"
        >
          <el-form-item label="经办人" prop="staffName">
            <el-input v-model="formData.staffName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
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
        <el-col v-if="formData.belong == 1" :span="12" :offset="0">
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
        <el-col v-if="formData.belong == 2" :span="12" :offset="0">
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
        <el-col :span="12" :offset="0">
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
        <el-col v-if="false" :span="12" :offset="0">
          <el-form-item label="发票类别" prop="invoiceCategory">
            <el-select v-model="formData.invoiceCategory" placeholder="请选择">
              <el-option
                v-for="item in props.invoiceTypeOptions"
                :key="item.value"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="金额" prop="amount">
            <el-input
              v-model.trim="formData.amount"
              placeholder=""
              clearable
              type="number"
              @change="
                val => {
                  formData.amount = val ? Math.abs(parseFloat(val)) : 0;
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
              placeholder="请输入内容"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="false" :span="24" :offset="0">
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
              :show-file-list="showType != 'read'"
              :before-upload="handleBeforeUpload"
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
              <el-button v-if="showType != 'read'" type="primary" text>
                选择文件
              </el-button>
              <DownloadButton
                v-else-if="fileList.length > 0"
                :loading="fileUploading"
                :showFileName="true"
                :srcList="fileList.map(item => item.url)"
              />
              <span v-else> 未上传 </span>
              <template v-if="showType != 'read'" #tip>
                <div class="el-upload__tip text-red">仅支持pdf格式文件</div>
              </template>
            </el-upload>
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
