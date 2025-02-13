<script setup lang="ts">
import { ElMessage, FormInstance } from "element-plus";
import _ from "lodash";
import { ref, computed, onMounted } from "vue";

import {
  GetStaffRenewAudit,
  UpdateStaffRenewAudit,
  CreateStaffRenewAudit,
  CancelStaffRenewAudit,
  ApproveStaffRenewAudit
} from "@/api/staffRenewAudit";
import { emitter } from "@/utils/mitt";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { storeToRefs } from "pinia";
// import { GetTreeByDeptId } from "@/api/department";
import { userDepartmentStoreHook } from "@/store/modules/department";
// import { GetListNVByDeptId } from "@/api/jobs";
// import { userStaffStoreHook } from "@/store/modules/staff";
import { getStaffListNV } from "@/api/staff";
import { isIdCard } from "@/utils/validate";
import { GetSimpleStaff } from "@/api/staff";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

enum AuditResult {
  agree,
  refuse,
  back
}

const fromRules = {
  innerStaffId: [{ required: true, message: "请选择姓名", trigger: "change" }],
  // innerCompanyId: [
  //   { required: true, message: "请选择所属公司", trigger: "change" }
  // ],
  // innerDeptId: [{ required: true, message: "请选择部门", trigger: "change" }],
  // jobTitleId: [{ required: true, message: "请选择职位", trigger: "change" }],

  localAddress: [
    { required: true, message: "请输入常住地址", trigger: "blur" }
  ],

  deptRemark: [{ required: true, message: "请输入部门评价", trigger: "blur" }],
  timeRange: [{ required: true, message: "请选择合同期限", trigger: "change" }],
  idCard: [
    {
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value) {
          if (!isIdCard(value)) {
            callback(new Error("身份证格式不正确"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      }
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
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  innerStaffId: "",
  innerStaffName: "",
  innerCompanyId: "",
  innerCompanyName: "",
  innerDeptId: "",
  innerDeptName: "",
  jobTitleId: "",
  jobTitleName: "",
  idCard: "",
  major: "",
  educationLevel: "",
  homeAddress: "",
  localAddress: "",
  postCode1: "",
  postCode2: "",
  certs: "",
  startTime: "",
  endTime: "",
  timeRange: null,
  deptRemark: "",
  applyReason: "",
  cancelReason: "", //取消原因
  applyTime: "",
  applyStatus: "",
  applyStatusExpr: "",
  canTemp: false, //是否可以暂存
  canApprove: false, //是否可以审核
  canReject: false, //是否可以驳回（驳回之后流程结束）
  canCancel: false, //是否可以取消（针对发起人）
  canReturnBack: false, //是否可以退回（由审批人退回）（退回后仍然可以继续提交申请
  doTemp: false //是否暂存
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
const formData = ref(null);
const formLoading = ref(false);
const formVisible = ref(false);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const canceFormRef = ref<FormInstance>();
const staffListNV = ref([]);
// const departmentList = ref([]); //部门
// const JobtreeData = ref([]); //职位
// const { staffListNV } = storeToRefs(userStaffStoreHook());
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
// const { getStaffListNV } = userStaffStoreHook();
const { getRootDeptList } = userDepartmentStoreHook();
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加"
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

// // //el-cascader props属性值
// const selProps = {
//   children: "children",
//   label: "fullName",
//   multiple: false,
//   emitPath: false,
//   value: "id",
//   checkStrictly: true
// };
// /**
//  * 根据公司Id获取部门列表
//  * @param companyId 公司Id
//  */
// async function getDepartmentList(innerCompanyId) {
//   if (innerCompanyId != null && innerCompanyId != "") {
//     const { data } = await GetTreeByDeptId({ deptId: innerCompanyId });
//     departmentList.value = data || [];
//   } else {
//     departmentList.value = [];
//   }
// }

// /**
//  * 根据部门Id获取职位列表
//  * @param deptId 部门Id
//  */
// async function getPositionList(innerDeptId) {
//   if (innerDeptId != null && innerDeptId != "") {
//     const { data } = await GetListNVByDeptId({ deptId: innerDeptId });
//     JobtreeData.value = data || [];
//   } else {
//     JobtreeData.value = [];
//   }
// }

//人员列表
async function StaffListNV() {
  const { data } = await getStaffListNV({ staffName: "", jobStatus: 1 });
  staffListNV.value = data || [];
}

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }

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
  formData.value.innerCompanyName = data.companyName;
  formData.value.innerDeptName = data.deptName;
  formData.value.jobTitleName = data.jobTitleName;
  formData.value.idCard = data.idCard;
  formData.value.major = data.major;
  formData.value.educationLevel = data.educationLevel;
}

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  await StaffListNV();
  formLoading.value = true;
  const { data } = await GetStaffRenewAudit({ id });
  formData.value = data || {};
  // await getDepartmentList(formData.value.innerCompanyId);
  // await getPositionList(formData.value.innerDeptId);
  formData.value.timeRange =
    formData.value.startTime && formData.value.endTime
      ? [formData.value.startTime, formData.value.endTime]
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

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, flag: boolean) => {
    if (!formEl) return;

    formEl.validate(async valid => {
      if (valid) {
        const { timeRange, ...params } = formData.value;
        params.startTime = timeRange[0];
        params.endTime = timeRange[1];
        if (showType.value == "edit") {
          formData.value.doTemp = flag;
          UpdateStaffRenewAudit(params).then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          });
        } else if (showType.value == "add") {
          formData.value.doTemp = flag;
          CreateStaffRenewAudit(params).then(({ code, message }) => {
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
        ApproveStaffRenewAudit({
          id: formData.value.id,
          isApproved:
            _auditResult == AuditResult.agree
              ? true
              : _auditResult == AuditResult.refuse
                ? false
                : false,
          isReturnBack: _auditResult == AuditResult.back ? true : false,
          comment1: auditData.value.comment1
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
      const { code, message } = await CancelStaffRenewAudit({
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

// mounted周期函数
onMounted(async () => {
  StaffListNV();
});
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="740"
    :class="showType == 'add' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="closeDialog"
  >
    <AuditSteps
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      :reviewers="reviewers"
      :marginWidth="10"
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
      label-width="112px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="姓名" prop="innerStaffId">
            <el-select
              v-model="formData.innerStaffId"
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
        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="所属公司" prop="innerCompanyId">
            <el-cascader
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              v-model="formData.innerCompanyId"
              :options="rootDepartment"
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
              @change="getDepartmentList"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="部门" prop="innerDeptId">
            <el-cascader
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              v-model="formData.innerDeptId"
              :options="departmentList"
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
              @change="getPositionList"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="职位" prop="jobTitleId">
            <el-select
              v-model="formData.jobTitleId"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              ><el-option
                v-for="item in JobtreeData"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col> -->
        <el-col :span="12" :offset="0">
          <el-form-item label="所属公司" prop="innerCompanyName">
            <el-input v-model="formData.innerCompanyName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="部门" prop="innerDeptName">
            <el-input v-model="formData.innerDeptName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="职位" prop="jobTitleName">
            <el-input v-model="formData.jobTitleName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="学历" prop="educationLevel">
            <el-input v-model="formData.educationLevel" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="专业" prop="major">
            <el-input v-model="formData.major" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="formData.idCard" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="16" :offset="0">
          <el-form-item label="家庭住址" prop="homeAddress">
            <el-input
              v-model="formData.homeAddress"
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
        <el-col :span="8" :offset="0">
          <el-form-item label="邮政编码" prop="postCode1">
            <el-input
              v-model="formData.postCode1"
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
        <el-col :span="16" :offset="0">
          <el-form-item label="常住地址" prop="localAddress">
            <el-input
              v-model="formData.localAddress"
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
        <el-col :span="8" :offset="0">
          <el-form-item label="邮政编码" prop="postCode2">
            <el-input
              v-model="formData.postCode2"
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
          <el-form-item label="合同期限" prop="timeRange">
            <el-date-picker
              v-model="formData.timeRange"
              :style="{ width: '100%' }"
              type="daterange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
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

        <el-col :span="24" :offset="0">
          <el-form-item label="已取得相关证书" prop="certs">
            <el-input
              v-model="formData.certs"
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

        <el-col :span="24" :offset="0">
          <el-form-item label="部门评价" prop="deptRemark">
            <el-input
              v-model="formData.deptRemark"
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
      :label-width="activeName == 'auditInfo' ? '92px' : '112px'"
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
