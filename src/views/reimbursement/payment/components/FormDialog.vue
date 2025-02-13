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
  getDailyExpense
} from "@/api/dailyExpense";
import { uploadInvoice } from "@/api/common";
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
// const selProps = {
//   children: "children",
//   label: "fullName",
//   multiple: false,
//   emitPath: false,
//   value: "id",
//   checkStrictly: true
// };
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
    { required: true, message: "请上传发票", trigger: "blur" }
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
  },
  treeData: {
    type: [],
    default: () => []
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const reviewers = ref([]); //审批人员
// const cascaderRef = ref();
const loading = ref(false);
const staffOptions = ref([]); //职工选项
const showType = ref("apply");
const dialogVisible = ref(false);
const fileUploading = ref(false);
const activeName = ref("baseInfo");
const uploadRef = ref<UploadInstance>();
const fileRormRef = ref<FormInstance>();
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const fileList = ref<UploadUserFile[]>([]);
const { departmentTree } = storeToRefs(userDepartmentStoreHook());
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
const { winBidProjectNVList } = storeToRefs(userProjectStoreHook());
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加费用打款"
    : showType.value == "edit"
      ? "编辑费用打款"
      : showType.value == "read"
        ? "查看费用打款"
        : showType.value == "apply"
          ? "申请费用打款"
          : showType.value == "audit"
            ? "审核费用打款"
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
  getProjectWinBidNVList();
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    getDetail(_formData.id);
  }
  getStaffList("");
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
};
defineExpose({ show });

// 根据Id获取费用打款详情
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
        invoiceCategory: item.invoiceCategory
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

// const handleOperatorSelect = val => {
//   if (val) {
//     const staff = staffOptions.value.find(item => item.value == val);
//     formData.value.staffName = staff.name;
//   } else {
//     formData.value.staffName = "";
//   }
// };

// function handleDeptChange() {
//   formData.value.staffName = "";
//   formData.value.staffId = "";
//   const node = cascaderRef.value.getCheckedNodes();
//   if (node) {
//     formData.value.deptName = node[0]?.label;
//   } else {
//     formData.value.deptName = "";
//   }
// }

const handleBeforeUpload: UploadProps["beforeUpload"] = _rawFile => {
  // if (_rawFile.size / 1024 / 1024 > 50) {
  //   ElMessage.error("所选文件不能超过5Mb");
  //   return false;
  // }
  return true;
};

function handleFileChange(uploadFile: UploadFile, uploadFiles: UploadFiles) {
  console.log("handleFileChange uploadFile", uploadFile);
  console.log("handleFileChange uploadFiles", uploadFiles);
}

/**
 * 删除文件之前的钩子，参数为上传的文件和文件列表， 若返回 false 或者返回 Promise 且被 reject，则停止删除。
 */
function handleBeforeRemove(uploadFile: UploadFile, uploadFiles: UploadFiles) {
  console.log("handleBeforeRemove uploadFile", uploadFile);
  console.log("handleBeforeRemove uploadFiles", uploadFiles);
}

