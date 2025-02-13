<script setup lang="ts">
import _ from "lodash";
import { ref, computed, onMounted, watch } from "vue";

import { ElMessage, FormInstance } from "element-plus";
import { getUserInfo } from "@/api/user";
import {
  GetPersonnelRequirements,
  UpdatePersonnelRequirements,
  CreatePersonnelRequirements,
  ApprovePersonnelRequirements,
  CancelPersonnelRequirements,
  GetRecruitmentMethodsNV, //招聘方式
  GetRecruitReasonNV //招聘理由
} from "@/api/personnelRequirements";
import { emitter } from "@/utils/mitt";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { userProjectStoreHook } from "@/store/modules/project";

import { GetListNVByDeptId } from "@/api/jobs";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { storeToRefs } from "pinia";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

enum AuditResult {
  agree,
  refuse,
  back
}

const { getProjectWinBidNVList } = userProjectStoreHook();

const fromRules = {
  ayDeptId: [{ required: true, message: "请选择申请部门", trigger: "change" }],

  ayPostId: [{ required: true, message: "请选择申请岗位", trigger: "change" }],
  ayIncrease: [
    { required: true, message: "请输入申请增加人数", trigger: "blur" }
  ],
  recruitReason: [
    { required: true, message: "请选择招聘理由", trigger: "change" }
  ],
  jobRequirements: [
    { required: true, message: "请输入岗位要求", trigger: "blur" }
  ],
  educationalRequirements: [
    { required: true, message: "请输入学历要求", trigger: "blur" }
  ],
  experienceRequirements: [
    { required: true, message: "请输入经验要求", trigger: "blur" }
  ],
  techRequirements: [
    { required: true, message: "请输入技能要求", trigger: "blur" }
  ],
  recruitmentMethods: [
    { required: true, message: "请选择招聘方式", trigger: "change" }
  ],
  ayStaffId: [{ required: true, message: "请选择申请人", trigger: "change" }],
  startSalary: [
    { required: true, message: "请输入建议薪资", trigger: "change" }
  ]
  // endSalary: [{ required: true, message: "请输入建议薪资", trigger: "change" }]
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
const { getDepartmentTree } = userDepartmentStoreHook();
const { getRootDeptList } = userDepartmentStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  companyId: "",
  companyName: "",
  ayDeptId: "",
  ayDeptName: "",
  ayPost: "",
  ayPostId: "",
  existingStaffing: 1,
  actualNumber: 1,
  ayIncrease: 1,
  recruitReason: "",
  otherRecruitReason: "",
  jobRequirements: "",
  educationalRequirements: "",
  experienceRequirements: "",
  techRequirements: "",
  otherRequirements: "",
  startSalary: 0,
  endSalary: 0,
  recruitmentMethods: "",
  ayStaffId: "",
  ayStaffName: "",
  remark: "",
  cancelReason: "",
  canTemp: false, //是否可以暂存
  canApprove: false, //是否可以审核
  canReject: false, //是否可以驳回（驳回之后流程结束）
  canCancel: false, //是否可以取消（针对发起人）
  canReturnBack: false, //是否可以退回（由审批人退回）（退回后仍然可以继续提交申请
  doTemp: false, //是否暂存
  recruitmentMethodsList: ""
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
const { departmentTree } = storeToRefs(userDepartmentStoreHook());
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
const JobtreeData = ref([]); //职位
const recruitmentMethodsNV = ref([]); //招聘方式
const recruitReasonNV = ref([]); //招聘理由
const tableColumnData = ref([]);

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: false
};

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

