<script setup lang="ts">
import _ from "lodash";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";
import { ref, computed, watch, nextTick } from "vue";

import {
  createReqInvoice,
  editReqInvoice,
  getReqInvoice,
  getReqInvoiceProjectList,
  auditReqInvoice
} from "@/api/reqInvoice";
import { Project } from "../data";
import { emitter } from "@/utils/mitt";
import AuditSteps from "@/components/AuditSteps";
import AuditForm from "@/components/AuditForm";
import { getUnInvoiceList } from "@/api/sellContractItem";
import { getStaffList as getStaffListByDeptid } from "@/api/staff";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { getSellContractListNVByProjectId } from "@/api/projectAccount";
import { convertCurrency } from "@/utils/validate";

enum AuditResult {
  agree,
  refuse,
  back
}

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  reqCode: "", //申请单号
  deptId: "", //经办部门
  staffId: "", //申请人ID
  projectId: "", //项目Id
  staffName: "",
  mobile: "", //电话
  deptName: "", //部门名称
  applyReason: "",
  projectFullName: "", //项目名称
  projectShortName: "", //项目立项简称
  invoiceCompanyId: "", //开票单位Id
  invoiceCompanyName: "", //开票单位
  sellContractId: "", //销售合同ID
  sellContractCode: "", //销售合同编号
  invoiceAmount: 0, //开票金额
  invoiceAmountCHN: "", //开票金额大写
  invoiceRemark: "", //备注
  isCollect: "",
  isCollectName: "",
  doTemp: false, //暂存：true，提交：false,
  reqInvoiceItems: [
    // {
    //   id: undefined, //
    //   reqInvoiceId: undefined, //开票申请ID
    //   sellContractItemId: undefined, //销售合同明细ID
    //   materialName: "", //物资名称
    //   materialSpec: "", //规格型号
    //   materialUnit: "", //单位
    //   materialQty: 1, //数量
    //   materialPrice: 0, //单价
    //   subTotal: 0 //小计
    // }
  ] //发票明细
};
// 表单校验规则
const fromRules = {
  projectId: [{ required: true, message: "项目名称不能为空" }],
  invoiceAmountCHN: [
    { required: true, message: "开票金额大写不能为空", trigger: "blur" }
  ],
  deptId: [{ required: false, message: "经办部门不能为空" }],
  reqCode: [{ required: false, message: "申请单编号不能为空" }],
  sellContractId: [{ required: false, message: "合同编号不能为空" }],
  staffId: [{ required: false, message: "业务经办人不能为空" }]
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

const props = defineProps({
  projectList: {
    type: Array as PropType<Array<Project>>,
    default: () => []
  }
});
//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);
const { getDepartmentTree } = userDepartmentStoreHook();

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const tableRef = ref();
const staffList = ref([]);
const reviewers = ref([]); //审批人员
const loading = ref(false);
const showType = ref("add");
const projectOptions = ref([]);
const sellContractList = ref([]); //合同列表
const dialogVisible = ref(false);
const activeName = ref("baseInfo");
const sellContractItemList = ref([]); //合同明细列表
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const { departmentTree } = storeToRefs(userDepartmentStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加发票"
    : showType.value == "edit"
      ? "编辑发票"
      : showType.value == "read"
        ? "查看发票"
        : showType.value == "apply"
          ? "物资开票申请"
          : showType.value == "audit"
            ? "物资开票审核"
            : "";
});
const sureDisabled = computed(() => {
  const selectedItem = sellContractItemList.value.find(item => item.isChecked);
  return selectedItem ? false : true;
});

