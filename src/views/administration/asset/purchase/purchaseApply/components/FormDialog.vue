<script setup lang="ts">
import _ from "lodash";
import { ref, computed, watch } from "vue";
import { TableProBar } from "@/components/ReTable";
import { ElMessage, FormInstance } from "element-plus";

import {
  getBuyAssetsApply,
  BuyAssetsUpdate,
  BuyAssetsCreate,
  BuyAssetsApplyCancel,
  BuyAssetsApplyApprove,
  GetBuyAssetsTypeNV
} from "@/api/buyAssetsApply";
import { emitter } from "@/utils/mitt";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
// import { convertCurrency } from "@/utils/validate";
import { storeToRefs } from "pinia";
import { getStaffList as getStaffListByDeptid } from "@/api/staff";
import { userDepartmentStoreHook } from "@/store/modules/department";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

enum AuditResult {
  agree,
  refuse,
  back
}

const fromRules = {
  ayDeptId: [{ required: true, message: "请选择申请部门", trigger: "change" }],

  ayStaffId: [{ required: true, message: "请选择申请人", trigger: "change" }],
  ayTime: [{ required: true, message: "请选择申请日期", trigger: "change" }],
  ayType: [{ required: true, message: "请选择类型", trigger: "change" }]
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

const COMPANY_MODEL = {
  assetsName: "", //物资名称(设备名称)
  qty: 1, //数量
  assetsSpec: "", //规格型号及技术指标
  assetsUnit: "", //单位
  amount: 0, //金额
  brand: "", //设备品牌
  spec: "",
  deviceType: "",
  box: "",
  board: "",
  memory: "",
  hardDisk: "",
  screen: "",
  keyboard: "",
  mouse: "",
  remark: "" //备注
};

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
  ayStaffId: "", //申请人ID
  ayStaffName: "", //申请人
  ayDeptId: "", //申请部门ID
  ayDeptName: "", //申请部门
  ayTime: "", //申请日期
  ayCount: 1, //共项
  ayType: "", //类型
  ayTypeName: "", //类型名称
  ayAmount: 0, //合计
  ayAmountCHN: "", //合计大写
  finaStaffId: "", //财务经办人ID
  remark: "", //备注
  items: [
    // {
    //   ...COMPANY_MODEL
    // }
  ]
};

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: false
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const staffList = ref([]);
const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const stauts = ref("");
const showType = ref("apply");
const reviewers = ref([]); //审批人员
const formData = ref(null);
const formLoading = ref(false);
const formVisible = ref(false);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const canceFormRef = ref<FormInstance>();
const assetsType = ref([]);
const auditFormRef = ref<FormInstance>();
const { departmentTree } = storeToRefs(userDepartmentStoreHook());
const tableColumnData = ref([]);
const tableData = ref([]);

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
          : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  assetsList();
  activeName.value = "baseInfo";
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.items = [];
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    showType.value = "apply";
  }
};
defineExpose({ show });

// watch(
//   () => formData.value.ayAmount,
//   newVal => {
//     if (newVal) {
//       handleBlur();
//     }
//   }
// );

// watch(
//   formData.value.items,
//   () => {
//     if (showType.value != "apply" && showType.value != "edit") {
//       return;
//     }
//     let _ayAmount = 0;
//     formData.value.items.value.forEach(element => {
//       _ayAmount += element.qty * element.amount;
//     });
//     formData.value.ayAmount = _ayAmount;
//   },
//   {
//     deep: true
//   }
// );

function assetsList() {
  GetBuyAssetsTypeNV()
    .then(({ data }) => {
      assetsType.value = data || [];
    })
    .catch(() => {
      assetsType.value = [];
    });
}

//申请人选项接口
async function getStaffList(val) {
  const { data } = await getStaffListByDeptid({
    deptId: val,
    pageIndex: 1,
    pageSize: 9999
  });
  staffList.value = data.data || [];
}

function handleStaff(val) {
  const staff = staffList.value.find(item => item.staffId == val);
  formData.value.ayStaffName = staff.staffName;
}

// function handleBlur() {
//   formData.value.ayAmountCHN = convertCurrency(formData.value.ayAmount);
// }

function handleAdd() {
  formData.value.items.push({ ...COMPANY_MODEL });
}

function handleDelete(index) {
  formData.value.items.splice(index, 1);
}

