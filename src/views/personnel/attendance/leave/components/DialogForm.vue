<script setup lang="ts">
import {
  ElMessage,
  UploadProps,
  FormInstance,
  UploadInstance,
  UploadUserFile
} from "element-plus";
import _ from "lodash";
import dayjs from "dayjs";
import { ref, computed, watch } from "vue";
import { useNav } from "@/layout/hooks/useNav";

import {
  updateLeave,
  createLeave,
  getLeave,
  Approve,
  Cancel,
  getCcStaffListNV,
  GetLeaveTypesNV
} from "@/api/personnel";
import { CalcLeaveDays } from "@/api/leaveApply";
import { emitter } from "@/utils/mitt";
import { uploadImg } from "@/api/common";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
// import { getConfigNameValueListByKey } from "@/api/config";
import { DownloadButton } from "@/components/DownloadButton";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

enum AuditResult {
  agree,
  refuse,
  back
}

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  staffName: "",
  deptName: "",
  mobile: "",
  leaveType: "",
  leaveTypeName: "",
  applyType: "",
  startTime: "",
  endTime: "",
  totalDays: 0,
  applyReason: "",
  tripDest: "",
  tripTickets: false,
  applyStatus: "",
  applyStatusExpr: "",
  currentReviewerId: "",
  canApprove: "",
  ccIds: [],
  isApproved: "",
  isReturnBack: "",
  comment: "",
  cancelReason: "",
  canEdit: "",
  canTemp: false,
  doTemp: false,
  comment1: "",
  attach: [] //附件
};
const fromRules = {
  leaveType: [{ required: true, message: "请选择请假类型", trigger: "change" }],
  applyReason: [
    { required: true, message: "请输入申请事由", trigger: "change" }
  ],
  startTime: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (
          dayjs(startTime.value + " " + startPeriod.value).unix() >
          dayjs(endTime.value + " " + endPeriod.value).unix()
        ) {
          callback("开始时间不能大于结束时间");
        } else {
          if (ruleFormRef.value && ruleFormRef.value) {
            ruleFormRef.value.clearValidate(["endTime"]);
          }
          callback();
        }
      },
      trigger: "change"
    }
  ],
  endTime: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (
          dayjs(startTime.value + " " + startPeriod.value).unix() >
          dayjs(endTime.value + " " + endPeriod.value).unix()
        ) {
          callback("结束时间不能小于开始时间");
        } else {
          if (ruleFormRef.value && ruleFormRef.value) {
            ruleFormRef.value.clearValidate(["startTime"]);
          }
          callback();
        }
      },
      trigger: "change"
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

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const stauts = ref("");
const endTime = ref("");
const canTemp1 = ref("");
const startTime = ref("");
const endPeriod = ref("");
const reviewers = ref([]); //审批人员
const formData = ref(null);
const showType = ref("add");
const startPeriod = ref("");
const requesting = ref(false);
const ccUserOptions = ref([]); //抄送人员
const allLeaveTypes = ref([]); //所有请假类型
const { staffName } = useNav(); //用户名
const formLoading = ref(false);
const formVisible = ref(false);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const auditFormRef = ref<FormInstance>();
const ruleFormRef = ref<FormInstance>();
const uploadRef1 = ref<UploadInstance>();
const canceFormRef = ref<FormInstance>();
const fileList1 = ref<UploadUserFile[]>([]);
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "申请"
    : showType.value == "edit"
      ? "编辑请假"
      : showType.value == "draft"
        ? "编辑请假"
        : showType.value == "read"
          ? "查看"
          : showType.value == "querydraft"
            ? "查看"
            : showType.value == "audit"
              ? "审批"
              : showType.value == "undo"
                ? "撤回"
                : showType.value == "undodraft"
                  ? "撤回"
                  : "";
});

watch(
  () => [
    formData.value?.leaveType,
    formData.value?.startTime,
    formData.value?.endTime
  ],
  () => {
    if (
      formData.value.startTime == "" ||
      formData.value.endTime == "" ||
      formData.value.leaveType == ""
    ) {
      return;
    }
    calcTotalDays();
  }
);

