<script setup lang="ts">
import {
  ElMessage,
  FormInstance,
  UploadUserFile,
  UploadRawFile,
  UploadInstance,
  genFileId,
  UploadProps
} from "element-plus";
import _ from "lodash";
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import ReadDescriptions from "@/components/ReadDescriptions";

import {
  getProjRegister,
  updateProjRegister,
  createProjRegister,
  cancelProjRegister,
  approveProjRegister,
  projRegisterUpdateAttach,
  // UpdateReturnTime,
  // UpdateProcessType,
  GetProjRegisterProcessTypeNV
} from "@/api/projRegister";
import { columns } from "../constant";
import { GetInListNV } from "@/api/bidding";
import { emitter } from "@/utils/mitt";
import { uploadImg } from "@/api/common";
import AuditForm from "@/components/AuditForm";
import { useNav } from "@/layout/hooks/useNav";
import AuditSteps from "@/components/AuditSteps";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "", //申请人ID
  staffName: "", //申请人姓名
  deptName: "", //部门名称
  mobile: "", //电话
  applyReason: "", //申请理由
  cancelReason: "", //取消理由
  applyTime: "", //申请时间
  applyStatus: "", //申请状态
  applyStatusExpr: "", //申请状态描述
  canTemp: false, //是否可以暂存
  canApprove: false, //是否可以审核
  canReject: false, //是否可以驳回（驳回之后流程结束）
  canCancel: false, //是否可以取消（针对发起人）
  doTemp: false, //是否暂存
  canReturnBack: false, //是否可以退回（由审批人退回）（退回后仍然可以继续提交申请）
  projectId: "", //项目ID
  projectFullName: "", //项目全称
  projectShortName: "", //项目简称
  inCompany: "", //收款单位
  payMethod: "", //支出类型
  payAmount: 0, //支出金额
  emergencyType: "", //紧急类型
  payTime: "", //申请日期
  drawStaffId: "", //领款人ID
  drawStaff: "", //领款人
  handStaffId: "", //经办人ID
  handStaff: "", //经办人
  comment1: "",
  returnTime: "",
  processType: "",
  latestPayDate: "", //最晚付款日期
  collectAccount: "", //收款账户
  openBank: "", //开户行
  attach: "" //附件
};

const fromRules = {
  projectId: [{ required: true, message: "请选择项目", trigger: "change" }],
  payAmount: [{ required: true, message: "请输入支出金额", trigger: "change" }],
  emergencyType: [
    { required: true, message: "请选择紧急类型", trigger: "change" }
  ],
  handStaffId: [{ required: true, message: "请选择经办人", trigger: "change" }],
  drawStaffId: [{ required: true, message: "请选择领款人", trigger: "change" }],
  returnTime: [
    { required: true, message: "请选择退回日期", trigger: "change" }
  ],
  processType: [
    { required: true, message: "请选择办理状态", trigger: "change" }
  ],

  payMethod: [{ required: true, message: "请选择支出类型", trigger: "change" }],
  comment1: [{ required: true, message: "请输入审批意见", trigger: "blur" }],
  collectAccount: [
    { required: true, message: "请输入收款账户", trigger: "blur" }
  ],
  latestPayDate: [
    { required: true, message: "请选择最晚付款日期", trigger: "change" }
  ],
  inCompany: [{ required: true, message: "请输入收款单位", trigger: "blur" }],
  openBank: [{ required: true, message: "请输入开户行", trigger: "blur" }],
  attach: [{ required: true, message: "请上传底单", trigger: "change" }]
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

enum AuditResult {
  agree,
  refuse,
  back
}

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const stauts = ref("");
const reviewers = ref([]); //审批人员
const processType = ref([]); //办理状态
const formData = ref(null);
const tableColumnData = ref([]);
const showType = ref("add");
const formVisible = ref(false);
const formLoading = ref(false);
const { staffName } = useNav(); //用户名
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const auditFormRef = ref<FormInstance>();
const ruleFormRef = ref<FormInstance>();
const uploadRef = ref<UploadInstance>();
const canceFormRef = ref<FormInstance>();
const fileList = ref<UploadUserFile[]>([]);
const winBidProjectNVList = ref([]);
const { staffListNV } = storeToRefs(userStaffStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加支出"
    : showType.value == "edit"
      ? "编辑支出"
      : showType.value == "read"
        ? "查看"
        : showType.value == "audit"
          ? "审批"
          : showType.value == "undo"
            ? "撤回"
            : showType.value == "upload"
              ? "底单上传"
              : showType.value == "process"
                ? "办理状态编辑"
                : showType.value == "return"
                  ? "退回日期编辑"
                  : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  getProjectWinBidNVList();
  getStaffListNV();
  activeName.value = "baseInfo";
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.attach = "";
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
    await getProcessType();
  } else {
    fileList.value = [];
    showType.value = "add";
    formData.value.staffName = staffName;
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getProjRegister({ id });
  formData.value = data || {};
  fileList.value =
    formData.value.attach != null && formData.value.attach != ""
      ? [
          {
            name: formData.value.attach.substr(
              formData.value.attach.lastIndexOf("/") + 1
            ),
            url: formData.value.attach
          }
        ]
      : [];
  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });
  if (data) {
    reviewers.value = data.reviewers || [];
  }
  formLoading.value = false;
}

