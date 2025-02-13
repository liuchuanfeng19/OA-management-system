<script setup lang="ts">
import dayjs from "dayjs";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";

import {
  GetReqOrder,
  CreateReqOrder,
  UpdateReqOrder,
  CancelReqOrder
} from "@/api/reqOrder";
import { columns } from "../constant";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import ReadDescriptions from "@/components/ReadDescriptions";

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
  reqOrderItems: [
    {
      ...COMPANY_MODEL
    }
  ]
};

// 表单校验规则
const fromRules = {
  projectId: [{ required: true, message: "请选择项目", trigger: "blur" }],
  cancelReason: [{ required: true, message: "请输入撤销原因", trigger: "blur" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
// const props = defineProps({
//   projectList: []
// });
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const reviewers = ref([]); //审批人员
const showType = ref("add");
const tableColumnData = ref([]);
const dialogVisible = ref(false);
const activeName = ref("baseInfo");
const formData = ref({ ...INITIAL_DATA });
const columnList = ref([]);
const ruleFormRef = ref<FormInstance>();
const canceFormRef = ref<FormInstance>();

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加下采单"
    : showType.value == "edit"
      ? "编辑下采单"
      : showType.value == "read"
        ? "查看下采单"
        : showType.value == "undo"
          ? "撤回下采单"
          : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
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

// 获取详情
const getDetail = async id => {
  const { data = {} } = await GetReqOrder({
    id
  });
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
};

function formatDatetime(dt) {
  if (dt == null || dt == "") {
    return "-";
  }
  return dayjs(dt).format("YYYY-MM-DD");
}

// function handleProjectChange(val) {
//   const project = props.projectList.find(item => item.value == val);
//   formData.value.projectFullName = project.name;
// }

function handleDelete(index) {
  formData.value.reqOrderItems.splice(index, 1);
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "add") {
        const { code, message } = await CreateReqOrder(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (showType.value == "edit") {
        const { code, message } = await UpdateReqOrder(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      }
    }
  });
};

// 提交撤回表单
const submitFormQuery = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await CancelReqOrder({
        id: formData.value.id,
        cancelReason: formData.value.cancelReason
      });
      if (code == 0) {
        ElMessage.success(message);
        resetForm(formEl);
        dialogVisible.value = false;
        emit("search");
      }
    }
  });
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  activeName.value = "baseInfo";
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value);
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
    <div v-show="activeName == 'baseInfo'">
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
        ref="ruleFormRef"
        :model="formData"
        :rules="fromRules"
        label-width="80px"
      >
        <el-row :gutter="20">
          <el-col :span="16" :offset="0">
            <el-form-item label="项目名称" prop="projectFullName">
              <el-input
                v-model="formData.projectFullName"
                :readonly="showType == 'read'"
                :placeholder="showType == 'read' ? '' : '请选择'"
              />
              <!-- <el-select
              v-model="formData.projectId"
              :disabled="showType == 'read'"
              placeholder="请选择"
              clearable
              filterable
              @change="handleProjectChange"
              style="width: 100%"
            >
              <el-option
                v-for="item in props.projectList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select> -->
            </el-form-item>
          </el-col>
          <!-- <el-col :span="8" :offset="0">
          <el-form-item label="项目负责人" prop="openTime">
            <el-input
              v-model="formData.openAddress"
              :readonly="showType == 'read'"
              placeholder="请输入开标地点"
            />

          </el-form-item>
        </el-col> -->
          <!-- <el-col :span="8" :offset="0">
          <el-form-item label="中标单位" prop="openAddress">
            <el-input
              v-model="formData.openAddress"
              :readonly="showType == 'read'"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col> -->
          <el-col :span="8" :offset="0">
            <el-form-item label="收货人" prop="recvName">
              <el-input v-model="formData.recvName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="16" :offset="0">
            <el-form-item label="收货地址" prop="recvAddress">
              <el-input v-model="formData.recvAddress" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="0">
            <el-form-item label="电话" prop="recvMobile">
              <el-input v-model="formData.recvMobile" readonly />
            </el-form-item>
          </el-col>
          <el-col v-if="showType == 'undo'" :span="24" :offset="0">
            <el-form-item label="撤销原因" prop="cancelReason">
              <el-input v-model="formData.cancelReason" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-card shadow="never" :body-style="{ padding: '0px', border: 'none' }">
        <template #header>
          <div class="flex justify-between items-center">
            <span>设备明细</span>
          </div>
        </template>
        <el-table
          highlight-current-row
          :data="formData.reqOrderItems"
          border
          stripe
          :max-height="280"
        >
          <el-table-column
            label="序号"
            type="index"
            width="60"
            fixed="left"
            align="center"
          />
          <!-- <el-table-column label="设备名称" :width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input
              :readonly="showType == 'read'"
              v-model="row.materialName"
              placeholder="请输入"
            />
          </template>
        </el-table-column>
        <el-table-column label="规格型号" :width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input
              readonly
              v-model="row.materialSpec"
              placeholder="请输入"
            />
          </template>
        </el-table-column>
        <el-table-column label="参数要求" :width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input
              readonly
              v-model="row.materialParams"
              placeholder="请输入"
            />
          </template>
        </el-table-column>
        <el-table-column label="单位" :width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input v-model="row.materialUnit" readonly />
          </template>
        </el-table-column>
        <el-table-column label="数量" :width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input v-model="row.materialQty" readonly placeholder="请输入" />
          </template>
        </el-table-column>

        <el-table-column label="到货日期" :width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-date-picker
              v-model="row.receiveTime"
              :readonly="showType == 'read'"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              type="datetime"
              style="width: 100%"
              placeholder="请选择"
            />
          </template>
        </el-table-column>

        <el-table-column label="备注" :width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input
              v-model="row.remark"
              :readonly="showType == 'read'"
              type="textarea"
              rows="1"
              show-word-limit
              :maxlength="255"
              placeholder="请输入备注"
            />
          </template>
        </el-table-column> -->
          <el-table-column
            label="设备名称"
            width="120"
            align="center"
            fixed="left"
            show-overflow-tooltip
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
                <span>{{
                  formatDatetime(row.siteItems[idx].receiveTime)
                }}</span>
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
            align="center"
            show-overflow-tooltip
            prop="remark"
          />
          <el-table-column
            v-if="showType != 'read'"
            label="操作"
            width="100"
            fixed="right"
            align="center"
          >
            <template #default="{ $index }">
              <el-button type="text" @click="handleDelete($index)">
                删除
              </el-button>
              <el-button type="text" @click="handleDelete($index)">
                编辑
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
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
            v-if="showType == 'undo' || showType == 'read'"
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
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      v-show="activeName == 'auditInfo'"
      :showType="showType"
      :reviewers="reviewers"
    />
    <template #footer>
      <el-button @click="dialogVisible = false">{{
        showType != "read" ? "取消" : "关闭"
      }}</el-button>
      <el-button
        v-if="showType != 'read'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
      <el-button
        v-if="showType == 'undo'"
        type="primary"
        @click="submitFormQuery(canceFormRef)"
        >确定</el-button
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
