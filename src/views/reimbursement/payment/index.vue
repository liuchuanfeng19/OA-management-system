<script setup lang="ts">
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { ElMessage, type FormInstance } from "element-plus";
import { ref, reactive, onMounted, nextTick, watch } from "vue";

import {
  getApproveCompletedList,
  updateReimburseStatus,
  getInvoiceCategories,
  getExpenseCategories
} from "@/api/dailyExpense";
import { exportExcel } from "@/api/exportAll";
// import { getStaffListByDeptCode } from "@/api/staff";
import { TableProBar } from "@/components/ReTable";
import FormDialog from "./components/FormDialog.vue";
import { PreviewButton } from "@/components/PreviewButton";
import { tableButtons, operationButtons, columns } from "./constant";
import { DownloadButton } from "@/components/DownloadButton";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { userProjectStoreHook } from "@/store/modules/project";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { TableColumOperation } from "@/components/TableColumOperation";
import { getStaffListByDeptId } from "@/api/staff";

defineOptions({
  name: "Payment"
});

const title = useRoute().meta.title as string;

const { getRootDeptList } = userDepartmentStoreHook();
const { getDepartmentTree } = userDepartmentStoreHook();
const { getProjectWinBidNVList } = userProjectStoreHook();
//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};
// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  belong: 0,
  expenseCategory: "",
  invoiceCategory: "",
  projectId: "",
  projName: "",
  companyId: "",
  belongCompanyName: "",
  deptId: "",
  deptCode: "",
  deptName: "",
  staffId: "",
  isReimbursed: "",
  staffName: ""
});
const totalPage = ref(0); // 数据总页数
const cascaderRef = ref();
const tableData = ref([]); // Table组件显示数据
const tableRef = ref(null);
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const staffOptions = ref([]); //职工选项
const tableSelection = ref([]); // 选中列表
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const dialogFormRef = ref(null); // 表单对话框组件实例
const requestLoading = ref(true); // 请求加载状态
const expenseTypeOption = ref([]); // 费用类别列表数据
const invoiceTypeOptions = ref([]); // 发票类别
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例
const { departmentTree } = storeToRefs(userDepartmentStoreHook());
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
const { winBidProjectNVList } = storeToRefs(userProjectStoreHook());

watch(queryForm, newVal => {
  if (!newVal.projectId) {
    queryForm.projName = "";
  }
  if (!newVal.companyId) {
    queryForm.belongCompanyName = "";
  }
});

watch(
  () => queryForm.deptId,
  newVal => {
    if (!newVal) {
      queryForm.deptName = "";
      queryForm.staffName = "";
      queryForm.staffId = "";
      staffOptions.value = [];
    }
    getStaffList("");
  }
);

// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  getApproveCompletedList(queryForm)
    .then(({ data }) => {
      const _data = data.data || [];
      tableData.value = _data.map(item => {
        item.disabled = {};
        item.title = {};
        //确认打款
        item.disabled["handleConfirm"] = item.isReimbursed;
        item.title["handleConfirm"] = item.isReimbursed ? "当前记录已报销" : "";
        return item;
      });
      console.log("tableData", tableData.value);
      tableData.value = _data.map(item => {
        const reviewers = item.reviewers || [];
        reviewers.forEach((element, index) => {
          item["reviewerName" + index] = element.reviewerName;
          item["approveTime" + index] = element.approveTime;
          item["comment" + index] = element.comment;
          item["hasApproved" + index] = element.hasApproved;
          item["isApproved" + index] = element.isApproved;
          item["isReturnBack" + index] = element.isReturnBack;
        });
        return item;
      });
      totalPage.value = data.totalCount;
    })
    .catch(() => {
      tableData.value = [];
    })
    .finally(() => {
      requestLoading.value = false;
    });
}

// 获取费用类别列表数据
function getExpenseCategoryList() {
  getExpenseCategories()
    .then(({ data }) => {
      expenseTypeOption.value = data || [];
    })
    .catch(() => {
      expenseTypeOption.value = [];
    });
}

// 获取费用类别列表数据
function getInvoiceCategoryList() {
  getInvoiceCategories()
    .then(({ data }) => {
      invoiceTypeOptions.value = data || [];
    })
    .catch(() => {
      invoiceTypeOptions.value = [];
    });
}

function getStaffList(queryString) {
  return new Promise<any[]>(resolve => {
    getStaffListByDeptId({
      deptId: queryForm.deptId,
      staffName: queryString
    })
      .then(({ data }) => {
        staffOptions.value = data || [];
        resolve(data);
      })
      .catch(() => {
        resolve([]);
      });
  });
}

//切换“折叠”与“展开”
function handleFold() {
  queryFold.value = !queryFold.value;
  setTableHeight();
}