//办理状态
async function getProcessType() {
  const { data } = await GetProjRegisterProcessTypeNV();
  processType.value = data;
}

async function getProjectWinBidNVList() {
  const { data } = await GetInListNV();
  winBidProjectNVList.value = data || [];
}

//选择中标项目之后关联数据
function handleProjectChange(val) {
  const project = winBidProjectNVList.value.find(item => item.value == val);
  formData.value.projectFullName = project.name;
}

// const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
//   if (rawFile.size / 1024 / 1024 > 5) {
//     ElMessage.error("所选文件不能超过5Mb");
//     return false;
//   }
//   return true;
// };

//上传文件
async function fileUpload(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    console.log("res", res);
    formData.value[options.action] = res["data"][0];
    // formData.value.attach.unshift(res["data"][0]);
    fileList.value = [{ name: options.file.name, url: res["data"][0] }];
    ruleFormRef.value.validateField(options.action, () => null);
  });
}
function handleRemove(action: string) {
  formData.value[action] = "";
}
const handleError = () => {
  uploadRef.value.clearFiles();
};

const handleSuccess = async response => {
  console.log("response", response);
  uploadRef.value.clearFiles();
};

const handlePreview: UploadProps["onPreview"] = file => {
  console.log(file);
};
const handleExceed: UploadProps["onExceed"] = files => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  uploadRef.value!.submit();
};

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, flag: boolean) => {
    if (!formEl) return;
    formEl.validate(async valid => {
      if (valid) {
        if (formData.value.id) {
          if (showType.value == "add") {
            formData.value.doTemp = flag;
            updateProjRegister(formData.value).then(({ code, message }) => {
              if (code == 0) {
                ElMessage.success(message);
                formVisible.value = false;
                resetForm(formEl);
                emit("search");
              }
            });
          } else if (showType.value == "upload") {
            projRegisterUpdateAttach({
              id: formData.value.id,
              attach: formData.value.attach,
              processType: formData.value.processType,
              returnTime: formData.value.returnTime
            }).then(({ code, message }) => {
              if (code == 0) {
                ElMessage.success(message);
                formVisible.value = false;
                resetForm(formEl);
                emit("search");
              }
            });
          }
          //  else if (showType.value == "process") {
          //   UpdateProcessType({
          //     id: formData.value.id,
          //     processType: formData.value.processType
          //   }).then(({ code, message }) => {
          //     if (code==0) {
          //       ElMessage.success(message);
          //       formVisible.value = false;
          //       resetForm(formEl);
          //       emit("search");
          //     }
          //   });
          // } else if (showType.value == "return") {
          //   UpdateReturnTime({
          //     id: formData.value.id,
          //     returnTime: formData.value.returnTime
          //   }).then(({ code, message }) => {
          //     if (code==0) {
          //       ElMessage.success(message);
          //       formVisible.value = false;
          //       resetForm(formEl);
          //       emit("search");
          //     }
          //   });
          // }
        } else {
          formData.value.doTemp = flag;
          createProjRegister(formData.value).then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          });
        }
      }
    });
  },
  300
);

