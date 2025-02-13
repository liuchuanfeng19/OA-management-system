<script setup lang="ts">
import _ from "lodash";
import { ref, computed, watch } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { storeToRefs } from "pinia";
import {
  getComputerCollect,
  ComputerCollectUpdate,
  ComputerCollectCreate,
  ComputerCollectCancel,
  ComputerCollectApprove
} from "@/api/computerCollect";
import { ComputerGetListNV, ComputerGet } from "@/api/computer";
import { emitter } from "@/utils/mitt";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";

import { userDepartmentStoreHook } from "@/store/modules/department";
import { getStaffList as getStaffListByDeptid } from "@/api/staff";
import { userStaffStoreHook } from "@/store/modules/staff";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

enum AuditResult {
  agree,
  refuse,
  back
}

const { getStaffListNV } = userStaffStoreHook();
const fromRules = {
  computerId: [
    { required: true, message: "请选择设备名称", trigger: "change" }
  ],

  collectDeptId: [
    { required: true, message: "请选择领用部门", trigger: "change" }
  ],
  collectTime: [
    { required: true, message: "请选择领用日期", trigger: "change" }
  ],
  collectStaffId: [
    { required: true, message: "请选择领用人", trigger: "change" }
  ],
  collectPlace: [{ required: true, message: "请输入存放位置", trigger: "blur" }]
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

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  staffName: "",
  deptName: "",
  mobile: "",
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
  doTemp: false, //是否暂存
  collectTime: "", //领用日期
  computerId: "", //计算机名称（设备名称）
  computerName: "", //设备名称
  computerCode: "", //设备编号
  collectDeptId: "", //领用部门
  collectDeptName: "", //领用部门
  collectStaffId: "", //领用人ID
  collectStaffName: "",
  collectPlace: "", //存放位置（领用）
  returnTime: "", //交还日期
  returnDeptId: "", //交还部门
  returnDeptName: "",
  returnStaffId: "", //交还人id
  returnStaffName: "",
  returnDeptStaffId: "",
  returnDeptStaffName: "",
  returnAdminStaffId: "",
  returnAdminStaffName: "",
  state: "",
  returnPlace: "" //存放位置（交还）
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法

const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});

const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: false
};

const computerList = ref([]);
const staffList = ref([]);
const showType = ref("apply");
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
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "apply"
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
  () => formData.value.collectDeptId,
  val => {
    if (val) {
      getStaffList(val);
    }
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  getStaffListNV();
  activeName.value = "baseInfo";
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };

  if (_formData) {
    showType.value = _type;
    await getDetail(_formData.id);
    await getComputerList(formData.value.computerId);
  } else {
    showType.value = "apply";
    getComputerList(null);
  }
};
defineExpose({ show });

//申请人选项接口
async function getStaffList(val) {
  const { data } = await getStaffListByDeptid({
    deptId: val,
    pageIndex: 1,
    pageSize: 9999
  });
  staffList.value = data.data || [];
}

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getComputerCollect({ id });
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

//设备NV列表
async function getComputerList(id) {
  const { data } = await ComputerGetListNV({ id: id });
  computerList.value = data || [];
}

//根据电脑ID获取详情
async function computerDetail(val) {
  formLoading.value = true;
  const { data } = await ComputerGet({ id: val });
  formData.value.computerCode = data.code;
}

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, flag: boolean) => {
    if (!formEl) return;
    formEl.validate(async valid => {
      if (valid) {
        if (showType.value == "edit") {
          formData.value.doTemp = flag;
          ComputerCollectUpdate(formData.value).then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          });
        } else if (showType.value == "apply") {
          formData.value.doTemp = flag;
          ComputerCollectCreate(formData.value).then(({ code, message }) => {
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
        ComputerCollectApprove({
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
      const { code, message } = await ComputerCollectCancel({
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
      class="mb-2"
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
          <el-form-item label="设备名称" prop="computerId">
            <el-select
              v-model="formData.computerId"
              filterable
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              :style="{ width: '100%' }"
              @change="computerDetail"
            >
              <el-option
                v-for="item in computerList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="设备编号" prop="computerCode">
            <el-input v-model="formData.computerCode" readonly />
          </el-form-item>
        </el-col>
        <el-divider content-position="left">领用</el-divider>
        <el-col :span="12" :offset="0">
          <el-form-item label="领用部门" prop="collectDeptId">
            <el-cascader
              v-model="formData.collectDeptId"
              :disabled="showType == 'audit' || showType == 'read'"
              :options="departmentTree"
              :placeholder="
                showType == 'audit' || showType == 'read' ? '' : '请选择'
              "
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="领用人" prop="collectStaffId">
            <el-select
              v-model="formData.collectStaffId"
              :disabled="showType == 'audit' || showType == 'read'"
              :placeholder="
                showType == 'audit' || showType == 'read' ? '' : '请选择'
              "
              style="width: 100%"
            >
              <el-option
                v-for="item in staffList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="领用日期" prop="collectTime">
            <el-date-picker
              v-model="formData.collectTime"
              :placeholder="showType == 'read' ? '' : '请选择'"
              :disabled="showType == 'read'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="存放位置" prop="collectPlace">
            <el-input
              v-model="formData.collectPlace"
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
        <el-divider
          v-if="showType == 'read' && formData.state == '2'"
          content-position="left"
          >交还</el-divider
        >
        <el-col
          v-if="showType == 'read' && formData.state == '2'"
          :span="12"
          :offset="0"
        >
          <el-form-item label="交还部门" prop="returnDeptName">
            <el-input v-model="formData.returnDeptName" readonly />
          </el-form-item>
        </el-col>

        <el-col
          v-if="showType == 'read' && formData.state == '2'"
          :span="12"
          :offset="0"
        >
          <el-form-item label="交还人" prop="returnStaffName">
            <el-input v-model="formData.returnStaffName" readonly />
          </el-form-item>
        </el-col>
        <el-col
          v-if="showType == 'read' && formData.state == '2'"
          :span="12"
          :offset="0"
        >
          <el-form-item label="交还部门主管" prop="returnDeptStaffName">
            <el-input v-model="formData.returnDeptStaffName" readonly />
          </el-form-item>
        </el-col>
        <el-col
          v-if="showType == 'read' && formData.state == '2'"
          :span="12"
          :offset="0"
        >
          <el-form-item label="管理员" prop="returnAdminStaffName">
            <el-input v-model="formData.returnAdminStaffName" readonly />
          </el-form-item>
        </el-col>
        <el-col
          v-if="showType == 'read' && formData.state == '2'"
          :span="12"
          :offset="0"
        >
          <el-form-item label="交还日期" prop="returnTime">
            <el-date-picker
              v-model="formData.returnTime"
              readonly
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>

        <el-col
          v-if="showType == 'read' && formData.state == '2'"
          :span="24"
          :offset="0"
        >
          <el-form-item label="存放位置" prop="returnPlace">
            <el-input v-model="formData.returnPlace" readonly />
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
              showType == 'undo' ||
              (formData.applyStatusExpr == '已撤销' && showType == 'read')
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
        >提交</el-button
      >
    </template>
  </el-dialog>
</template>
