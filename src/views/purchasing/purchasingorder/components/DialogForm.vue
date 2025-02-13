<script setup lang="ts">
import _ from "lodash";
import dayjs from "dayjs";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";

import {
  GetReqOrder,
  ApproveReqOrder,
  GetApproveProjectListNV
} from "@/api/reqOrder";
import { columns } from "../constant";
import { emitter } from "@/utils/mitt";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import ReadDescriptions from "@/components/ReadDescriptions";

enum AuditResult {
  agree,
  refuse,
  back
}

const COMPANY_MODEL = {
  materialName: "", //设备名称
  materialSpec: "", //规格型号
  materialUnit: "", //单位
  materialQty: 0, //数量
  materialParams: "", //参数要求
  receiveTime: "", //到货日期
  remark: "" //备注
};
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "", //项目Id
  projectFullName: "", //项目名称
  winBidCompanyName: "", //中标单位（只读）
  buyRecvAddressId: "", //收货地址ID
  openAddress: "", //收货人姓名（只读）
  recvMobile: "", //收货人联系方式（只读）
  recvAddress: "", //收货地址（只读）
  recvName: "", //收货人姓名（只读）
  cancelReason: "", //撤回理由
  comment1: "", //审批意见
  reqOrderItems: [
    {
      ...COMPANY_MODEL
    }
  ]
};

// 表单校验规则
const fromRules = {
  biddingId: [{ required: true, message: "请选择项目", trigger: "blur" }],
  reqOrderItems: [
    { required: true, message: "请添加投标单位", trigger: "blur" }
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
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const reviewers = ref([]); //审批人员
const projectList = ref([]); // 项目列表
const showType = ref("add");
const formLoading = ref(false);
const tableColumnData = ref([]);
const dialogVisible = ref(false);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const columnList = ref([]);
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加下采单"
    : showType.value == "edit"
      ? "编辑下采单"
      : showType.value == "read"
        ? "查看下采单"
        : showType.value == "audit"
          ? "审核下采单"
          : "";
});

function formatDatetime(dt) {
  if (dt == null || dt == "") {
    return "-";
  }
  return dayjs(dt).format("YYYY-MM-DD");
}

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  activeName.value = "baseInfo";
  if (projectList.value.length < 1) {
    getProjectList();
  }

  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  formData.value.reqOrderItems = [
    {
      ...COMPANY_MODEL
    }
  ];
  if (_formData) {
    getDetail(_formData.id);
  }
};
defineExpose({ show });

// 获取项目列表数据
function getProjectList() {
  GetApproveProjectListNV()
    .then(({ data }) => {
      projectList.value = data || [];
    })
    .catch(() => {
      projectList.value = [];
    });
}

// 根据部门Id获取员工列表
// const getDetail = async id => {
//   const { data = {} } = await getProjectBid({
//     id
//   });
//   formData.value = data || {};
// };
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetReqOrder({ id });
  formData.value = data || {};

  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });

  if (data) {
    reviewers.value = data.reviewers || [];
    if (data.reqOrderItems != null) {
      const item = data.reqOrderItems[0];
      columnList.value = item.siteItems || [];
    }
  }
  formLoading.value = false;
}

function handleProjectChange(val) {
  const project = projectList.value.find(item => item.value == val);
  formData.value.projectFullName = project.name;
}

// function handleAdd() {
//   formData.value.reqOrderItems.push({ ...COMPANY_MODEL });
// }

// function handleDelete(index) {
//   formData.value.reqOrderItems.splice(index, 1);
// }