watch(
  () => formData.value.projectId,
  (newVal, oldValue) => {
    if (!newVal) {
      formData.value.projectFullName = "";
      formData.value.projectShortName = "";
      formData.value.invoiceCompanyId = "";
      formData.value.invoiceCompanyName = "";
      return;
    }
    const projet = projectOptions.value.find(item => item.projectId == newVal);
    if (!projet) {
      return;
    }
    formData.value.projectFullName = projet.projectFullName;
    formData.value.projectShortName = projet.projectShortName;
    formData.value.invoiceCompanyId = projet.invoiceCompanyId;
    formData.value.invoiceCompanyName = projet.invoiceCompanyName;
    if (oldValue) {
      formData.value.sellContractId = "";
    }
    if (showType.value == "apply" || showType.value == "edit") {
      getSellContractItem("");
    }
    getSellContractListByProjectId(projet.projectId);
  }
);
watch(
  () => formData.value.sellContractId,
  newVal => {
    if (!newVal) {
      formData.value.sellContractCode = "";
      sellContractItemList.value = [];
      return;
    }
    if (showType.value == "apply" || showType.value == "edit") {
      getSellContractItem(newVal);
    }
    const sellContract = sellContractList.value.find(
      item => item.value == newVal
    );
    if (!sellContract) {
      return;
    }
    formData.value.sellContractCode = sellContract.remark;
  }
);

watch(
  () => formData.value.deptId,
  newVal => {
    if (!newVal) {
      formData.value.deptName = "";
      return;
    }
    getStaffList(newVal);
  }
);

watch(
  sellContractItemList,
  () => {
    if (showType.value != "apply" && showType.value != "edit") {
      return;
    }
    let _invoiceAmount = 0;
    sellContractItemList.value.forEach(element => {
      if (element.isChecked) {
        _invoiceAmount += element.materialQty * element.materialPrice;
      }
    });
    formData.value.invoiceAmount = _invoiceAmount;
  },
  {
    deep: true
  }
);

watch(
  () => formData.value.invoiceAmount,
  newVal => {
    if (newVal) {
      handleBlur();
    }
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  projectOptions.value = props.projectList;
  if (projectOptions.value.length < 1) {
    getProjectList();
  }
  activeName.value = "baseInfo";
  dialogVisible.value = true;
  showType.value = _showType;
  INITIAL_DATA.reqInvoiceItems = [];
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    getDetail(_formData.id);
  }
};
defineExpose({ show });

// 根据Id获取销售列表详情
const getDetail = async id => {
  loading.value = true;
  const { data = {} } = await getReqInvoice({
    id
  });
  formData.value = data || {};
  if (showType.value != "edit") {
    sellContractItemList.value = formData.value.reqInvoiceItems;
  }
  if (data) {
    reviewers.value = data.reviewers || [];
  }
  loading.value = false;
};

// 获取项目列表数据
function getProjectList() {
  getReqInvoiceProjectList()
    .then(({ data }) => {
      projectOptions.value = data || [];
    })
    .catch(() => {
      projectOptions.value = [];
    });
}

//经办人选项接口
async function getStaffList(val) {
  const { data } = await getStaffListByDeptid({
    deptId: val,
    pageIndex: 1,
    pageSize: 9999
  });
  staffList.value = data.data || [];
}

