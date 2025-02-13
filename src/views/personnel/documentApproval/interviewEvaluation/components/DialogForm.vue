<script setup lang="ts">
import { ElMessage, FormInstance } from "element-plus";
import _ from "lodash";
import { ref, computed, onMounted, watch } from "vue";

import {
  GetInterviewEvaluation,
  UpdateInterviewEvaluation,
  CreateInterviewEvaluation,
  CancelInterviewEvaluation,
  ApproveInterviewEvaluation,
  GetInterviewFirstAdviceNV,
  GetInterviewSecondAdviceNV
} from "@/api/interviewEvaluation";
import { emitter } from "@/utils/mitt";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { GetListNVByDeptId } from "@/api/jobs";
import { storeToRefs } from "pinia";
import { userStaffStoreHook } from "@/store/modules/staff";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

enum AuditResult {
  agree,
  refuse,
  back
}

const fromRules = {
  candidate: [{ required: true, message: "请输入应聘人员", trigger: "blur" }],

  ayMethod: [{ required: true, message: "请输入应聘方式", trigger: "blur" }],
  ayDeptId: [{ required: true, message: "请选择应聘部门", trigger: "change" }],
  ayPostId: [{ required: true, message: "请选择应聘职位", trigger: "change" }],
  firstInterviewerId: [
    { required: true, message: "请选择初试人", trigger: "change" }
  ],
  secondInterviewerId: [
    { required: true, message: "请选择复试人", trigger: "change" }
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
  candidate: "",
  ayMethod: "",
  ayDeptId: "",
  ayDeptName: "",
  ayPostId: "",
  ayPost: "",
  firstInterviewRecord: "",
  firstInterviewSuggest: "",
  firstInterviewerId: "", //初试人1
  firstInterviewer: "",
  firstInterviewer2Id: "", //初试人2
  firstInterviewer2: "",
  firstInterviewDate: "",
  secondInterviewRecord: "",
  secondInterviewSuggest: "",
  secondInterviewerId: "", //复试人1
  secondInterviewer: "",
  secondInterviewer2Id: "", //复试人2
  secondInterviewer2: "",
  secondInterviewDate: "",
  hireDate: "",
  probationSalary: 0,
  salary: 0,
  probationPeriod: 1,
  socialSecurityBase: 0,
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
const formData = ref({ ...INITIAL_DATA });
const formLoading = ref(false);
const formVisible = ref(false);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const canceFormRef = ref<FormInstance>();
const firstAdviceNV = ref([]); //初试建议
const secondAdviceNV = ref([]); //复试建议
const JobtreeData = ref([]); //职位
const { staffListNV } = storeToRefs(userStaffStoreHook());
const { getDepartmentTree } = userDepartmentStoreHook();
const { departmentTree } = storeToRefs(userDepartmentStoreHook());
const { getStaffListNV } = userStaffStoreHook();
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
//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: false
};

watch(
  () => formData.value.ayDeptId,
  val => {
    if (val && showType.value == "add") {
      formData.value.ayPostId = "";
      JobtreeData.value = [];
    }
  }
);

/**
 * 根据部门Id获取职位列表
 * @param deptId 部门Id
 */
async function getPositionList(deptId) {
  if (deptId != null && deptId != "" && deptId) {
    const { data } = await GetListNVByDeptId({ deptId: deptId });
    JobtreeData.value = data || [];
  } else {
    JobtreeData.value = [];
  }
}

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  getStaffListNV();
  activeName.value = "baseInfo";
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };

  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
    await getPositionList(formData.value.ayDeptId);
  } else {
    showType.value = "add";
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetInterviewEvaluation({ id });
  formData.value = data || {};
  await getPositionList(formData.value.ayDeptId);
  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });
  if (data) {
    reviewers.value = data.reviewers || [];
  }

  formLoading.value = false;
}

//获取初试建议nv
async function InterviewFirstAdviceNV() {
  const { data } = await GetInterviewFirstAdviceNV();
  firstAdviceNV.value = data || [];
}

//获取复试建议nv
async function InterviewSecondAdviceNV() {
  const { data } = await GetInterviewSecondAdviceNV();
  secondAdviceNV.value = data || [];
}

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, flag: boolean) => {
    if (!formEl) return;
    formEl.validate(async valid => {
      if (valid) {
        if (showType.value == "edit") {
          formData.value.doTemp = flag;
          UpdateInterviewEvaluation(formData.value).then(
            ({ code, message }) => {
              if (code == 0) {
                ElMessage.success(message);
                formVisible.value = false;
                resetForm(formEl);
                emit("search");
              }
            }
          );
        } else if (showType.value == "add") {
          formData.value.doTemp = flag;
          CreateInterviewEvaluation(formData.value).then(
            ({ code, message }) => {
              if (code == 0) {
                ElMessage.success(message);
                formVisible.value = false;
                resetForm(formEl);
                emit("search");
              }
            }
          );
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
        ApproveInterviewEvaluation({
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
      const { code, message } = await CancelInterviewEvaluation({
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

//mounted周期函数
onMounted(() => {
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  InterviewFirstAdviceNV();
  InterviewSecondAdviceNV();
});
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="800"
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
      label-width="155px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="应聘人员" prop="candidate">
            <el-input
              v-model="formData.candidate"
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
          <el-form-item label="应聘方式/推荐" prop="ayMethod">
            <el-input
              v-model="formData.ayMethod"
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
          <el-form-item label="应聘部门" prop="ayDeptId">
            <el-cascader
              v-model="formData.ayDeptId"
              :options="departmentTree"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
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
          <el-form-item label="应聘职位" prop="ayPostId">
            <el-select
              v-model="formData.ayPostId"
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
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="初试人1" prop="firstInterviewerId">
            <el-select
              v-model="formData.firstInterviewerId"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              filterable
              ><el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="初试人2" prop="firstInterviewer2Id">
            <el-select
              v-model="formData.firstInterviewer2Id"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              filterable
              ><el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="复试人1" prop="secondInterviewerId">
            <el-select
              v-model="formData.secondInterviewerId"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              filterable
              ><el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="复试人2" prop="secondInterviewer2Id">
            <el-select
              v-model="formData.secondInterviewer2Id"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              filterable
              ><el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>

        <el-divider content-position="left">录用薪资</el-divider>

        <el-col :span="12" :offset="0">
          <el-form-item label="入职日期" prop="hireDate">
            <el-date-picker
              v-model="formData.hireDate"
              :style="{ width: '100%' }"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="试用薪资" prop="probationSalary">
            <el-input
              v-model="formData.probationSalary"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              type="number"
              @input="
                val => {
                  formData.probationSalary =
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
          <el-form-item label="转正薪资" prop="salary">
            <el-input
              v-model="formData.salary"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              type="number"
              @input="
                val => {
                  formData.salary = val == '' ? 0 : Math.abs(parseFloat(val));
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
          <el-form-item label="试用期" prop="probationPeriod">
            <el-input
              v-model="formData.probationPeriod"
              type="number"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              @input="
                val => {
                  formData.probationPeriod =
                    val == '' ? 0 : Math.abs(parseInt(val));
                }
              "
            >
              <template #suffix>
                <p>{{ "月" }}</p>
              </template>
            </el-input>
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="社保及公积金缴纳基数" prop="socialSecurityBase">
            <el-input
              v-model="formData.socialSecurityBase"
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
      :label-width="activeName == 'auditInfo' ? '92px' : '155px'"
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