// 提交审核表单
const submitAuditForm = _.debounce(
  async (formEl: FormInstance | undefined, _auditResult: AuditResult) => {
    if (!formEl) return;
    auditResult.value = _auditResult;
    formEl.validate(valid => {
      if (valid) {
        formLoading.value = true;
        approveProjRegister({
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
  },
  300
);

// 提交撤回表单
const submitFormQuery = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await cancelProjRegister({
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
    :width="750"
    :class="showType == 'add' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="closeDialog"
  >
    <AuditSteps
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      :reviewers="reviewers"
      :marginWidth="5"
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
    />
    <el-form
      v-else
      v-show="activeName == 'baseInfo'"
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              @change="handleProjectChange"
              ><el-option
                v-for="item in winBidProjectNVList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="投标名称" prop="projectFullName">
            <el-input v-model="formData.projectFullName" readonly />
          </el-form-item>
        </el-col> -->
        <el-col :span="12" :offset="0">
          <el-form-item label="收款单位" prop="inCompany">
            <el-input
              v-model="formData.inCompany"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="收款账户" prop="collectAccount">
            <el-input
              v-model="formData.collectAccount"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="开户行" prop="openBank">
            <el-input
              v-model="formData.openBank"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="支出类型" prop="payMethod">
            <el-select
              v-model="formData.payMethod"
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :style="{ width: '100%' }"
            >
              <el-option label="报名费" value="报名费" />
              <el-option
                label="投标保证金/投标保函"
                value="投标保证金/投标保函"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="支出金额" prop="payAmount">
            <el-input
              v-model="formData.payAmount"
              type="number"
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              @input="
                val => {
                  formData.payAmount =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>
                <p>{{ "元" }}</p>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="最晚付款日期" prop="latestPayDate">
            <el-date-picker
              v-model="formData.latestPayDate"
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              :style="{ width: '100%' }"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="紧急类型" prop="emergencyType">
            <el-select
              v-if="showType == 'add' || showType == 'edit'"
              v-model="formData.emergencyType"
              placeholder="请选择"
              :style="{ width: '100%' }"
            >
              <el-option label="正常" value="正常" />
              <el-option label="紧急" value="紧急" />
            </el-select>
            <el-tag
              v-else
              :type="formData.emergencyType == '紧急' ? 'danger' : 'info'"
            >
              {{ formData.emergencyType }}
            </el-tag>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="领款人" prop="drawStaffId">
            <el-select
              v-model="formData.drawStaffId"
              :collapse-tags-tooltip="true"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :style="{ width: '100%' }"
              filterable
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
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
          <el-form-item label="经办人" prop="handStaffId">
            <el-select
              v-model="formData.handStaffId"
              :collapse-tags-tooltip="true"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :style="{ width: '100%' }"
              filterable
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            >
              <el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
            <!-- <el-input
              :readonly="showType == 'audit' || showType == 'read' || showType == 'undo'"
              v-model="formData.handStaffId"
            /> -->
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="applyReason">
            <el-input
              v-model="formData.applyReason"
              :rows="2"
              type="textarea"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            />
          </el-form-item>
        </el-col>
        <el-col v-if="showType == 'upload'" :span="12" :offset="0">
          <el-form-item label="办理日期" prop="returnTime">
            <el-date-picker
              v-model="formData.returnTime"
              :style="{ width: '100%' }"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>

        <el-col v-if="showType == 'upload'" :span="12" :offset="0">
          <el-form-item label="办理状态" prop="processType">
            <el-select
              v-model="formData.processType"
              :style="{ width: '100%' }"
              filterable
            >
              <el-option
                v-for="item in processType"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          v-if="showType != 'add' && showType != 'edit'"
          :span="24"
          :offset="0"
        >
          <el-form-item label="底单附件" prop="attach">
            <el-upload
              ref="uploadRef"
              :disabled="showType != 'upload'"
              accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg,.png"
              :file-list="fileList"
              :auto-upload="true"
              :http-request="fileUpload"
              :limit="1"
              action="attach"
              :on-exceed="handleExceed"
              :on-preview="handlePreview"
              :on-remove="
                () => {
                  handleRemove('attach');
                }
              "
              :on-error="handleError"
              :on-success="handleSuccess"
            >
              <el-button v-if="showType == 'upload'" type="primary" text
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col
          v-if="
            showType == 'undo' ||
            (showType == 'read' && formData.applyStatus == 5)
          "
          :span="24"
          :offset="0"
        >
          <el-form-item label="撤回理由" prop="cancelReason">
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
      :label-width="activeName == 'auditInfo' ? '92px' : '85px'"
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
        v-if="
          showType == 'add' ||
          showType == 'edit' ||
          showType == 'upload' ||
          showType == 'return' ||
          showType == 'process'
        "
        type="primary"
        @click="submitForm(ruleFormRef, false)"
        >确定
      </el-button>
      <el-button
        v-if="showType == 'undo'"
        @click="submitFormQuery(canceFormRef)"
        >确定</el-button
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