watch(
  () => [startTime.value, startPeriod.value, endTime.value, endPeriod.value],
  newVal => {
    console.log(newVal);
    fillFormDate();
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  await getCcStaffList();
  //加载所有请假类型;
  await getInvoiceCategoryList();
  activeName.value = "baseInfo";
  formVisible.value = true;
  INITIAL_DATA.ccIds = [];
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.attach = [];
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    showType.value = "add";
    stauts.value = "";
    formData.value.staffName = staffName;
    //默认时间段
    startTime.value = dayjs().format("YYYY-MM-DD");
    startPeriod.value = "00:00:00";
    endTime.value = dayjs().format("YYYY-MM-DD");
    endPeriod.value = "12:00:00";
  }
};
defineExpose({ show });

// 获取请假类型列表数据
function getInvoiceCategoryList() {
  GetLeaveTypesNV()
    .then(({ data }) => {
      allLeaveTypes.value = data || [];
    })
    .catch(() => {
      allLeaveTypes.value = [];
    });
}

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getLeave({ id });
  formData.value = data || {};
  if (formData.value.attach && formData.value.attach.length > 0) {
    fileList1.value = formData.value.attach.map(item => {
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
    fillParamDate();
    reviewers.value = data.reviewers || [];
    canTemp1.value = data.canTemp;
  }
  formLoading.value = false;
}

function getCcStaffList() {
  getCcStaffListNV()
    .then(({ data }) => {
      ccUserOptions.value = data;
      if (showType.value == "add") {
        formData.value.ccIds = [data[0].value];
      }
    })
    .catch(() => {
      ccUserOptions.value = [];
    });
}

function calcTotalDays() {
  CalcLeaveDays({
    leaveType: formData.value.leaveType,
    startTime: formData.value.startTime,
    endTime: formData.value.endTime
  }).then(({ data = {} }) => {
    formData.value.totalDays = data.days;
  });
}

function fillParamDate() {
  const s = formData.value.startTime.split(" ");
  const e = formData.value.endTime.split(" ");

  startTime.value = s[0];
  startPeriod.value = s[1];
  endTime.value = e[0];
  endPeriod.value = e[1];
}

function fillFormDate() {
  formData.value.startTime =
    startTime.value && startPeriod
      ? startTime.value + " " + startPeriod.value
      : "";
  formData.value.endTime =
    endTime.value && endPeriod.value
      ? endTime.value + " " + endPeriod.value
      : "";
  console.log("formData", formData);
}

function resetParamDate() {
  startTime.value = "";
  startPeriod.value = "";
  endTime.value = "";
  endPeriod.value = "";
}

//文件
// const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
//   if (rawFile.size / 1024 / 1024 > 5) {
//     ElMessage.error("所选文件不能超过5Mb");
//     return false;
//   }
//   return true;
// };

const handleError1 = () => {
  uploadRef1.value.clearFiles();
};

//上传文件
async function fileUpload1(options) {
  const path = "/tyOA/attendance";
  uploadImg({ file: options.file, path: path }).then(res => {
    options.file.temp = res["data"][0];
    formData.value[options.action] = fileList1.value.map((item: any) =>
      item.url ? item.url : item.raw.temp
    );
    ruleFormRef.value.validateField(options.action, () => null);
    console.log("fileList", fileList1.value);
    console.log(
      `${formData.value[options.action]}`,
      formData.value[options.action]
    );
  });
}

function handleRemove1(action: string) {
  formData.value[action] = fileList1.value.map((item: any) =>
    item.url ? item.url : item.raw.temp
  );
  ruleFormRef.value.validateField(action, () => null);
}

const handleSuccess1 = async _response => {};

const handleExceed1: UploadProps["onExceed"] = _files => {};

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, flag: boolean) => {
    if (!formEl) return;
    formEl.validate(async valid => {
      if (valid) {
        requesting.value = true;
        if (formData.value.id) {
          formData.value.doTemp = flag;
          const { message, data } = await updateLeave(formData.value);
          if (data) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        } else {
          formData.value.doTemp = flag;
          const { message, data } = await createLeave(formData.value);
          if (data) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        }
        requesting.value = false;
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
        requesting.value = true;
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
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
              emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
            }
          })
          .catch()
          .finally(() => {
            requesting.value = false;
          });
      }
    });
  },
  300
);

