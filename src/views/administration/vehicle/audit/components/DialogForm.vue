<script setup lang="ts">
import moment from "moment";
import { storeToRefs } from "pinia";
import { ref, computed, watch } from "vue";
import { ElMessage, FormInstance } from "element-plus";

import {
  CarApplyCreate,
  CarApplyUpdate,
  Approve,
  GetCarApply,
  Get,
  GetAvailableListNV,
  GetAvailableDriverListNV //司机列表
} from "@/api/vehicle";
import { columns } from "../constant";
import { emitter } from "@/utils/mitt";
import { useNav } from "@/layout/hooks/useNav";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import ReadDescriptions from "@/components/ReadDescriptions";
import { userStaffStoreHook } from "@/store/modules/staff";
import { userCommonStoreHook } from "@/store/modules/common";
import { userProjectStoreHook } from "@/store/modules/project";

const { getStaffListNV } = userStaffStoreHook();
const { getCityNVList } = userCommonStoreHook();
const { getProjectWinBidNVList } = userProjectStoreHook();
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
  applyReason: "",
  cancelReason: "",
  applyTime: "",
  applyStatus: 1,
  applyStatusExpr: "",
  canTemp: true,
  canApprove: true,
  canReject: true,
  canCancel: true,
  canReturnBack: true,
  doTemp: true,
  carInformationId: "",
  carName: "",
  carLicensePlate: "",
  fromAddress: "北京市",
  destAddress: "北京市",
  planPickTime: "",
  planReturnTime: "",
  isNeedDriver: "",
  comment1: "",
  driverId: "",
  driverName: "",
  projectId: "",
  projectName: "",
  ccIds: [] //抄送人
  // isNeedDriver: [] //附件
};
const rules = {
  carInformationId: [
    { required: true, message: "请选择车辆", trigger: "change" }
  ],

  applyReason: [
    { required: true, message: "请输入申请事由", trigger: "change" }
  ],
  fromAddress: [{ required: true, message: "请选择出发地", trigger: "change" }],

  destAddress: [{ required: true, message: "请选择目的地", trigger: "change" }],
  staffName: [
    { required: true, message: "请输入申请人姓名", trigger: "change" }
  ],
  planReturnTime: [
    { required: true, message: "请选择预计归还时间", trigger: "blur" }
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
const DriverData = ref([]); //司机列表
const allCarTypes = ref([]); //所有车辆
const showType = ref("apply");
const formLoading = ref(false);
const tableColumnData = ref([]);
const { staffName } = useNav(); //用户名
const formVisible = ref(false);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const auditFormRef = ref<FormInstance>();
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const { staffListNV } = storeToRefs(userStaffStoreHook());
const { cityNVList } = storeToRefs(userCommonStoreHook());
const { winBidProjectNVList } = storeToRefs(userProjectStoreHook());

watch(
  () => formData.value.planPickTime,
  newVal => {
    if (newVal) {
      getcarTypes(newVal, formData.value.planReturnTime);
    }
  }
);
watch(
  () => formData.value.planReturnTime,
  newVal => {
    if (newVal) {
      getcarTypes(formData.value.planPickTime, newVal);
    }
  }
);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "apply"
    ? "申请用车"
    : showType.value == "edit"
      ? "编辑用车申请"
      : showType.value == "draft"
        ? "编辑用车申请"
        : showType.value == "read"
          ? "查看用车申请"
          : showType.value == "querydraft"
            ? "查看用车申请"
            : showType.value == "audit"
              ? "审批用车申请"
              : showType.value == "undo"
                ? "撤回用车申请"
                : showType.value == "undodraft"
                  ? "撤回用车申请"
                  : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  getStaffListNV();
  getProjectWinBidNVList();
  if (cityNVList.value.length < 1) {
    getCityNVList();
  }
  //加载车辆;
  getStaffListByDeptId();
  activeName.value = "baseInfo";
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  // INITIAL_DATA.attach = [];
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    showType.value = "apply";
    formData.value.staffName = staffName;
    formData.value.planReturnTime = moment().format("YYYY/MM/DD HH:mm");
    formData.value.planPickTime = moment().format("YYYY/MM/DD HH:mm");
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetCarApply({ id });
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

//选择中标项目之后关联数据
function handleProjectChange(val) {
  const project = winBidProjectNVList.value.find(item => item.value == val);
  formData.value.projectName = project.name;
}

// 司机列表
const getStaffListByDeptId = async () => {
  const { data = {} } = await GetAvailableDriverListNV();
  DriverData.value = data || {};
};

// 根据车辆id获取车辆详情数据;
async function Detail(val) {
  formLoading.value = true;
  const { data } = await Get({ id: val });
  formData.value.carLicensePlate = data.carLicensePlate;
  formData.value.carName = data.carName;
}

//获取车辆信息（获取id）
async function getcarTypes(v1, v2) {
  const { data } = await GetAvailableListNV({
    planPickTime: v1,
    planReturnTime: v2
  });
  allCarTypes.value = data;
}
// 提交表单
const submitForm = async (formEl: FormInstance | undefined, flag: boolean) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        formData.value.doTemp = flag;
        const { message, data } = await CarApplyUpdate(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        formData.value.doTemp = flag;
        const { message, data } = await CarApplyCreate(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
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
          formLoading.value = false;
        });
    }
  });
};