function handleRemove(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  console.log("handleRemove");
  formData.value[action] = fileList.value.map((item: any) => {
    return {
      filePath: item.url ? item.url : item.raw.temp,
      invoiceCode: item.invoiceCode ? item.invoiceCode : item.raw.invoiceCode,
      invoiceNum: item.invoiceNum ? item.invoiceNum : item.raw.invoiceNum,
      invoiceCategory: item.invoiceCategory
    };
  });
  ruleFormRef.value.validateField(action, () => null);
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
//上传文件
async function handleUpLoad(options) {
  const path = "/tyOA/DailyExpenses";
  const param = {
    path: path,
    file: options.file,
    invoiceCategory: options.file.invoiceCategory
  };
  fileUploading.value = true;
  return new Promise((resolve, reject) => {
    uploadInvoice(param)
      .then(({ code, message, data }) => {
        console.log("data", data);
        if (code == 0) {
          ElMessage.success(message);
          options.file.temp = data.filePath;
          options.file.invoiceCode = data.invoiceCode;
          options.file.invoiceNum = data.invoiceNum;
          console.log("fileList", fileList.value);
          formData.value[options.action] = fileList.value.map((item: any) => {
            return {
              filePath: item.url ? item.url : item.raw.temp,
              invoiceCode: item.invoiceCode
                ? item.invoiceCode
                : item.raw.invoiceCode,
              invoiceNum: item.invoiceNum
                ? item.invoiceNum
                : item.raw.invoiceNum,
              invoiceCategory: item.invoiceCategory
            };
          });
          ruleFormRef.value.validateField(options.action, () => null);
          resolve("");
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
  _file.raw.invoiceCategory = _file.invoiceCategory;
  formData.value.invoiceAttachList.forEach(element => {
    const url = _file.url ? _file.url : _file.raw.temp;
    if ((element.url = url)) {
      element.invoiceCategory = val;
    }
  });
  console.log("formData", formData.value);
}

// 提交表单
const submitForm = _.debounce(
  (formEl: FormInstance | undefined, doTemp: boolean) => {
    console.log("formData", formData.value);
    if (!formEl) return;
    console.log("fileList", fileList.value);
    formEl.validate(valid => {
      if (valid) {
        if (!fileRormRef.value) return;
        fileRormRef.value.validate(_valid => {
          if (_valid) {
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
          }
        });
      } else {
        fileRormRef.value.clearValidate("invoiceCategory");
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
    :width="732"
    draggable
    @close="closeDialog"
  >
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
        <!-- <el-col :span="12" :offset="0">
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
        </el-col> -->
        <el-col v-if="showType == 'read'" :span="12" :offset="0">
          <el-form-item label="所属部门" prop="deptName">
            <el-input v-model="formData.deptName" readonly />
          </el-form-item>
        </el-col>
        <el-col v-if="showType == 'read'" :span="12" :offset="0">
          <el-form-item label="经办人" prop="staffName">
            <el-input v-model="formData.staffName" readonly />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0">
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
        </el-col> -->
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
        <el-col :span="12" :offset="0">
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
              :auto-upload="false"
              :show-file-list="showType != 'read'"
              :before-upload="handleBeforeUpload"
              :on-change="handleFileChange"
              :before-remove="handleBeforeRemove"
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
                <el-button type="primary" text> 选择文件 </el-button>
              </template>
              <DownloadButton
                v-if="showType == 'read' && fileList.length > 0"
                :loading="fileUploading"
                :showFileName="true"
                :srcList="fileList.map(item => item.url)"
              />
              <span v-if="showType == 'read' && fileList.length < 1">
                未上传
              </span>
              <template v-if="showType != 'read'" #tip>
                <div class="el-upload__tip text-red">仅支持pdf格式文件</div>
              </template>
              <template #file="{ file }">
                <el-row :gutter="20">
                  <el-col :span="24" :offset="0">
                    <el-input
                      v-model="file.name"
                      style="margin-bottom: 0"
                      placeholder="Please input"
                      readonly
                      class="input-with-select"
                    >
                      <template #prepend>
                        <el-form
                          ref="fileRormRef"
                          style="width: 100px; margin: 0 -20px"
                          :model="file"
                          :rules="fileRules"
                          label-width="0"
                          :inline="false"
                        >
                          <el-form-item
                            label=""
                            required
                            prop="invoiceCategory"
                          >
                            <el-select
                              v-model="file.invoiceCategory"
                              placeholder="发票类别"
                              style="width: 100px; margin-left: 0"
                              @change="handleInvoiceCategory($event, file)"
                            >
                              <el-option
                                v-for="item in props.invoiceTypeOptions"
                                :key="item.value"
                                :label="item.name"
                                :value="item.value"
                              />
                            </el-select>
                          </el-form-item>
                        </el-form>
                      </template>
                      <template #append>
                        <el-button-group>
                          <el-button
                            v-if="file.status != 'success'"
                            type="primary"
                            :loading="fileUploading"
                            :disabled="file.status == 'success'"
                            :title="file.status == 'success' ? '已上传' : ''"
                            size="default"
                            @click="submitUpload"
                            >上传</el-button
                          >
                          <el-button
                            v-if="file.status == 'success'"
                            type="primary"
                            size="default"
                            @click="removeFile"
                            >删除</el-button
                          >
                        </el-button-group>
                      </template>
                    </el-input>
                  </el-col>
                </el-row>
              </template>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button
        v-if="showType == 'apply' || showType == 'edit' || showType == 'read'"
        @click="dialogVisible = false"
      >
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'read'"
        :disabled="fileUploading"
        :loading="loading"
        :title="fileUploading ? '文件上传中' : ''"
        type="success"
        @click="submitForm(ruleFormRef, true)"
      >
        暂存
      </el-button>
      <el-button
        v-if="showType != 'read'"
        :disabled="fileUploading"
        :loading="loading"
        :title="fileUploading ? '文件上传中' : ''"
        type="primary"
        @click="submitForm(ruleFormRef, false)"
      >
        提交
      </el-button>
    </template>
  </el-dialog>
</template>