// 重置查询条件表单
const handleReset = () => {
  queryFormRef.value.resetFields();
  nextTick(() => {
    onSearch();
  });
};

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handleExport":
      handleExport();
      break;
    case "handleRead":
      handleRead(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleConfirm":
      handleConfirm(row);
      break;
  }
}
//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//新增操作
const handleAdd = () => {
  dialogFormRef.value.show(null, "apply");
};

// 查看表格行
function handleRead(row) {
  dialogFormRef.value.show(row, "read");
}

// 修改表格行
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

//确认打款操作
const handleConfirm = row => {
  console.log("confirm row", row);
  const ids = row ? [row.id] : tableSelection.value.map(item => item.id);
  updateReimburseStatus({ id: ids.join() }).then(({ code, message }) => {
    if (code == 0) {
      ElMessage.success(message);
      onSearch();
    }
  });
};

//导出
function handleExport() {
  const fileName = "费用打款";
  exportExcel("/api/DailyExpense/ExportApproveCompleted?", fileName, queryForm);
}

const handleCompanyChange = val => {
  if (val) {
    const company = rootDepartment.value.find(item => item.id == val);
    queryForm.belongCompanyName = company.fullName;
  } else {
    queryForm.belongCompanyName = "";
  }
};

function handleRowSelect(selection, row) {
  // console.log("handleRowSelect selection", selection);
  // console.log("handleRowSelect row", row);
  if (row.isReimbursed) {
    ElMessage.info("该数据已报销");
    nextTick(() => {
      tableRef.value!.toggleRowSelection(row, undefined);
    });
  }
}

function handleAllSelect(selection) {
  // console.log("handleAllSelect selection", selection);
  if (selection) {
    selection.forEach(element => {
      if (element.isReimbursed) {
        nextTick(() => {
          tableRef.value!.toggleRowSelection(element, undefined);
        });
      }
    });
  }
}

// 表格行选中回调resetForm
function handleSelectionChange(selection) {
  tableSelection.value = selection;
}

const handleProjectChange = val => {
  if (val) {
    const project = winBidProjectNVList.value.find(item => item.value == val);
    queryForm.projName = project.name;
  } else {
    queryForm.projName = "";
  }
};

function handleDeptChange() {
  queryForm.staffName = "";
  queryForm.staffId = "";
  const node = cascaderRef.value.getCheckedNodes();
  if (node) {
    queryForm.deptName = node[0]?.label;
    queryForm.deptId = node[0]?.data?.id;
  } else {
    queryForm.deptName = "";
    queryForm.deptId = "";
  }
}

const handleOperatorSelect = val => {
  if (val) {
    const staff = staffOptions.value.find(item => item.value == val);
    queryForm.staffName = staff.name;
  } else {
    queryForm.staffName = "";
  }
};

// 设置表格组件高度
const setTableHeight = () => {
  nextTick(() => {
    queryItemMaxNum.value =
      (queryFormRef.value.$el.clientWidth -
        8 -
        32 -
        queryFormRef.value.$el.children[
          queryFormRef.value.$el.children.length - 1
        ].clientWidth) /
      (queryFormRef.value.$el.children[0].clientWidth + 32);
    queryItemMaxNum.value = Math.floor(queryItemMaxNum.value);
    tableHeight.value =
      window.innerHeight - queryFormRef.value.$el.clientHeight - 230;
  });
};

// mounted周期函数
onMounted(async () => {
  onSearch();
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  if (winBidProjectNVList.value.length < 1) {
    getProjectWinBidNVList();
  }
  getStaffList("");
  getInvoiceCategoryList();
  getExpenseCategoryList();
  setTableHeight();
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
});

// 窗口尺寸改变事件回调
window.onresize = function () {
  nextTick(() => {
    setTableHeight();
  });
};
</script>

