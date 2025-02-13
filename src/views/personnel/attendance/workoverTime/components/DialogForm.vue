<script setup lang="ts">
import _ from "lodash";
import dayjs from "dayjs";
import { ref, computed } from "vue";
import { ElMessage, FormInstance } from "element-plus";

import {
  updateExtraWork,
  addExtraWork,
  getExtraWorkDetail,
  approveExtraWork,
  cancelExtraWork,
  getCcStaffListNV,
  calcTimeExtraWork
} from "@/api/workoverTime";
import { emitter } from "@/utils/mitt";
import { useNav } from "@/layout/hooks/useNav";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
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
  applyType: "",
  startTime: "",
  endTime: "",
  totalHours: 0,
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
  applyReason: [
    { required: true, message: "请输入申请事由", trigger: "change" }
  ],
  ccIds: [{ required: true, message: "请选择抄送", trigger: "change" }],
  startTime: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (
          dayjs(formData.value.startTime).unix() >
          dayjs(formData.value.endTime).unix()
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
          dayjs(formData.value.startTime).unix() >
          dayjs(formData.value.endTime).unix()
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
const canTemp1 = ref("");
const reviewers = ref([]); //审批人员
const formData = ref(null);
const showType = ref("add");
const ccUserOptions = ref([]); //审批人员
const requesting = ref(false);
const { staffName } = useNav(); //用户名
const formLoading = ref(false);
const formVisible = ref(false);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const canceFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const ruleFormRef = ref<FormInstance>();
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
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

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  getCcStaffList();
  formVisible.value = true;
  INITIAL_DATA.ccIds = [];
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.attach = [];
  activeName.value = "baseInfo";
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    showType.value = "add";
    stauts.value = "";
    formData.value.staffName = staffName;
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getExtraWorkDetail({ id });
  formData.value = data || {};
  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });
  if (data) {
    reviewers.value = data.reviewers || [];
    canTemp1.value = data.canTemp;
  }
  formLoading.value = false;
}

function calcTotalDays() {
  if (
    showType.value == "audit" ||
    showType.value == "read" ||
    showType.value == "undo"
  ) {
    return;
  }
  if (!formData.value.startTime || !formData.value.endTime) {
    return;
  }
  // let totalHours = 0;
  // const dateBegin = new Date(formData.value.startTime);
  // const dateEnd = new Date(formData.value.endTime);
  // const dateDiff = dateEnd.getTime() - dateBegin.getTime(); //时间差的毫秒数
  // const hours = dateDiff / (3600 * 1000);
  // if (hours > 0.5 && hours <= 1) {
  //   totalHours = 1;
  // } else if (hours > 1) {
  //   totalHours = parseInt(hours);
  // } else {
  //   totalHours = 0;
  // }
  // formData.value.totalHours = totalHours;
  calcTimeExtraWork({
    startTime: formData.value.startTime,
    endTime: formData.value.endTime
  }).then(({ data = {} }) => {
    formData.value.totalHours = data.totalHours;
  });
}

function getCcStaffList() {
  getCcStaffListNV()
    .then(({ data }) => {
      ccUserOptions.value = data;
      if (showType.value == "add") {
        formData.value.ccIds = [data[0].value];
        console.log("formData.value.ccIds", formData.value.ccIds);
      }
    })
    .catch(() => {
      ccUserOptions.value = [];
    });
}

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, flag: boolean) => {
    if (!formEl) return;
    formEl.validate(async valid => {
      if (valid) {
        requesting.value = true;
        if (formData.value.id) {
          formData.value.doTemp = flag;
          const { code, message } = await updateExtraWork(formData.value);
          if (code == 0) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        } else {
          formData.value.doTemp = flag;
          console.log(formData.value, "formData.value");
          const { code, message } = await addExtraWork(formData.value);
          if (code == 0) {
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
        approveExtraWork({
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
      const { code, message } = await cancelExtraWork({
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
  activeName.value = "baseInfo";
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
    :width="680"
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
      label-width="80px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="姓名" prop="staffName">
            <el-input v-model="formData.staffName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              :style="{ width: '100%' }"
              type="datetime"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
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
              @change="calcTotalDays"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              :style="{ width: '100%' }"
              type="datetime"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
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
              @change="calcTotalDays"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="加班时长" prop="totalHours">
            <el-input v-model="formData.totalHours" readonly />
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
          <el-form-item label="加班原因" prop="applyReason">
            <el-input
              v-model="formData.applyReason"
              :rows="2"
              type="textarea"
              placeholder="请注明申请加班原因"
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
      :label-width="activeName == 'auditInfo' ? '92px' : '80px'"
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
        v-if="
          showType == 'add' ||
          (canTemp1 && showType == 'edit') ||
          showType == 'draft'
        "
        :loading="requesting"
        type="success"
        @click="submitForm(ruleFormRef, true)"
        >暂存
      </el-button>
      <el-button
        v-if="showType == 'add' || showType == 'edit' || showType == 'draft'"
        :loading="requesting"
        type="primary"
        @click="submitForm(ruleFormRef, false)"
        >提交
      </el-button>
      <el-button
        v-if="showType == 'undo' || showType == 'undodraft'"
        :loading="requesting"
        type="primary"
        @click="submitFormQuery(canceFormRef)"
        >提交</el-button
      >
      <el-button
        v-if="showType == 'audit'"
        type="primary"
        :loading="requesting"
        @click="submitAuditForm(auditFormRef, AuditResult.agree)"
        >同意
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="danger"
        :loading="requesting"
        @click="submitAuditForm(auditFormRef, AuditResult.refuse)"
        >拒绝
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="success"
        :loading="requesting"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >
    </template>
  </el-dialog>
</template>