watch(
  () => formData.value?.ayDeptId,
  newVal => {
    if (!newVal) {
      formData.value.ayDeptName = "";
      return;
    }
    getStaffList(newVal);
  }
);

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getBuyAssetsApply({ id });
  formData.value = data || {};

  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });
  if (data) {
    reviewers.value = data.reviewers || [];
    tableData.value = data.items || [];
  }
  console.log("tableData.value", tableData.value);

  formLoading.value = false;
}

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, flag: boolean) => {
    if (!formEl) return;
    formEl.validate(async valid => {
      if (valid) {
        let isHave = false;
        formData.value.items.forEach(element => {
          if (element.assetsName) {
            isHave = true;
          }
        });
        if (isHave) {
          if (showType.value == "edit") {
            formData.value.doTemp = flag;
            BuyAssetsUpdate(formData.value).then(({ code, message }) => {
              if (code == 0) {
                ElMessage.success(message);
                formVisible.value = false;
                resetForm(formEl);
                emit("search");
              }
            });
          } else if (showType.value == "apply") {
            formData.value.doTemp = flag;
            BuyAssetsCreate(formData.value).then(({ code, message }) => {
              if (code == 0) {
                ElMessage.success(message);
                formVisible.value = false;
                resetForm(formEl);
                emit("search");
              }
            });
          }
        } else {
          ElMessage.error("请输入采购明细");
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
        BuyAssetsApplyApprove({
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
      const { code, message } = await BuyAssetsApplyCancel({
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
    :width="800"
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
      label-width="90px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="申请部门" prop="ayDeptId">
            <el-cascader
              v-model="formData.ayDeptId"
              :options="departmentTree"
              :disabled="showType == 'read' || showType == 'audit'"
              :placeholder="showType != 'apply' ? '' : '请选择'"
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
          <el-form-item label="申请人" prop="ayStaffId">
            <el-select
              v-model="formData.ayStaffId"
              filterable
              :disabled="showType == 'read' || showType == 'audit'"
              :placeholder="showType != 'apply' ? '' : '请选择'"
            >
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

        <el-col :span="12" :offset="0">
          <el-form-item label="申请日期" prop="ayTime">
            <el-date-picker
              v-model="formData.ayTime"
              :disabled="showType == 'read' || showType == 'audit'"
              :placeholder="showType != 'apply' ? '' : '请选择'"
              :style="{ width: '100%' }"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="类型" prop="ayType">
            <el-select
              v-model="formData.ayType"
              filterable
              :disabled="
                showType == 'read' ||
                showType == 'audit' ||
                formData.applyStatus == 4
              "
              :placeholder="showType != 'apply' ? '' : '请选择'"
            >
              <el-option
                v-for="item in assetsType"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="采购明细">
            <el-card
              shadow="never"
              :body-style="{ padding: '0px', border: 'none' }"
            >
              <template
                v-if="showType == 'apply' || showType == 'edit'"
                #header
              >
                <div class="flex justify-between items-center">
                  <span />
                  <el-button type="primary" plain @click="handleAdd">
                    添加
                  </el-button>
                </div>
              </template>
              <el-table
                highlight-current-row
                :data="formData.items"
                border
                stripe
                height="200"
              >
                <el-table-column
                  label="序号"
                  type="index"
                  width="60"
                  fixed="left"
                  align="center"
                />

                <el-table-column
                  fixed="left"
                  label="物品名称"
                  :width="120"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.assetsName"
                    />
                    <span v-else>{{ row.assetsName }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 2"
                  label="型号/参数"
                  :width="120"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.assetsSpec"
                    />
                    <span v-else>{{ row.assetsSpec }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 2"
                  label="数量"
                  :width="80"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.qty"
                      type="number"
                      @input="
                        val => {
                          row.qty = val == '' ? 0 : Math.abs(parseFloat(val));
                        }
                      "
                    />
                    <span v-else>{{ row.qty }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 2"
                  label="单位"
                  :width="80"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.assetsUnit"
                    />
                    <span v-else>{{ row.assetsUnit }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 2"
                  label="金额"
                  :width="90"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.amount"
                      type="number"
                      @input="
                        val => {
                          row.amount = val == '' ? 0 : Math.abs(parseInt(val));
                        }
                      "
                    />
                    <span v-else>{{ row.amount }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 1"
                  label="设备品牌"
                  :width="100"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.brand"
                    />
                    <span v-else>{{ row.brand }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 1"
                  label="型号"
                  :width="100"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.spec"
                    />
                    <span v-else>{{ row.spec }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 1"
                  label="类型"
                  :width="100"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.deviceType"
                    />
                    <span v-else>{{ row.deviceType }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 1"
                  label="机箱"
                  :width="100"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.box"
                    />
                    <span v-else>{{ row.box }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 1"
                  label="主板"
                  :width="100"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.board"
                    />
                    <span v-else>{{ row.board }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 1"
                  label="内存"
                  :width="100"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.memory"
                    />
                    <span v-else>{{ row.memory }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 1"
                  label="硬盘"
                  :width="100"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.hardDisk"
                    />
                    <span v-else>{{ row.hardDisk }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 1"
                  label="显示器"
                  :width="100"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.screen"
                    />
                    <span v-else>{{ row.screen }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 1"
                  label="键盘"
                  :width="100"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.keyboard"
                    />
                    <span v-else>{{ row.keyboard }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="formData.ayType == 1"
                  label="鼠标"
                  :width="100"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.mouse"
                    />
                    <span v-else>{{ row.mouse }}</span>
                  </template>
                </el-table-column>

                <el-table-column
                  label="备注"
                  :width="160"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.remark"
                      type="textarea"
                      rows="1"
                      show-word-limit
                      :maxlength="255"
                    />
                    <span v-else>{{ row.remark }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="showType == 'apply' || showType == 'edit'"
                  label="操作"
                  min-width="100"
                  fixed="right"
                  align="center"
                >
                  <template #default="{ $index }">
                    <el-button type="text" @click="handleDelete($index)">
                      移除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="开票金额大写" prop="ayAmountCHN">
            <el-input v-model="formData.ayAmountCHN" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合计" prop="ayAmount">
            <el-input v-model="formData.ayAmount" @blur="handleBlur" readonly />
          </el-form-item>
        </el-col> -->
      </el-row>
    </el-form>
    <el-row
      v-show="activeName == 'baseInfo'"
      v-if="showType == 'audit' || showType == 'read' || showType == 'undo'"
    >
      <el-col :span="24" :offset="0">
        <TableProBar title="采购明细" :dataList="tableData">
          <template #buttons />

          <el-table
            ref="tableRef"
            border
            :height="180"
            highlight-current-row
            :data="tableData"
          >
            <el-table-column
              label="序号"
              type="index"
              width="60"
              fixed="left"
              align="center"
            />

            <el-table-column
              fixed="left"
              label="物品名称"
              :width="120"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.assetsName"
                />
                <span v-else>{{ row.assetsName }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 2"
              label="型号/参数"
              :width="120"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.assetsSpec"
                />
                <span v-else>{{ row.assetsSpec }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 2"
              label="数量"
              :width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.qty"
                  type="number"
                  @input="
                    val => {
                      row.qty = val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                />
                <span v-else>{{ row.qty }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 2"
              label="单位"
              :width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.assetsUnit"
                />
                <span v-else>{{ row.assetsUnit }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 2"
              label="金额"
              :width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.amount"
                  type="number"
                  @input="
                    val => {
                      row.amount = val == '' ? 0 : Math.abs(parseInt(val));
                    }
                  "
                />
                <span v-else>{{ row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 1"
              label="设备品牌"
              :width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.brand"
                />
                <span v-else>{{ row.brand }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 1"
              label="型号"
              :width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.spec"
                />
                <span v-else>{{ row.spec }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 1"
              label="类型"
              :width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.deviceType"
                />
                <span v-else>{{ row.deviceType }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 1"
              label="机箱"
              :width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.box"
                />
                <span v-else>{{ row.box }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 1"
              label="主板"
              :width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.board"
                />
                <span v-else>{{ row.board }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 1"
              label="内存"
              :width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.memory"
                />
                <span v-else>{{ row.memory }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 1"
              label="硬盘"
              :width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.hardDisk"
                />
                <span v-else>{{ row.hardDisk }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 1"
              label="显示器"
              :width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.screen"
                />
                <span v-else>{{ row.screen }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 1"
              label="键盘"
              :width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.keyboard"
                />
                <span v-else>{{ row.keyboard }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="formData.ayType == 1"
              label="鼠标"
              :width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.mouse"
                />
                <span v-else>{{ row.mouse }}</span>
              </template>
            </el-table-column>

            <el-table-column label="备注" :width="160" show-overflow-tooltip>
              <template #default="{ row }">
                <el-input
                  v-if="showType != 'read' && showType != 'audit'"
                  v-model="row.remark"
                  type="textarea"
                  rows="1"
                  show-word-limit
                  :maxlength="255"
                />
                <span v-else>{{ row.remark }}</span>
              </template>
            </el-table-column>
            <template #empty>
              <el-empty description="暂无数据" />
            </template>
          </el-table>
        </TableProBar>
      </el-col>
    </el-row>
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
      :label-width="activeName == 'auditInfo' ? '92px' : '90px'"
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
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