watch(
  () => formData.value.ayDeptId,
  val => {
    if (val && showType.value == "add") {
      formData.value.ayPostId = "";
      JobtreeData.value = [];
    }
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  getProjectWinBidNVList();
  activeName.value = "baseInfo";
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  getUser();
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
  const { data } = await GetPersonnelRequirements({ id });
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

/**
 * 根据部门Id获取职位列表
 * @param deptId 部门Id
 */
async function getPositionList(deptId) {
  if (deptId != null && deptId != "") {
    const { data } = await GetListNVByDeptId({ deptId: deptId });
    JobtreeData.value = data || [];
  } else {
    JobtreeData.value = [];
  }
}

// 招聘方式NV
async function RecruitmentMethodsNV() {
  const { data } = await GetRecruitmentMethodsNV();
  recruitmentMethodsNV.value = data || [];
}

// 招聘理由NV
async function RecruitReasonNV() {
  const { data } = await GetRecruitReasonNV();
  recruitReasonNV.value = data || [];
}

//获取当前登录人员信息
const getUser = async () => {
  const { data } = await getUserInfo();
  formData.value.ayStaffName = data.staffName;
};

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, flag: boolean) => {
    if (!formEl) return;
    formEl.validate(async valid => {
      if (valid) {
        if (showType.value == "edit") {
          formData.value.doTemp = flag;
          UpdatePersonnelRequirements(formData.value).then(
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
          CreatePersonnelRequirements(formData.value).then(
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
        ApprovePersonnelRequirements({
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
      const { code, message } = await CancelPersonnelRequirements({
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
onMounted(async () => {
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  RecruitmentMethodsNV();
  RecruitReasonNV();
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
          <el-form-item label="申请部门" prop="ayDeptId">
            <el-cascader
              v-model="formData.ayDeptId"
              :options="departmentTree"
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              @change="getPositionList"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="申请岗位" prop="ayPostId">
            <el-select
              v-model="formData.ayPostId"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            >
              <el-option
                v-for="item in JobtreeData"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="现有编制" prop="existingStaffing">
            <el-input
              v-model="formData.existingStaffing"
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
                  formData.existingStaffing =
                    val == '' ? 0 : Math.abs(parseInt(val));
                }
              "
            >
              <template #suffix>
                <p>{{ "人" }}</p>
              </template>
            </el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="实际在岗" prop="actualNumber">
            <el-input
              v-model="formData.actualNumber"
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
                  formData.actualNumber =
                    val == '' ? 0 : Math.abs(parseInt(val));
                }
              "
            >
              <template #suffix>
                <p>{{ "人" }}</p>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="申请增加" prop="ayIncrease">
            <el-input
              v-model="formData.ayIncrease"
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
                  formData.ayIncrease = val == '' ? 0 : Math.abs(parseInt(val));
                }
              "
            >
              <template #suffix>
                <p>{{ "人" }}</p>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="招聘理由" prop="recruitReason">
            <el-select
              v-model="formData.recruitReason"
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              clearable
            >
              <el-option
                v-for="item in recruitReasonNV"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          v-if="formData.recruitReason == '其他(请说明)'"
          :span="24"
          :offset="0"
        >
          <el-form-item label="其他理由" prop="otherRecruitReason">
            <el-input
              v-model="formData.otherRecruitReason"
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
          <el-form-item label="岗位要求" prop="jobRequirements">
            <el-input
              v-model="formData.jobRequirements"
              :rows="4"
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
          <el-form-item label="学历要求" prop="educationalRequirements">
            <el-input
              v-model="formData.educationalRequirements"
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
          <el-form-item label="经验要求" prop="experienceRequirements">
            <el-input
              v-model="formData.experienceRequirements"
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
          <el-form-item label="技能要求" prop="techRequirements">
            <el-input
              v-model="formData.techRequirements"
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
        <el-col :span="12" :offset="0">
          <el-form-item label="其他要求" prop="otherRequirements">
            <el-input
              v-model="formData.otherRequirements"
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
        <el-col :span="5" :offset="0">
          <el-form-item label="建议薪资" prop="startSalary">
            <el-input
              v-model="formData.startSalary"
              style="width: 80px"
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
                  formData.startSalary =
                    val == '' ? 0 : Math.abs(parseInt(val));
                }
              "
            >
              <template #suffix>
                <p>{{ "元" }}</p>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="0">
          <el-form-item label="至" prop="endSalary">
            <el-input
              v-model="formData.endSalary"
              style="width: 80px"
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
                  formData.endSalary = val == '' ? 0 : Math.abs(parseInt(val));
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
          <el-form-item label="招聘方式" prop="recruitmentMethodsList">
            <el-select
              v-model="formData.recruitmentMethodsList"
              :collapse-tags="true"
              :collapse-tags-tooltip="true"
              :style="{ width: '100%' }"
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              multiple
              filterable
              :reserve-keyword="true"
            >
              <el-option
                v-for="item in recruitmentMethodsNV"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <!-- <el-select
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              v-model="formData.recruitmentMethodsList"
              clearable
            >
              <el-option
                v-for="item in recruitmentMethodsNV"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select> -->
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="申请人" prop="ayStaffName">
            <el-input v-model="formData.ayStaffName" readonly />
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