// 提交审核表单
const submitAuditForm = _.debounce(
  async (formEl: FormInstance | undefined, _auditResult: AuditResult) => {
    if (!formEl) return;
    auditResult.value = _auditResult;
    formLoading.value = true;
    formEl.validate(valid => {
      if (valid) {
        ApproveReqOrder({
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
              dialogVisible.value = false;
              resetForm(formEl);
              emit("search");
              emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
            }
          })
          .catch()
          .finally(() => {
            formLoading.value = false;
          });
      } else {
        formLoading.value = false;
      }
    });
  },
  300
);

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  reviewers.value = [];
  activeName.value = "baseInfo";
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value);
  activeName.value = "baseInfo";
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="860"
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
        <el-col :span="16" :offset="0">
          <el-form-item label="项目名称" prop="projectFullName">
            <el-select
              v-if="false"
              v-model="formData.projectId"
              :disabled="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请选择'
              "
              clearable
              filterable
              style="width: 100%"
              @change="handleProjectChange"
            >
              <el-option
                v-for="item in projectList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
            <el-input
              v-model="formData.projectFullName"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请选择'
              "
              :readonly="showType == 'read' || showType == 'audit'"
              clearable
            />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="8" :offset="0">
          <el-form-item label="项目负责人" prop="openTime">
            <el-input
              :show-word-limit="true"
              v-model="formData.openAddress"
              :readonly="showType == 'read'"
              placeholder="请输入开标地点"
            />

          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="中标单位" prop="openAddress">
            <el-input
              :show-word-limit="true"
              v-model="formData.openAddress"
              :readonly="showType == 'read'"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col> -->
        <el-col :span="8" :offset="0">
          <el-form-item label="收货人" prop="recvName">
            <el-input
              v-model="formData.recvName"
              :show-word-limit="true"
              readonly
            />
          </el-form-item>
        </el-col>
        <el-col :span="16" :offset="0">
          <el-form-item label="收货地址" prop="recvAddress">
            <el-input
              v-model="formData.recvAddress"
              :show-word-limit="true"
              readonly
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="电话" prop="recvMobile">
            <el-input
              v-model="formData.recvMobile"
              :show-word-limit="true"
              readonly
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-card
      v-show="activeName == 'baseInfo'"
      shadow="never"
      :body-style="{
        padding: '0px',
        border: 'none'
      }"
      style="margin-bottom: 20px"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span>设备明细</span>
          <!-- <el-button
            v-if="showType == 'add' || showType == 'edit'"
            type="primary"
            plain
            @click="handleAdd"
          >
            添加
          </el-button> -->
        </div>
      </template>
      <el-table
        highlight-current-row
        :data="formData.reqOrderItems"
        border
        stripe
        :max-height="200"
      >
        <el-table-column
          label="序号"
          type="index"
          width="60"
          fixed="left"
          align="center"
        />
        <el-table-column
          label="设备名称"
          width="120"
          show-overflow-tooltip
          fixed="left"
          prop="materialName"
        />
        <el-table-column
          label="规格型号"
          width="120"
          align="center"
          show-overflow-tooltip
          prop="materialSpec"
        />
        <el-table-column
          label="参数要求"
          width="120"
          align="center"
          show-overflow-tooltip
          prop="materialParams"
        />
        <el-table-column
          label="单位"
          width="80"
          align="center"
          show-overflow-tooltip
          prop="materialUnit"
        />

        <!-- <el-table-column
          label="到货日期"
          width="120"
          align="center"
          show-overflow-tooltip
          prop="receiveTime"
        >
          <template #default="{ row }">
            {{ formatDatetime(row.receiveTime) }}
          </template>
        </el-table-column> -->

        <el-table-column
          v-for="(item, idx) in columnList"
          :key="item.siteId"
          :label="item.siteName"
          width="100"
          align="center"
        >
          <el-table-column
            label="数量"
            align="right"
            width="100"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span>{{ row.siteItems[idx].materialQty }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="到货日期"
            align="center"
            width="150"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span>{{ formatDatetime(row.siteItems[idx].receiveTime) }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column
          label="合计数量"
          width="100"
          align="right"
          show-overflow-tooltip
          prop="materialQty"
        />
        <el-table-column
          label="备注"
          :width="120"
          show-overflow-tooltip
          prop="remark"
        />
      </el-table>
    </el-card>
    <AuditForm
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
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
      label-width="80px"
    >
      <el-form-item label="审核意见" prop="comment1">
        <el-input
          v-model.trim="auditData.comment1"
          type="textarea"
          rows="2"
          show-word-limit
          :maxlength="255"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ showType != "read" ? "取消" : "关闭" }}
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
        v-if="false && showType == 'audit'"
        type="success"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
:deep(.el-card__header) {
  padding: 10px;
}

:deep(.el-form-item) {
  &:nth-last-of-type(1) {
    margin-right: 0;
  }
}
</style>
