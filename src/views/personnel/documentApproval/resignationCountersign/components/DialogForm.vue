<script setup lang="ts">
import { ElMessage, FormInstance } from "element-plus";
import _ from "lodash";
import { ref, computed } from "vue";

import {
  GetStaffOffJoinSign,
  UpdateStaffOffJoinSign,
  CreateStaffOffJoinSign,
  CancelStaffOffJoinSign,
  ApproveStaffOffJoinSign,
  GetOffReasonListNV,
  GetAyStaffDept
} from "@/api/staffOffJoinSign";
import { emitter } from "@/utils/mitt";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";

// import { userStaffStoreHook } from "@/store/modules/staff";
import { GetSimpleStaff } from "@/api/staff";
import { getStaffListNV } from "@/api/staff";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

enum AuditResult {
  agree,
  refuse,
  back
}

const fromRules = {
  ayStaffId: [{ required: true, message: "请选择姓名", trigger: "change" }],

  ayDeptManager: [
    { required: true, message: "请输入部门经理", trigger: "blur" }
  ],
  ayLevel: [{ required: true, message: "请输入职级", trigger: "blur" }],
  endDate: [{ required: true, message: "请选择离职日期", trigger: "change" }],
  offReason: [{ required: true, message: "请选择离职原因", trigger: "change" }]
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

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  applyReason: "",
  cancelReason: "", //取消原因
  applyTime: "",
  applyStatus: "",
  applyStatusExpr: "",
  ayCompanyName: "",
  ayCompanyId: "",
  ayDeptId: "",
  ayDeptName: "",
  ayStaffId: "",
  ayStaffName: "",
  ayPost: "",
  ayLevel: "",
  ayDeptManager: "",
  ayDeptManagerId: undefined,
  startDate: "",
  endDate: "",
  other: "",
  offReason: "",
  offDetail: "",
  deptOption1: false, //所在部门：交还公司所有相关业务资料 ， 包括技术软件 、合同和说明
  deptOption2: false, //所在部门：交还所有手册 、文件、工具书 、报表和报告等
  deptOption3: false, //所在部门：原所从事工作己由 （ ）接替
  deptOption3Name: "", //接收人
  deptOption4: false, //所在部门：其他
  netOption1: false, //网络管理：交还计算机及相关配置 ：笔记本号 系统密码：
  netOption1Computer: "", //网络管理：笔记本号
  netOption1Pwd: "", //网络管理：系统密码
  netOption2: false, //网络管理：关闭公司邮箱
  netOption3: false, //网络管理：清退公司qq 群，微信群
  netOption4: false, //网络管理：删除门禁卡 、指纹记录
  resOption1: false, //人力行政1：交还办公设备 （桌子、柜子/钥匙等 ）
  resOption2: false, //人力行政1：交还计算器 、优盘等文具
  resOption3: false, //人力行政1：交还门卡卡号
  resOption4: false, //人力行政1：其他
  humOption1: false,
  humOption1Month: "", //人力行政2：社保截止月份
  humOption2: false,
  humOption2Month: "", //人力行政2：公积金截止月份
  humOption3: false,
  humOption3Date: "", //人力行政2：工资截止日期
  humOption4: "", //人力行政2：离职证明
  humOption5: false,
  humOption5wkDays: 0, //人力行政2：出勤天数
  humOption5skDays: 0, //人力行政2：病假天数
  humOption5thDays: 0, //人力行政2：事假天数
  humOption5unCount: 0, //人力行政2：迟到早退次数
  humOption5Percent: 0, //人力行政2：出勤率（百分制）
  finOption1: false, //财务部：是否结清借款 、报销款
  finOption2: false, //财务部：离职月工资是否能结清个人应交社保 、公积金款项

  canTemp: false, //是否可以暂存
  canApprove: false, //是否可以审核
  canReject: false, //是否可以驳回（驳回之后流程结束）
  canCancel: false, //是否可以取消（针对发起人）
  canReturnBack: false, //是否可以退回（由审批人退回）（退回后仍然可以继续提交申请
  doTemp: false, //是否可以暂存
  showDept: false, //是否展示所在部门字段
  showNet: false, //是否展示网络管理字段
  showRes: false, //是否展示人力行政1字段
  showHum: false, //是否展示人力行政2字段
  showFin: false //是否展示财务部字段
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法

const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const stauts = ref("");
const showType = ref("add");
const reviewers = ref([]); //审批人员
const formData = ref({ ...INITIAL_DATA });
const formLoading = ref(false);
const formVisible = ref(false);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const canceFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const officeList = ref([]); //职位
// const { staffListNV } = storeToRefs(userStaffStoreHook());
const staffListNV = ref([]);
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "申请"
    : showType.value == "edit"
      ? "编辑"
      : showType.value == "read"
        ? "查看"
        : showType.value == "audit"
          ? "审批"
          : showType.value == "undo"
            ? "撤回"
            : "";
});