// 获取合同列表数据
function getSellContractListByProjectId(projectId) {
  loading.value = true;
  getSellContractListNVByProjectId({ projectId })
    .then(({ data }) => {
      sellContractList.value = data || [];
    })
    .catch(() => {
      sellContractList.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
}

// 获取明细列表数据
function getSellContractItem(sellContractId) {
  loading.value = true;
  getUnInvoiceList({ projectId: formData.value.projectId, sellContractId })
    .then(({ data }) => {
      const _data = data || [];
      let _sellContractItemList = [];
      let __sellContractItemList = []; //已经添加并添加完了，在未开票明细没有，详情里有的数据
      if (showType.value == "edit") {
        _sellContractItemList = formData.value.reqInvoiceItems;
        if (_data.length > 0) {
          _sellContractItemList.forEach(element => {
            const _element = _data.find(
              item => item.id == element.sellContractItemId
            );
            if (!_element) {
              element.isChecked = false;
              element.needChecked = true;
              element.needEditable = true;
              // element.availableQty = 0;
              __sellContractItemList.push(element);
            }
          });
        } else {
          __sellContractItemList = _sellContractItemList;
        }
        console.log("_sellContractItemList", _sellContractItemList);
        console.log("__sellContractItemList", __sellContractItemList);
      }
      sellContractItemList.value = _data.map(item => {
        if (_sellContractItemList.length > 0) {
          const currentItem = _sellContractItemList.find(
            _item => _item.sellContractItemId == item.id
          );
          console.log("currentItem", currentItem);
          if (currentItem) {
            item.id = currentItem.id;
            item.reqInvoiceId = currentItem.reqInvoiceId;
            item.sellContractItemId = currentItem.sellContractItemId;
            item.materialQty = currentItem.materialQty;
            item.isChecked = false;
            item.needChecked = true;
            item.needEditable = true;
            item.subTotal = currentItem.subTotal;
            console.log("item", item);
          } else {
            item.isChecked = false;
            item.needChecked = false;
            item.needEditable = false;
            item.materialQty = item.availableQty;
            item.subTotal = item.materialPrice * item.availableQty;
          }
        } else {
          item.isChecked = false;
          item.needChecked = false;
          item.needEditable = false;
          item.materialQty = item.availableQty;
          item.subTotal = item.materialPrice * item.availableQty;
        }

        return item;
      });
      //编辑时，如果有明细被申请完了，回显本次已经开过的明细
      // if (showType.value == "edit") {
      //   sellContractItemList.value = sellContractItemList.value.concat(
      //     __sellContractItemList
      //   );
      // }
      console.log("sellContractItemList", sellContractItemList.value);
      const selection = tableRef.value.getSelectionRows();
      console.log("selection", selection);
      nextTick(() => {
        sellContractItemList.value.forEach(element => {
          if (element.needChecked) {
            tableRef.value.toggleRowSelection(element, undefined);
          }
        });
      });
    })
    .catch(() => {
      sellContractItemList.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleStaff(val) {
  const staff = staffList.value.find(item => item.staffId == val);
  formData.value.staffName = staff.staffName;
}

// 表格行选中回调resetForm
function handleSelectionChange(selection) {
  sellContractItemList.value.forEach(item => {
    const finder = selection.find(_item => _item.id == item.id);
    item.isChecked = finder ? true : false;
  });
}

function handleNumberChange(val, row) {
  console.log(val);
  let value = val ? parseInt(val) : 0;
  value = value > row.availableQty ? row.availableQty : value;
  row.materialQty = value;
  row.subTotal = row.materialPrice * value;
}

function handleBlur() {
  formData.value.invoiceAmountCHN = convertCurrency(
    formData.value.invoiceAmount
  );
}

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, doTemp: boolean) => {
    if (!formEl) return;
    formEl.validate(async valid => {
      if (valid) {
        formData.value.doTemp = doTemp;
        if (showType.value == "add" || showType.value == "apply") {
          const params = { ...formData.value };
          params.reqInvoiceItems = sellContractItemList.value
            .filter(item => item.isChecked)
            .map(item => {
              return {
                id: undefined, //
                reqInvoiceId: undefined, //开票申请ID
                sellContractItemId: item.id, //销售合同明细ID
                materialName: item.materialName, //物资名称
                materialSpec: item.materialSpec, //规格型号
                materialUnit: item.materialUnit, //单位
                materialQty: item.materialQty, //数量
                materialPrice: item.materialPrice, //单价
                subTotal: item.subTotal //小计
              };
            });
          loading.value = true;
          const { code, message } = await createReqInvoice(params);
          loading.value = false;
          if (code == 0) {
            ElMessage.success(message);
            dialogVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        } else if (showType.value == "edit") {
          const params = { ...formData.value };
          params.reqInvoiceItems = sellContractItemList.value
            .filter(item => item.isChecked)
            .map(item => {
              return {
                id: item.reqInvoiceId ? item.id : undefined, //
                reqInvoiceId: item.reqInvoiceId, //开票申请ID
                sellContractItemId: item.sellContractItemId
                  ? item.sellContractItemId
                  : item.id, //销售合同明细ID
                materialName: item.materialName, //物资名称
                materialSpec: item.materialSpec, //规格型号
                materialUnit: item.materialUnit, //单位
                materialQty: item.materialQty, //数量
                materialPrice: item.materialPrice, //单价
                subTotal: item.subTotal //小计
              };
            });
          loading.value = true;
          const { code, message } = await editReqInvoice(params);
          loading.value = false;
          if (code == 0) {
            ElMessage.success(message);
            dialogVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
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
    formEl.validate(valid => {
      if (valid) {
        loading.value = true;
        auditReqInvoice({
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
            loading.value = false;
          });
      }
    });
  },
  300
);

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  sellContractItemList.value = [];
  sellContractList.value = [];
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value);
  auditFormRef.value?.resetFields();
  activeName.value = "baseInfo";
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="showType == 'apply' || showType == 'edit' ? 1056 : 936"
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
    <div
      v-show="activeName == 'baseInfo'"
      class="flex flex-col h-608.36px pb-18px"
    >
      <el-form
        ref="ruleFormRef"
        :model="formData"
        :disabled="showType == 'read' || showType == 'audit'"
        :label-width="106"
        :rules="fromRules"
        :inline="false"
      >
        <el-row :gutter="20">
          <el-col :span="8" :offset="0">
            <el-form-item label="项目名称" prop="projectId">
              <el-select
                v-model="formData.projectId"
                :disabled="showType != 'apply'"
                :placeholder="showType != 'apply' ? '' : '请选择'"
                filterable
                :style="{ width: '100%' }"
              >
                <el-option
                  v-for="item in projectOptions"
                  :key="item.projectId"
                  :label="item.projectFullName"
                  :value="item.projectId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="false" :span="8" :offset="0">
            <el-form-item label="项目立项简称" prop="projectShortName">
              <el-input
                v-model="formData.projectShortName"
                readonly
                :disabled="showType != 'apply'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="0">
            <el-form-item label="开票单位">
              <el-input
                v-model="formData.invoiceCompanyName"
                readonly
                :disabled="showType != 'apply'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="0">
            <el-form-item
              label="合同编号"
              prop="sellContractId"
              :disabled="showType != 'apply'"
            >
              <el-select
                v-model="formData.sellContractId"
                :placeholder="showType != 'apply' ? '' : '请选择'"
                filterable
              >
                <el-option
                  v-for="item in sellContractList"
                  :key="item.value"
                  :label="item.remark"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="0">
            <el-form-item label="申请单编号" prop="reqCode">
              <el-input
                v-model.trim="formData.reqCode"
                :placeholder="showType != 'apply' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="false" :span="8" :offset="0">
            <el-form-item label="经办部门" prop="deptId">
              <el-cascader
                v-model="formData.deptId"
                :options="departmentTree"
                placeholder="请选择"
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
          <el-col v-if="false" :span="8" :offset="0">
            <el-form-item label="业务经办人" prop="staffId">
              <el-select v-model="formData.staffId" clearable filterable>
                <el-option
                  v-for="item in staffList"
                  :key="item.staffId"
                  :label="item.staffName"
                  :value="item.staffId"
                  @change="handleStaff"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="0">
            <el-form-item label="开票金额">
              <el-input
                v-model="formData.invoiceAmount"
                readonly
                @blur="handleBlur"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-form-item label="备注" prop="invoiceRemark">
              <el-input
                v-model="formData.invoiceRemark"
                placeholder="最多255个字"
                clearable
                maxlength="255"
                show-word-limit
                type="textarea"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-table
              ref="tableRef"
              border
              max-height="200px"
              flexible
              table-layout="auto"
              :data="sellContractItemList"
              highlight-current-row
              class="mb-[18px]"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                v-if="showType != 'read' && showType != 'audit'"
                type="selection"
                align="center"
                width="60"
              />
              <el-table-column
                fixed="left"
                type="index"
                label="序号"
                align="center"
                width="60"
              />
              <el-table-column
                label="货物名称"
                align="left"
                fixed="left"
                prop="materialName"
                min-width="200"
                show-overflow-tooltip
              />
              <el-table-column
                label="规格型号"
                align="left"
                prop="materialSpec"
                min-width="200"
                show-overflow-tooltip
              />
              <el-table-column
                label="单位"
                align="center"
                prop="materialUnit"
                width="80"
              />
              <el-table-column
                label="在库数量"
                align="right"
                prop="availableQty"
                width="84"
              />
              <el-table-column
                label="数量"
                align="right"
                :width="showType == 'apply' || showType == 'edit' ? 144 : 84"
              >
                <template #default="{ row }">
                  <!-- <el-input-number
                    v-if="showType != 'read' && showType != 'audit'"
                    v-model="row.materialQty"
                    :disabled="!row.isChecked"
                    :title="!row.isChecked ? '请先选中该行' : ''"
                    :controls="true"
                    :min="1"
                    :max="row.availableQty"
                    controls-position="right"
                    :step="1"
                    :precision="0"
                    step-strictly
                    value-on-clear="min"
                    @change="handleNumberChange($event, row)"
                  /> -->
                  <el-input
                    v-if="showType != 'read' && showType != 'audit'"
                    v-model="row.materialQty"
                    :disabled="!row.isChecked"
                    :title="!row.isChecked ? '请先选中该行' : ''"
                    placeholder=""
                    clearable
                    :step="1"
                    :min="1"
                    :max="row.availableQty"
                    type="number"
                    @change="handleNumberChange($event, row)"
                  />

                  <span v-else>{{ row.materialQty }}</span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="showType != 'read' && showType != 'audit'"
                label="已开票数量"
                align="right"
                prop="invoApprovedQty"
                width="100"
              />
              <el-table-column
                label="单价"
                align="right"
                prop="materialPrice"
                width="80"
              />
              <el-table-column
                label="总价（含税金额）"
                align="right"
                prop="subTotal"
                width="140"
              />
              <template #empty>
                <el-empty description="暂无数据" />
              </template>
            </el-table>
          </el-col>
          <el-col :span="8" :offset="0">
            <el-form-item label="开票金额大写" prop="invoiceAmountCHN">
              <el-input v-model="formData.invoiceAmountCHN" />
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="0">
            <el-form-item label="是否收款" prop="isCollectName">
              <el-input v-model="formData.isCollectName" readonly />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
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
      :label-width="activeName == 'auditInfo' ? '92px' : '106px'"
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
      <el-button @click="dialogVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="false && showType != 'read' && showType != 'audit'"
        :disabled="sureDisabled"
        :title="sureDisabled ? '请勾选需要开票的物资合同清单' : ''"
        :loading="loading"
        type="success"
        @click="submitForm(ruleFormRef, true)"
      >
        暂存
      </el-button>
      <el-button
        v-if="showType != 'read' && showType != 'audit'"
        :disabled="sureDisabled"
        :title="sureDisabled ? '请勾选需要开票的物资合同清单' : ''"
        :loading="loading"
        type="primary"
        @click="submitForm(ruleFormRef, false)"
      >
        提交
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="primary"
        :loading="loading"
        @click="submitAuditForm(auditFormRef, AuditResult.agree)"
        >同意
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="danger"
        :loading="loading"
        @click="submitAuditForm(auditFormRef, AuditResult.refuse)"
        >拒绝
      </el-button>
      <el-button
        v-if="false && showType == 'audit'"
        type="success"
        :loading="loading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >
    </template>
  </el-dialog>
</template>
