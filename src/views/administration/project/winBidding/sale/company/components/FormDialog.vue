<script setup lang="ts">
import _ from "lodash";
import {
  createInvoiceCompany,
  updateInvoiceCompany,
  getInvoiceCompany
} from "@/api/invoiceCompany";
import { isPhone } from "@pureadmin/utils";
import { ref, computed, type PropType } from "vue";
import { ElMessage, type FormInstance } from "element-plus";

import { InvoiceCategory, Project } from "../data";
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "", //项目Id
  projectFullName: "", //项目名称
  projectShortName: "", //项目立项简称
  companyName: "", //单位名称
  invoiceType: "", //发票种类
  taxRate: "", //税率
  taxNo: "", //税号
  planCollectTime: "", //预计收款日期
  telephone: "", //电话
  address: "", //地址
  bank: "", //开户行
  bankAccount: "", //帐号
  sellContractCode: "", //合同号
  financeProjectName: "" //财务立项
};

// 表单校验规则
const fromRules = {
  projectId: [{ required: true, message: "请选择项目", trigger: "blur" }],
  companyName: [{ required: true, message: "请输入单位名称", trigger: "blur" }],
  planCollectTime: [
    { required: true, message: "请选择预计收款日期", trigger: "change" }
  ],
  taxRate: [{ required: true, message: "请输入税率", trigger: "blur" }],
  taxNo: [{ required: true, message: "请输入税号", trigger: "blur" }],
  telephone: [
    {
      message: "电话格式不正确",
      validator: (rule, value, callback) => {
        if (value != "") {
          if (!isPhone(value)) {
            callback(new Error("电话格式不正确"));
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

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

const props = defineProps({
  invoiceCategoryList: {
    type: Array as PropType<Array<InvoiceCategory>>,
    default: () => []
  },
  taxRateList: {
    type: [],
    default: () => []
  },
  projectList: {
    type: Array as PropType<Array<Project>>,
    default: () => []
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const showType = ref("add");
const formLoading = ref(false);
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加开票单位"
    : showType.value == "edit"
      ? "编辑开票单位"
      : showType.value == "read"
        ? "查看开票单位"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    getDetail(_formData.id);
  } else {
    formData.value.invoiceType = props.invoiceCategoryList[0].value;
    formData.value.taxRate = props.taxRateList[0].value;
  }
};
defineExpose({ show });

// 根据Id获取销售列表详情
const getDetail = async id => {
  formLoading.value = true;
  const { data = {} } = await getInvoiceCompany({
    id
  });
  formData.value = data || {};
  formLoading.value = false;
};

// 项目名称改变事件
function handleProject(val) {
  const project = props.projectList.find(item => item.projectId == val);
  formData.value.projectFullName = project.projectFullName;
  formData.value.projectShortName = project.projectShortName;
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formLoading.value = true;
  formEl.validate(valid => {
    if (valid) {
      if (showType.value == "add") {
        createInvoiceCompany(formData.value)
          .then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              dialogVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          })
          .finally(() => {
            formLoading.value = false;
          });
      } else if (showType.value == "edit") {
        updateInvoiceCompany(formData.value)
          .then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              dialogVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          })
          .finally(() => {
            formLoading.value = false;
          });
      }
    } else {
      formLoading.value = false;
    }
  });
}, 300);

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
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
    :width="652"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="106px"
    >
      <el-row :gutter="40">
        <el-col :span="24" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              :disabled="showType != 'add'"
              :placeholder="showType != 'add' ? '' : '请选择'"
              clearable
              filterable
              :style="{ width: '100%' }"
              @change="handleProject"
            >
              <el-option
                v-for="item in props.projectList"
                :key="item.projectId"
                :label="item.projectFullName"
                :value="item.projectId"
                :disabled="item.isBind"
                :title="item.isBind ? '该项目已添加开票单位' : ''"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="单位名称" prop="companyName">
            <el-input
              v-model.trim="formData.companyName"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="地址" prop="address">
            <el-input
              v-model.trim="formData.address"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="开户行" prop="bank">
            <el-input
              v-model.trim="formData.bank"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="发票种类" prop="invoiceType">
            <el-select
              v-model="formData.invoiceType"
              :disabled="showType == 'read'"
              style="width: 100%"
            >
              <el-option
                v-for="item in props.invoiceCategoryList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="税率" prop="taxRate">
            <el-select
              v-model="formData.taxRate"
              :disabled="showType == 'read'"
              style="width: 100%"
            >
              <el-option
                v-for="item in props.taxRateList"
                :key="item.value"
                :label="item.value"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="税号" prop="taxNo">
            <el-input
              v-model.trim="formData.taxNo"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="预计收款日期" prop="planCollectTime">
            <el-date-picker
              v-model="formData.planCollectTime"
              :disabled="showType == 'read'"
              type="date"
              format="YYYY-MM-DD"
              :editable="false"
              value-format="YYYY-MM-DD"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="电话" prop="telephone">
            <el-input
              v-model.trim="formData.telephone"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="帐号" prop="bankAccount">
            <el-input
              v-model.trim="formData.bankAccount"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同号" prop="sellContractCode">
            <el-input
              v-model.trim="formData.sellContractCode"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="财务立项" prop="financeProjectName">
            <el-input
              v-model.trim="formData.financeProjectName"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'read'"
        type="primary"
        :loading="formLoading"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