// 提交撤回表单
const submitFormQuery = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      requesting.value = true;
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
      requesting.value = false;
    }
  });
}, 300);

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  reviewers.value = [];
  resetParamDate();
  fileList1.value = [];
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
    :width="720"
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
      :model="formData"
      :rules="fromRules"
      label-width="85px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="姓名" prop="staffName">
            <el-input v-model="formData.staffName" readonly disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="请假类型" prop="leaveType">
            <el-select
              v-model="formData.leaveType"
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
              :style="{ width: '100%' }"
              ><el-option
                v-for="item in allLeaveTypes"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="startTime"
              :style="{ width: '62%' }"
              type="date"
              :clearable="false"
              :editable="false"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            />
            <el-select
              v-model="startPeriod"
              :style="{ width: '38%' }"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            >
              <el-option label="上午" value="00:00:00" />
              <el-option label="下午" value="12:00:00" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="endTime"
              :style="{ width: '62%' }"
              type="date"
              :clearable="false"
              :editable="false"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
            />
            <el-select
              v-model="endPeriod"
              :style="{ width: '38%' }"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            >
              <el-option label="上午" value="00:00:00" />
              <el-option label="下午" value="12:00:00" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="请假天数" prop="totalDays">
            <el-input v-model="formData.totalDays" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="抄送" prop="ccIds">
            <el-select
              v-model="formData.ccIds"
              :collapse-tags="true"
              :collapse-tags-tooltip="true"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
              :style="{ width: '100%' }"
              multiple
              filterable
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            >
              <el-option
                v-for="item in ccUserOptions"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="附件" prop="attach">
            <el-upload
              ref="uploadRef1"
              v-model:file-list="fileList1"
              :disabled="showType == 'read' || showType == 'audit'"
              accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg,.png"
              action="attach"
              :auto-upload="true"
              :show-file-list="showType == 'add' || showType == 'edit'"
              :http-request="fileUpload1"
              :on-exceed="handleExceed1"
              :on-error="handleError1"
              :on-remove="
                () => {
                  handleRemove1('attach');
                }
              "
              :on-success="handleSuccess1"
            >
              <el-button
                v-if="showType == 'add' || showType == 'edit'"
                type="primary"
                text
              >
                选择文件
              </el-button>
              <DownloadButton
                v-if="
                  fileList1.length > 0 &&
                  (showType == 'read' ||
                    showType == 'audit' ||
                    showType == 'undo')
                "
                :showFileName="true"
                :srcList="fileList1.map(item => item.url)"
              />
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="申请事由" prop="applyReason">
            <el-input
              v-model="formData.applyReason"
              :rows="2"
              type="textarea"
              placeholder="请注明申请理由，请假类型为其他/特殊管理需要注明具体请假类型，如：护理假、工伤、疫情隔离等!"
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item
            v-if="
              showType == 'undo' || stauts == '撤销' || showType == 'undodraft'
            "
            label="撤销理由"
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
          (canTemp1 && showType == 'edit') ||
          showType == 'draft'
        "
        type="success"
        @click="submitForm(ruleFormRef, true)"
        >暂存
      </el-button>
      <el-button
        v-if="showType == 'add' || showType == 'edit' || showType == 'draft'"
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
        @click="submitAuditForm(auditFormRef, AuditResult.agree)"
        >同意
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="danger"
        @click="submitAuditForm(auditFormRef, AuditResult.refuse)"
        >拒绝
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="success"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >
    </template>
  </el-dialog>
</template>