//获取会签合同键值对
async function getOfficeList() {
  const { data } = await GetOffReasonListNV({ isSearch: 0 });
  officeList.value = data || [];
}

//人员列表
async function StaffListNV() {
  const { data } = await getStaffListNV({ staffName: "", jobStatus: 1 });
  staffListNV.value = data || [];
}

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  getOfficeList();
  StaffListNV();

  activeName.value = "baseInfo";
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };

  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    showType.value = "add";
  }
};
defineExpose({ show });

// 根据id获取人员详情数据;
async function SimpleStaff(val) {
  formLoading.value = true;
  const { data } = await GetSimpleStaff({ staffId: val });

  formData.value.ayDeptName = data.deptName;
  formData.value.ayStaffName = data.staffName;
  formData.value.ayCompanyName = data.companyName;
  formData.value.ayPost = data.jobTitleName;
  formData.value.startDate = data.startDate;
  deptNV(data.staffId);
}
// 根据id获取人员详情数据;
async function deptNV(val) {
  const { data } = await GetAyStaffDept({
    ayStaffId: val
  });

  formData.value.ayDeptManager = data.manager;
  formData.value.ayDeptManagerId = data.managerStaffId;
}

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetStaffOffJoinSign({ id });
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

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, flag: boolean) => {
    if (!formEl) return;
    formEl.validate(async valid => {
      if (valid) {
        if (showType.value == "edit") {
          formData.value.doTemp = flag;
          UpdateStaffOffJoinSign(formData.value).then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          });
        } else if (showType.value == "add") {
          formData.value.doTemp = flag;
          CreateStaffOffJoinSign(formData.value).then(({ code, message }) => {
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
    formEl.validate(async valid => {
      if (valid) {
        ApproveStaffOffJoinSign({
          id: formData.value.id,
          isApproved:
            _auditResult == AuditResult.agree
              ? true
              : _auditResult == AuditResult.refuse
                ? false
                : false,
          isReturnBack: _auditResult == AuditResult.back ? true : false,
          comment1: auditData.value.comment1,
          showDept: formData.value.showDept,
          deptOption1: formData.value.deptOption1,
          deptOption2: formData.value.deptOption2,
          deptOption3: formData.value.deptOption3,
          deptOption3Name: formData.value.deptOption3Name,
          deptOption4: formData.value.deptOption4,
          showNet: formData.value.showNet,
          netOption1: formData.value.netOption1,
          netOption1Computer: formData.value.netOption1Computer,
          netOption1Pwd: formData.value.netOption1Pwd,
          netOption2: formData.value.netOption2,
          netOption3: formData.value.netOption3,
          netOption4: formData.value.netOption4,
          showRes: formData.value.showRes,
          resOption1: formData.value.resOption1,
          resOption2: formData.value.resOption2,
          resOption3: formData.value.resOption3,
          resOption4: formData.value.resOption4,
          showHum: formData.value.showHum,
          humOption1: formData.value.humOption1,
          humOption1Month: formData.value.humOption1Month,
          humOption2: formData.value.humOption2,
          humOption2Month: formData.value.humOption2Month,
          humOption3: formData.value.humOption3,
          humOption3Date: formData.value.humOption3Date,
          humOption4: formData.value.humOption4,
          humOption5: formData.value.humOption5,
          humOption5wkDays: formData.value.humOption5wkDays,
          humOption5skDays: formData.value.humOption5skDays,
          humOption5thDays: formData.value.humOption5thDays,
          humOption5unCount: formData.value.humOption5unCount,
          humOption5Percent: formData.value.humOption5Percent,
          showFin: formData.value.showFin,
          finOption1: formData.value.finOption1,
          finOption2: formData.value.finOption2
        }).then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
            emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
          }
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
      const { code, message } = await CancelStaffOffJoinSign({
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
    :width="890"
    :class="showType == 'add' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="closeDialog"
  >
    <AuditSteps
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      :reviewers="reviewers"
      :marginWidth="3"
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
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="姓名" prop="ayStaffId">
            <el-select
              v-model="formData.ayStaffId"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              filterable
              @change="SimpleStaff"
              ><el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="部门" prop="ayDeptName">
            <el-input v-model="formData.ayDeptName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="职务" prop="ayPost">
            <el-input v-model="formData.ayPost" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="职级" prop="ayLevel">
            <el-input
              v-model="formData.ayLevel"
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="部门经理" prop="ayDeptManager">
            <el-input v-model="formData.ayDeptManager" readonly />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="入职日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              :style="{ width: '100%' }"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              readonly
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="离职日期" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              :style="{ width: '100%' }"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="离职原因" prop="offReason">
            <el-select
              v-model="formData.offReason"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            >
              <el-option
                v-for="item in officeList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="其他" prop="other">
            <el-input
              v-model="formData.other"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              type="textarea"
              :rows="2"
              show-word-limit
              :maxlength="255"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="离职具体说明" prop="offDetail">
            <el-input
              v-model="formData.offDetail"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              type="textarea"
              :rows="2"
              show-word-limit
              :maxlength="255"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.showDept" :offset="0" :span="24">
          <div class="oiurkk">所在部门</div>
        </el-col>
        <div v-if="formData.showDept" style="margin-left: 20px">
          <el-col :offset="0" :span="12">
            <el-checkbox
              v-model="formData.deptOption1"
              label="交还公司所有相关业务资料，包括技术软件、合同和说明书等"
            />
          </el-col>
          <el-col :offset="0" :span="12">
            <el-checkbox
              v-model="formData.deptOption2"
              label="交还所有手册、文件、工具书、报表和报告等"
            />
          </el-col>
          <el-col :offset="0" :span="12">
            <el-checkbox
              v-model="formData.deptOption3"
              label="原所从事工作己被接替"
            />
          </el-col>
          <el-col :offset="0" :span="12">
            <div v-if="formData.deptOption3" class="audit">
              <span style="margin-bottom: 10px">接替人</span>
              <el-input v-model="formData.deptOption3Name" />
            </div>
          </el-col>
          <el-col :offset="0" :span="12">
            <el-checkbox v-model="formData.deptOption4" label="其他" />
          </el-col>
        </div>

        <el-col v-if="formData.showNet" :offset="0" :span="24">
          <div class="oiurkk">综合管理部</div>
        </el-col>
        <div v-if="formData.showNet" style="margin-left: 20px">
          <el-col :offset="0" :span="12">
            <el-checkbox
              v-model="formData.netOption1"
              label="交还计算机及相关配置"
            />
          </el-col>
          <el-col :offset="0" :span="12">
            <div v-if="formData.netOption1" class="audit">
              <span style="margin-bottom: 10px">笔记本号</span>
              <el-input v-model="formData.netOption1Computer" />
              <span style="margin-bottom: 10px">系统密码</span>
              <el-input v-model="formData.netOption1Pwd" />
            </div>
          </el-col>
          <el-col :offset="0" :span="12">
            <el-checkbox v-model="formData.netOption2" label="关闭公司邮箱" />
          </el-col>
          <el-col :offset="0" :span="12">
            <el-checkbox
              v-model="formData.netOption3"
              label="清退公司qq群，微信群"
            />
          </el-col>
          <el-col :offset="0" :span="12">
            <el-checkbox
              v-model="formData.netOption4"
              label="删除门禁卡、指纹记录"
            />
          </el-col>
        </div>
        <div v-if="formData.showRes" style="margin-left: 20px">
          <el-col :offset="0" :span="12">
            <el-checkbox
              v-model="formData.resOption1"
              label="交还办公设备（桌子、柜子/钥匙等）"
            />
          </el-col>
          <el-col :offset="0" :span="12">
            <el-checkbox
              v-model="formData.resOption2"
              label="交还计算器、优盘等文具"
            />
          </el-col>
          <el-col :offset="0" :span="12">
            <el-checkbox v-model="formData.resOption3" label="交还门卡卡号" />
          </el-col>
          <el-col :offset="0" :span="12">
            <el-checkbox v-model="formData.resOption4" label="其他" />
          </el-col>
        </div>

        <div v-if="formData.showHum" style="margin-left: 20px">
          <el-col :offset="0" :span="12">
            <el-checkbox v-model="formData.humOption1" label="社保截止月份" />
          </el-col>
          <el-col :offset="0" :span="12">
            <div v-if="formData.humOption1" class="audit">
              <span style="margin-bottom: 10px">社保截止月份</span>
              <el-input v-model="formData.humOption1Month" />
            </div>
          </el-col>

          <el-col :offset="0" :span="24">
            <el-checkbox v-model="formData.humOption2" label="公积金截止月份" />
          </el-col>
          <el-col :offset="0" :span="12">
            <div v-if="formData.humOption2" class="audit">
              <span style="margin-bottom: 10px">公积金截止月份</span>
              <el-input v-model="formData.humOption2Month" />
            </div>
          </el-col>
          <el-col :offset="0" :span="24">
            <el-checkbox v-model="formData.humOption3" label="工资截止日期" />
          </el-col>
          <el-col :offset="0" :span="12">
            <div v-if="formData.humOption3" class="audit">
              <span style="margin-bottom: 10px">工资截止日期</span>
              <el-input v-model="formData.humOption3Date" />
            </div>
          </el-col>

          <el-col :offset="0" :span="24">
            <el-checkbox
              v-model="formData.humOption5"
              label="离职当月出勤天数（含年假 ），病假（工伤 ）天数,事假天数，迟到早退次数，本月出勤率%"
            />
          </el-col>
          <el-col :offset="0" :span="12">
            <div v-if="formData.humOption5" class="audit">
              <span style="margin-bottom: 10px">出勤天数</span>
              <el-input v-model="formData.humOption5wkDays" />
              <span style="margin-bottom: 10px">病假天数</span>
              <el-input v-model="formData.humOption5thDays" />
              <span style="margin-bottom: 10px">事假天数</span>
              <el-input v-model="formData.humOption3Date" />
              <span style="margin-bottom: 10px">迟到早退次数</span>
              <el-input v-model="formData.humOption5unCount" />
              <span style="margin-bottom: 10px">出勤率（百分制）</span>
              <el-input v-model="formData.humOption5Percent" />
            </div>
          </el-col>
          <el-col :offset="0" :span="12">
            <el-checkbox v-model="formData.humOption4" label="离职证明" />
          </el-col>
        </div>

        <el-col v-if="formData.showFin" :offset="0" :span="24">
          <div class="oiurkk">财务部</div>
        </el-col>
        <div v-if="formData.showFin" style="margin-left: 20px">
          <el-col :offset="0" :span="12">
            <el-checkbox
              v-model="formData.finOption1"
              label="是否结清借款 、报销款"
            />
          </el-col>
          <el-col :offset="0" :span="12">
            <el-checkbox
              v-model="formData.finOption2"
              label="离职月工资是否能结清个人应交社保 、公积金款项"
            />
          </el-col>
        </div>
        <el-col :span="24" :offset="0">
          <el-form-item
            v-if="
              showType == 'undo' ||
              (stauts == '已撤销' && showType == 'read') ||
              showType == 'undodraft' ||
              showType == 'querydraft'
            "
            label="撤回理由"
            prop="cancelReason"
          >
            <el-input
              v-model="formData.cancelReason"
              :readonly="showType == 'read' || showType == 'querydraft'"
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
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="
          showType == 'add' ||
          showType == 'edit' ||
          showType == 'draft' ||
          showType == 'upload'
        "
        type="primary"
        @click="submitForm(ruleFormRef, false)"
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
        v-if="showType == 'audit'"
        type="success"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >

      <el-button
        v-if="showType == 'undo' || showType == 'undodraft'"
        @click="submitFormQuery(canceFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.oiurkk {
  width: 100%;
  padding-left: 17px;
  margin: 0 0 15px;
  font-weight: 800;
  line-height: 30px;
  border-bottom: 1px solid #eee;
}

.checkMain {
  display: flex;
  flex-direction: column;
  margin-top: 20px;

  .audit {
    display: flex;
    flex-direction: column;
    padding: 20px;
    margin: 20px 0;
    background-color: #f1f1f1;
    border-radius: 4px;
  }
}
</style>
