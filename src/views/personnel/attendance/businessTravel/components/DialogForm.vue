<script setup lang="ts">
import _ from "lodash";
import dayjs from "dayjs";
import { ref, computed, watch } from "vue";
import { ElMessage, FormInstance } from "element-plus";

import { useNav } from "@/layout/hooks/useNav";
import {
  updateBusinessTravel,
  createBusinessTravel,
  getBusinessTravel,
  getBusiTripCcStaffListNV,
  Approvecc,
  Cancelcc
} from "@/api/personnel";
import { emitter } from "@/utils/mitt";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { getConfigListByKey } from "@/api/config";
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
  applyType: "项目出差",
  startTime: "",
  preEndTime: "",
  actualEndTime: "", //实际结束时间
  endTime: "",
  totalDays: 0,
  applyReason: "",
  tripDest: "",
  tripFrom: "",
  tripMethod: "",
  tripMethodExpr: "",
  tripTickets: false,
  applyStatus: "",
  cancelReason: "",
  canEdit: "",
  canTemp: false,
  doTemp: false,
  comment1: "",
  ccIds: []
};
const fromRules = {
  tripDest: [{ required: true, message: "请输入出差目的地", trigger: "blur" }],
  ccIds: [{ required: true, message: "请选择抄送人", trigger: "change" }],
  tripFrom: [{ required: true, message: "请输入出发地", trigger: "blur" }],
  // tripMethod: [{ required: true, message: "请选择交通工具", trigger: "blur" }],
  applyReason: [{ required: true, message: "请输入申请事由", trigger: "blur" }],
  // applyType: [{ required: true, message: "请选择出差类型", trigger: "change" }],
  startDate: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (
          dayjs(startDate.value + " " + startPeriod.value).unix() >
          dayjs(endDate.value + " " + endPeriod.value).unix()
        ) {
          callback("开始时间不能大于结束时间");
        } else {
          if (ruleFormRef.value && ruleFormRef.value) {
            ruleFormRef.value.clearValidate(["endDate"]);
          }
          callback();
        }
      },
      trigger: "change"
    }
  ],
  endDate: [
    {
      required: false,
      validator: (rule: any, value: any, callback: any) => {
        if (
          dayjs(startDate.value + " " + startPeriod.value).unix() >
          dayjs(endDate.value + " " + endPeriod.value).unix()
        ) {
          callback("结束时间不能小于开始时间");
        } else {
          if (ruleFormRef.value && ruleFormRef.value) {
            ruleFormRef.value.clearValidate(["startDate"]);
          }
          callback();
        }
      },
      trigger: "change"
    }
  ],
  actualEndDate: [
    {
      required: false,
      validator: (rule: any, value: any, callback: any) => {
        if (
          dayjs(startDate.value + " " + startPeriod.value).unix() >
          dayjs(actualEndDate.value + " " + actualendPeriod.value).unix()
        ) {
          callback("结束时间不能小于开始时间");
        } else {
          if (ruleFormRef.value && ruleFormRef.value) {
            ruleFormRef.value.clearValidate(["startDate"]);
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
const endDate = ref("");
const canTemp1 = ref("");
const startDate = ref("");
const endPeriod = ref("");
const actualEndDate = ref(""); //实际结束时间前段
const actualendPeriod = ref(""); //实际结束时间上下午
const reviewers = ref([]);
const formData = ref(null);
const showType = ref("add");
const startPeriod = ref("");
const BusiTripData = ref([]); //出差交通方式
const ccUserOptions = ref([]); //抄送人员
const formVisible = ref(false);
const formLoading = ref(false);
const TripApplyType = ref([]); //出差类型
const { staffName } = useNav(); //用户名
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const auditFormRef = ref<FormInstance>();
const ruleFormRef = ref<FormInstance>();
const canceFormRef = ref<FormInstance>();
const requestLoading = ref(false);
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "申请出差"
    : showType.value == "edit"
      ? "编辑出差"
      : showType.value == "editEndTime"
        ? "编辑结束时间"
        : showType.value == "draft"
          ? "编辑出差"
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
  () => startDate.value,
  val => {
    console.log(val);
    calcTotalDays();
  }
);

watch(
  () => startPeriod.value,
  val => {
    console.log(val);
    calcTotalDays();
  }
);

watch(
  () => endDate.value,
  val => {
    if (!val) {
      endPeriod.value = "";
    } else {
      if (endPeriod.value == "" || endPeriod.value == null) {
        endPeriod.value = "00:00:00";
      }
    }
    calcTotalDays();
  }
);

watch(
  () => endPeriod.value,
  val => {
    console.log(val);
    calcTotalDays();
  }
);

watch(
  () => actualEndDate.value,
  val => {
    if (!val) {
      actualendPeriod.value = "";
      formData.value.actualEndTime = "";
    } else {
      if (actualendPeriod.value == "" || actualendPeriod.value == null) {
        actualendPeriod.value = "00:00:00";
      }
      formData.value.actualEndTime =
        actualEndDate.value + actualendPeriod.value;
    }
    calcTotalDays();
  }
);

watch(
  () => actualendPeriod.value,
  val => {
    console.log(val);
    calcTotalDays();
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  BusiTripType();
  GetBusiTrip();
  getCcStaffList();
  activeName.value = "baseInfo";
  INITIAL_DATA.ccIds = [];
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    showType.value = "add";
    stauts.value = "";
    formData.value.staffName = staffName;

    //默认时间段
    startDate.value = dayjs().format("YYYY-MM-DD");
    startPeriod.value = "00:00:00";
  }
  formVisible.value = true;
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getBusinessTravel({ id });
  formData.value = data || {};
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

//获取出差类型
async function BusiTripType() {
  const { data } = await getConfigListByKey({
    catalogKey: "OABusiTripType"
  });
  TripApplyType.value = data || {};
}

// 出差交通方式
const GetBusiTrip = async () => {
  const { data } = await getConfigListByKey({
    catalogKey: "OABusiMethodType"
  });
  BusiTripData.value = data || [];
};

function getCcStaffList() {
  getBusiTripCcStaffListNV()
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
  if (
    // showType.value == "audit" ||
    showType.value == "read" ||
    showType.value == "undo"
  ) {
    return;
  }

  let endDate1 = "";
  let endPeriod1 = "";
  if (
    formData.value.actualEndTime != null &&
    formData.value.actualEndTime != "" &&
    formData.value.actualEndTime != "1900-01-01 00:00:00"
  ) {
    endDate1 = actualEndDate.value;
    endPeriod1 = actualendPeriod.value;
  } else {
    endDate1 = endDate.value;
    endPeriod1 = endPeriod.value;
  }

  if (!startDate.value || !startPeriod.value || !endDate1 || !endPeriod1) {
    formData.value.totalDays = 0;
    return;
  }
  let totalDays = 0;

  const totalSeconds =
    dayjs(endDate1 + " " + endPeriod1).unix() -
    dayjs(startDate.value + " " + startPeriod.value).unix();
  let totalHours = totalSeconds / 3600;
  if (totalHours < 0) {
    totalDays = 0;
  } else {
    if (startDate.value == endDate1) {
      //一天之内
      if (totalHours == 0) {
        totalDays = 0.5;
      } else if (totalHours == 12) {
        totalDays = 1;
      } else {
        totalDays = 0;
      }
    } else {
      //多天
      totalHours += 12; //补上12小时，方便计算
      const realDays = totalHours / 24;
      totalDays = Math.floor(realDays);
      if (realDays > totalDays) {
        totalDays += 0.5;
      }
    }
  }

  formData.value.totalDays = totalDays;
}

function fillParamDate() {
  const s = formData.value.startTime.split(" ");

  startDate.value = s[0];
  startPeriod.value = s[1];
  if (
    formData.value.preEndTime != null &&
    formData.value.preEndTime != "" &&
    formData.value.preEndTime != "1900-01-01 00:00:00"
  ) {
    const e = formData.value.preEndTime.split(" ");
    endDate.value = e[0];
    endPeriod.value = e[1];
  }
  if (
    formData.value.actualEndTime != null &&
    formData.value.actualEndTime != "" &&
    formData.value.actualEndTime != "1900-01-01 00:00:00"
  ) {
    const e = formData.value.actualEndTime.split(" ");
    actualEndDate.value = e[0];
    actualendPeriod.value = e[1];
  }
}

function fillFormDate() {
  formData.value.startTime = startDate.value + " " + startPeriod.value;
  // formData.value.endTime = endDate.value + " " + endPeriod.value;
  if (
    endDate.value != null &&
    endDate.value != "" &&
    endPeriod.value != null &&
    endPeriod.value != ""
  ) {
    formData.value.preEndTime = endDate.value + " " + endPeriod.value;
  } else {
    formData.value.preEndTime = "";
  }

  if (
    actualEndDate.value != null &&
    actualEndDate.value != "" &&
    actualendPeriod.value != null &&
    actualendPeriod.value != ""
  ) {
    formData.value.actualEndTime =
      actualEndDate.value + " " + actualendPeriod.value;
  } else {
    formData.value.actualEndTime = "";
  }
}

function resetParamDate() {
  startDate.value = "";
  startPeriod.value = "";
  endDate.value = "";
  endPeriod.value = "";
  actualEndDate.value = "";
  actualendPeriod.value = "";
}

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, flag: boolean) => {
    if (!formEl) return;
    formEl.validate(async valid => {
      if (valid) {
        requestLoading.value = true;
        fillFormDate();
        if (formData.value.id) {
          formData.value.doTemp = flag;
          const { message, data } = await updateBusinessTravel(formData.value);
          if (data) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        } else {
          formData.value.doTemp = flag;
          const { message, data } = await createBusinessTravel(formData.value);
          if (data) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        }
        requestLoading.value = false;
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
        fillFormDate();
        Approvecc({
          id: formData.value.id,
          isApproved:
            _auditResult == AuditResult.agree
              ? true
              : _auditResult == AuditResult.refuse
                ? false
                : false,
          isReturnBack: _auditResult == AuditResult.back ? true : false,
          comment1: auditData.value.comment1,
          actualEndTime: formData.value.actualEndTime,
          totalDays: formData.value.totalDays
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
const submitFormQuery = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await Cancelcc({
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
}, 300);

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  reviewers.value = [];
  formEl.resetFields();
  resetParamDate();
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
      label-width="100px"
    >
      <div>
        <el-row :gutter="20">
          <el-col :span="24" :offset="0">
            <el-form-item label="姓名" prop="staffName">
              <el-input v-model="formData.staffName" readonly disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="开始时间" prop="startDate">
              <el-date-picker
                v-model="startDate"
                :style="{ width: '62%' }"
                type="date"
                :clearable="false"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :placeholder="
                  showType == 'editEndTime' ||
                  showType == 'audit' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'querydraft' ||
                  showType == 'undodraft'
                    ? ''
                    : '请选择'
                "
                :disabled="
                  showType == 'editEndTime' ||
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
                  showType == 'editEndTime' ||
                  showType == 'audit' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'querydraft' ||
                  showType == 'undodraft'
                    ? ''
                    : '请选择'
                "
                :disabled="
                  showType == 'editEndTime' ||
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
            <el-form-item label="预计结束时间" prop="endDate">
              <el-date-picker
                v-model="endDate"
                :style="{ width: '62%' }"
                type="date"
                :clearable="true"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :placeholder="
                  showType == 'editEndTime' ||
                  showType == 'audit' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'querydraft' ||
                  showType == 'undodraft'
                    ? ''
                    : '请选择'
                "
                :disabled="
                  showType == 'editEndTime' ||
                  showType == 'audit' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'querydraft' ||
                  showType == 'undodraft'
                "
              />
              <el-select
                v-model="endPeriod"
                :style="{ width: '38%' }"
                :placeholder="
                  showType == 'editEndTime' ||
                  showType == 'audit' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'querydraft' ||
                  showType == 'undodraft'
                    ? ''
                    : '请选择'
                "
                :disabled="
                  showType == 'editEndTime' ||
                  showType == 'audit' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'querydraft' ||
                  showType == 'undodraft'
                "
              >
                <el-option
                  v-show="endDate != null && endDate != ''"
                  label="上午"
                  value="00:00:00"
                />
                <el-option
                  v-show="endDate != null && endDate != ''"
                  label="下午"
                  value="12:00:00"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="
              showType == 'editEndTime' ||
              formData.actualEndTime ||
              formData.canEditActualEndTime
            "
            :span="12"
            :offset="0"
          >
            <el-form-item label="实际结束时间" prop="actualEndDate">
              <el-date-picker
                v-model="actualEndDate"
                :style="{ width: '62%' }"
                type="date"
                :clearable="true"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                :disabled="!formData.canEditActualEndTime || showType == 'read'"
              />
              <el-select
                v-model="actualendPeriod"
                :style="{ width: '38%' }"
                placeholder="请选择"
                :disabled="!formData.canEditActualEndTime || showType == 'read'"
              >
                <el-option
                  v-show="actualEndDate != null && actualEndDate != ''"
                  label="上午"
                  value="00:00:00"
                />
                <el-option
                  v-show="actualEndDate != null && actualEndDate != ''"
                  label="下午"
                  value="12:00:00"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="总计天数" prop="totalDays">
              <el-input v-model="formData.totalDays" type="number" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="出差类型" prop="applyType">
              <el-select
                v-model="formData.applyType"
                :style="{ width: '100%' }"
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
                  showType == 'editEndTime' ||
                  showType == 'audit' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'querydraft' ||
                  showType == 'undodraft'
                "
              >
                <el-option
                  v-for="item in TripApplyType"
                  :key="item.configKey"
                  :label="item.configName"
                  :value="item.configValue"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="出发地" prop="tripFrom">
              <el-input
                v-model="formData.tripFrom"
                :readonly="
                  showType == 'editEndTime' ||
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
                    : '请输入'
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="目的地" prop="tripDest">
              <el-input
                v-model="formData.tripDest"
                :readonly="
                  showType == 'editEndTime' ||
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
                    : '多个地点请逗号分隔'
                "
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="交通工具" prop="tripMethod">
              <el-select
                v-model="formData.tripMethod"
                :collapse-tags="true"
                :collapse-tags-tooltip="true"
                multiple
                :style="{ width: '100%' }"
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
                  showType == 'editEndTime' ||
                  showType == 'audit' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'querydraft' ||
                  showType == 'undodraft'
                "
              >
                <el-option
                  v-for="item in BusiTripData"
                  :key="item.configKey"
                  :label="item.configName"
                  :value="item.configValue"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="代购往返票" prop="tripTickets">
              <el-radio-group
                :disabled="
                  showType == 'audit' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'querydraft' ||
                  showType == 'undodraft'
                "
                v-model="formData.tripTickets"
                :style="{ width: '100%' }"
              >
                <el-radio :label="true">需要</el-radio>
                <el-radio :label="false">不需要</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col> -->
          <el-col :span="24" :offset="0">
            <el-form-item label="抄送" prop="ccIds">
              <el-select
                v-model="formData.ccIds"
                :collapse-tags="true"
                :collapse-tags-tooltip="true"
                :style="{ width: '100%' }"
                :placeholder="
                  showType == 'audit' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'querydraft' ||
                  showType == 'undodraft'
                    ? ''
                    : '请选择'
                "
                multiple
                filterable
                :reserve-keyword="true"
                :disabled="
                  showType == 'editEndTime' ||
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
            <el-form-item label="申请事由" prop="applyReason">
              <el-input
                v-model="formData.applyReason"
                :rows="2"
                type="textarea"
                :placeholder="
                  showType == 'audit' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'querydraft' ||
                  showType == 'undodraft'
                    ? ''
                    : '请输入'
                "
                :disabled="
                  showType == 'editEndTime' ||
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
                showType == 'undo' ||
                stauts == '撤销' ||
                showType == 'undodraft'
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
      </div>
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
      :label-width="activeName == 'auditInfo' ? '100px' : '100px'"
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
        v-if="showType == 'undo' || showType == 'undodraft'"
        type="primary"
        @click="submitFormQuery(canceFormRef)"
        >提交</el-button
      >
      <el-button
        v-if="
          showType == 'add' ||
          (canTemp1 && showType == 'edit') ||
          showType == 'draft'
        "
        :loading="requestLoading"
        type="success"
        @click="submitForm(ruleFormRef, true)"
        >暂存
      </el-button>
      <el-button
        v-if="showType == 'add' || showType == 'edit' || showType == 'draft'"
        :loading="requestLoading"
        type="primary"
        @click="submitForm(ruleFormRef, false)"
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
        v-if="showType == 'audit'"
        type="success"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >
      <el-button
        v-if="showType == 'editEndTime'"
        :loading="formLoading"
        type="primary"
        @click="submitAuditForm(ruleFormRef, AuditResult.agree)"
        >提交
      </el-button>
    </template>
  </el-dialog>
</template>