<template>
  <div class="main">
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryForm"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      label-width="82px"
    >
      <el-form-item
        v-show="queryItemMaxNum >= 1 || !queryFold"
        label="费用类别"
        prop="expenseCategory"
      >
        <el-select
          v-model="queryForm.expenseCategory"
          placeholder="全部"
          clearable
        >
          <el-option :key="0" label="全部" value="" />
          <el-option
            v-for="item in expenseTypeOption"
            :key="item.value"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 2 || !queryFold"
        label="所属部门"
        prop="deptId"
      >
        <el-cascader
          ref="cascaderRef"
          v-model="queryForm.deptId"
          :options="departmentTree"
          placeholder="请选择"
          clearable
          class="w-100/100"
          :props="selProps"
          :show-all-levels="false"
          @change="handleDeptChange"
        >
          <template #default="{ data }">
            <span>{{ data.fullName }}</span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 3 || !queryFold"
        label="经办人"
        prop="staffId"
      >
        <el-select
          v-model.trim="queryForm.staffId"
          :multiple="false"
          filterable
          clearable
          placeholder="请输入"
          @change="handleOperatorSelect"
        >
          <el-option
            v-for="item in staffOptions"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 4 || !queryFold"
        label="报销归属"
        prop="belong"
      >
        <el-select v-model="queryForm.belong" placeholder="全部">
          <el-option label="全部" :value="0" />
          <el-option label="项目" :value="1" />
          <el-option label="非项目" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 5 || !queryFold"
        label="是否已报销"
        prop="isReimbursed"
      >
        <el-select
          v-model.trim="queryForm.isReimbursed"
          :multiple="false"
          clearable
          placeholder="请选择"
        >
          <el-option label="全部" value="" />
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 6 || !queryFold"
        label="项目名称"
        prop="projectId"
      >
        <el-select
          v-model.trim="queryForm.projectId"
          :multiple="false"
          filterable
          clearable
          placeholder="请输入"
          @change="handleProjectChange"
        >
          <el-option
            v-for="item in winBidProjectNVList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 7 || !queryFold"
        label="公司名称"
        prop="companyId"
      >
        <el-select
          v-model.trim="queryForm.companyId"
          :multiple="false"
          filterable
          clearable
          placeholder="请输入"
          @change="handleCompanyChange"
        >
          <el-option
            v-for="item in rootDepartment"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="false"
        v-show="queryItemMaxNum >= 8 || !queryFold"
        label="发票类别"
        prop="invoiceCategory"
      >
        <el-select
          v-model="queryForm.invoiceCategory"
          placeholder="全部"
          clearable
        >
          <el-option :key="0" label="全部" :value="0" />
          <el-option
            v-for="item in invoiceTypeOptions"
            :key="item.value"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('search')"
          :loading="requestLoading"
          @click="onSearch"
        >
          查询
        </el-button>
        <el-button :icon="useRenderIcon('refresh')" @click="handleReset">
          重置
        </el-button>
        <el-button type="text" @click="handleFold">
          <span v-show="queryFold">展开</span>
          <span v-show="!queryFold">折叠</span>
          <IconifyIconOffline :icon="!queryFold ? 'arrow-up' : 'arrow-down'" />
        </el-button>
      </el-form-item>
    </el-form>
    <TableProBar
      :title="title"
      :loading="requestLoading"
      :dataList="tableData"
      :checkList="['勾选列']"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-for="(item, index) in tableButtons"
          :key="index"
          :disabled="
            item.buttonClick == 'handleConfirm' && tableSelection.length < 1
              ? true
              : false
          "
          :title="
            item.buttonClick == 'handleConfirm' && tableSelection.length < 1
              ? '至少勾选一行'
              : ''
          "
          :type="item.buttonType"
          :icon="useRenderIcon(item.buttonIcon)"
          @click="handleOperation(item.buttonClick)"
        >
          {{ item.buttonName }}
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          ref="tableRef"
          border
          :size="size"
          row-key="id"
          :height="tableHeight"
          highlight-current-row
          :data="tableData"
          @select="handleRowSelect"
          @select-all="handleAllSelect"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            align="center"
            width="60"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            :index="getIndex"
            label="序号"
            align="center"
            width="60"
          />
          <template v-for="column in columns" :key="column.prop">
            <el-table-column
              v-if="column.read"
              :label="column.label"
              :prop="column.prop"
              :align="column.align"
              :min-width="column.width"
              :fixed="column.fixed"
              :show-overflow-tooltip="column.showOverflowTooltip"
            >
              <template #default="{ row }">
                <el-text
                  type="primary"
                  class="cursor-pointer"
                  @click="handleOperation('handleRead', row)"
                >
                  {{ row[column.prop] }}
                </el-text>
              </template>
            </el-table-column>
            <el-table-column
              v-else
              :align="column.align"
              :label="column.label"
              :prop="column.prop"
              :show-overflow-tooltip="column.showOverflowTooltip"
              :min-width="column.width"
              :fixed="column.fixed"
              :formatter="column.formatter"
            >
              <template #default="{ row }">
                <template v-if="column.tableColumnSlot">
                  <component :is="column.tableColumnSlot(row)" />
                </template>
                <template v-else-if="column.formatter">
                  {{ column.formatter(row) }}
                </template>
                <template v-else>
                  {{ row[column.prop] }}
                </template>
              </template>
            </el-table-column>
          </template>
          <el-table-column
            v-if="false"
            label="发票类别"
            align="left"
            prop="invoiceCategory"
            min-width="120"
          />

          <el-table-column label="发票" align="center" width="100">
            <template #default="{ row }">
              <div
                v-if="row.invoiceAttachList"
                class="flex flex-wrap items-center justify-center"
              >
                <el-popover
                  placement="bottom"
                  :width="674"
                  trigger="click"
                  title="发票明细"
                >
                  <template #reference>
                    <el-button type="primary" link :size="size">明细</el-button>
                  </template>
                  <el-table :data="row.invoiceAttachList" border :size="size">
                    <el-table-column
                      width="150"
                      prop="invoiceCategory"
                      label="发票类别"
                      align="center"
                    />
                    <el-table-column
                      width="150"
                      prop="invoiceNum"
                      label="票号"
                      align="center"
                    />
                    <el-table-column
                      width="200"
                      prop="invoiceCode"
                      label="发票识别码"
                      align="center"
                    />
                    <el-table-column width="150" label="操作" align="center">
                      <template #default="scope">
                        <PreviewButton
                          :srcList="[scope.row.filePath]"
                          :size="size"
                        />
                        <DownloadButton
                          :srcList="[scope.row.filePath]"
                          :size="size"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                </el-popover>
                <!-- <PreviewButton
                  :srcList="row.invoiceAttachList.map(item => item.filePath)"
                  :size="size"
                />
                <DownloadButton
                  :srcList="row.invoiceAttachList.map(item => item.filePath)"
                  :size="size"
                /> -->
              </div>
            </template>
          </el-table-column>
          <el-table-column label="是否已报销" align="center" :width="120">
            <template #default="{ row }">
              <el-tag
                :type="row.isReimbursed ? 'success' : 'warning'"
                :size="size"
              >
                {{ row.isReimbursed ? "是" : "否" }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="部门经理审核">
            <el-table-column label="审核人" align="center" :width="150">
              <template #default="{ row }">
                {{ row.reviewerName0 ? row.reviewerName0 : "-" }}
              </template>
            </el-table-column>
            <el-table-column label="审核状态" align="center" :width="150">
              <template #default="{ row }">
                {{
                  row.hasApproved0
                    ? row.isApproved0
                      ? "通过"
                      : row.isReturnBack0
                        ? "退回"
                        : "拒绝"
                    : "-"
                }}
              </template>
            </el-table-column>
            <el-table-column
              label="审核意见"
              :width="200"
              align="left"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.comment0 ? row.comment0 : "-" }}
              </template>
            </el-table-column>
            <el-table-column label="审核时间" align="center" :width="160">
              <template #default="{ row }">
                {{ row.approveTime0 ? row.approveTime0 : "-" }}
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="财务经理审核">
            <el-table-column label="审核人" align="center" :width="150">
              <template #default="{ row }">
                {{ row.reviewerName1 ? row.reviewerName1 : "-" }}
              </template>
            </el-table-column>
            <el-table-column label="审核状态" align="center" :width="150">
              <template #default="{ row }">
                {{
                  row.hasApproved1
                    ? row.isApproved1
                      ? "通过"
                      : row.isReturnBack1
                        ? "退回"
                        : "拒绝"
                    : "-"
                }}
              </template>
            </el-table-column>
            <el-table-column
              label="审核意见"
              :width="200"
              align="left"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.comment1 ? row.comment1 : "-" }}
              </template>
            </el-table-column>
            <el-table-column label="审核时间" align="center" :width="160">
              <template #default="{ row }">
                {{ row.approveTime1 ? row.approveTime1 : "-" }}
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="副总裁审核">
            <el-table-column label="审核人" align="center" :width="150">
              <template #default="{ row }">
                {{ row.reviewerName2 ? row.reviewerName2 : "-" }}
              </template>
            </el-table-column>
            <el-table-column label="审核状态" align="center" :width="150">
              <template #default="{ row }">
                {{
                  row.hasApproved2
                    ? row.isApproved2
                      ? "通过"
                      : row.isReturnBack2
                        ? "退回"
                        : "拒绝"
                    : "-"
                }}
              </template>
            </el-table-column>
            <el-table-column
              label="审核意见"
              :width="200"
              align="left"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.comment2 ? row.comment2 : "-" }}
              </template>
            </el-table-column>
            <el-table-column label="审核时间" align="center" :width="160">
              <template #default="{ row }">
                {{ row.approveTime2 ? row.approveTime2 : "-" }}
              </template>
            </el-table-column>
          </el-table-column>
          <TableColumOperation
            v-if="operationButtons().length > 0"
            :size="size"
            :operationButtons="operationButtons()"
            @operation="handleOperation"
          />
          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
        <el-pagination
          v-model:page-size="queryForm.pageSize"
          v-model:current-page="queryForm.pageIndex"
          class="flex justify-end mt-4"
          :small="size === 'small' ? true : false"
          :page-sizes="[10, 20, 30, 50, 100, 200]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalPage"
          @size-change="onSearch"
          @current-change="onSearch"
        />
      </template>
    </TableProBar>
    <FormDialog
      ref="dialogFormRef"
      :expensesTypeIptions="expenseTypeOption"
      :invoiceTypeOptions="invoiceTypeOptions"
      :winBidProjectNVList="winBidProjectNVList"
      @search="onSearch"
    />
  </div>
</template>