// 提交撤回表单
// const submitFormQuery = async (formEl: FormInstance | undefined) => {
//   if (!formEl) return;
//   formEl.validate(async valid => {
//     if (valid) {
//        const { code, message } = await Cancel({
//         id: formData.value.id,
//         cancelReason: formData.value.cancelReason
//       });
//        if (code == 0) {
//         ElMessage.success(message);
//         formVisible.value = false;
//         resetForm(formEl);
//         emit("search");
//       }
//     }
//   });
// };

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
    :width="740"
    :class="showType == 'apply' || showType == 'edit' ? '' : 'auditDialog'"
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
        <el-col :span="12" :offset="0">
          <el-form-item label="用车时间" prop="planPickTime">
            <el-date-picker
              v-model="formData.planPickTime"
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              type="datetime"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="预计还车时间" prop="planReturnTime">
            <el-date-picker
              v-model="formData.planReturnTime"
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
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
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col v-if="showType == 'apply'" :span="12" :offset="0">
          <el-form-item label="车辆牌照" prop="carInformationId">
            <el-select
              v-model="formData.carInformationId"
              filterable
              placeholder="请选择"
              :style="{ width: '100%' }"
              @change="Detail"
              ><el-option
                v-for="item in allCarTypes"
                :key="item.value"
                :label="item.remark"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col
          v-if="
            showType == 'audit' ||
            showType == 'read' ||
            showType == 'undo' ||
            showType == 'querydraft' ||
            showType == 'undodraft' ||
            showType == 'edit'
          "
          :span="12"
          :offset="0"
        >
          <el-form-item label="车辆牌照" prop="carLicensePlate">
            <el-input
              v-model="formData.carLicensePlate"
              :readonly="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft' ||
                showType == 'edit'
              "
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft' ||
                showType == 'edit'
                  ? ''
                  : '请输入'
              "
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="出发地" prop="fromAddress">
            <el-select
              v-model="formData.fromAddress"
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
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            >
              <el-option
                v-for="item in cityNVList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="目的地" prop="destAddress">
            <el-select
              v-model="formData.destAddress"
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
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            >
              <el-option
                v-for="item in cityNVList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="申请人姓名" prop="staffName">
            <el-input
              v-model="formData.staffName"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            />
          </el-form-item>
        </el-col>

        <el-col
          v-if="showType == 'apply' || showType == 'edit'"
          :span="12"
          :offset="0"
        >
          <el-form-item label="司机" prop="driverId">
            <el-select
              v-model="formData.driverId"
              clearable
              filterable
              :style="{ width: '100%' }"
            >
              <el-option label="无" :value="null" />
              <el-option
                v-for="item in DriverData"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col
          v-if="showType == 'audit' || showType == 'read'"
          :span="12"
          :offset="0"
        >
          <el-form-item label="司机" prop="driverName">
            <el-input
              v-model="formData.driverName"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            />
          </el-form-item>
        </el-col>
        <el-col
          v-if="
            showType == 'apply' ||
            formData.projectId != '00000000-0000-0000-0000-000000000000'
          "
          :span="12"
          :offset="0"
        >
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
              @change="handleProjectChange"
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
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="用车事由" prop="applyReason">
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
              :readonly="
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
              (stauts == '已撤销' && showType == 'read') ||
              showType == 'undodraft'
            "
            label="撤回理由"
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
        activeName == 'auditInfo' &&
        (showType == 'read' || showType == 'undo' || showType == 'audit')
      "
      v-show="activeName == 'auditInfo'"
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
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="
          showType == 'apply' ||
          (canTemp1 && showType == 'edit') ||
          showType == 'draft'
        "
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
    </template>
  </el-dialog>
</template>
