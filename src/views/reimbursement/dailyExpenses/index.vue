<script setup lang="ts">
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";

import {
  getDailyExpenseList,
  deleteDailyExpense,
  getInvoiceCategories,
  getExpenseCategories
} from "@/api/dailyExpense";
import { emitter } from "@/utils/mitt";
import { exportExcel } from "@/api/exportAll";
// import { getStaffListByDeptCode } from "@/api/staff";
import { getStaffListByDeptId } from "@/api/staff";
import { TableProBar } from "@/components/ReTable";
import FormDialog from "./components/FormDialog.vue";
import { PreviewButton } from "@/components/PreviewButton";
import { tableButtons, operationButtons, columns } from "./constant";
import { DownloadButton } from "@/components/DownloadButton";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { userProjectStoreHook } from "@/store/modules/project";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { TableColumOperation } from "@/components/TableColumOperation";
import { TableColumAudit } from "@/components/TableColumAudit";
import { formatAuditData } from "@/utils/index";

defineOptions({
  name: "DailyExpenses"
});
const route = useRoute();

const title = route.meta.title as string;

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
  staffName: ""
});
const totalPage = ref(0); // 数据总页数
const cascaderRef = ref();
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const staffOptions = ref([]); //职工选项
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
  getDailyExpenseList(queryForm)
    .then(({ data }) => {
      const _data = data.data || [];
      tableData.value = _data.map(item => {
        //格式化审核信息
        formatAuditData(item);

        item.disabled = {};
        item.title = {};
        //编辑
        item.disabled["handleEdit"] = !item.canEdit;
        item.title["handleEdit"] = !item.canEdit ? "当前记录不可编辑" : "";
        //删除
        item.disabled["handleDelete"] = !item.canDel;
        item.title["handleDelete"] = !item.canDel ? "当前记录不可删除" : "";
        //审核
        item.disabled["handleAudit"] = !item.canApprove;
        item.title["handleAudit"] = !item.canApprove ? "当前记录不可审核" : "";
        //导出
        item.disabled["handleExportRow"] = item.applyStatus != 2;
        item.title["handleExportRow"] =
          item.applyStatus != 2 ? "当前记录不可导出" : "";
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

// 获取发票类别列表数据
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
//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
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
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleAudit":
      handleAudit(row);
      break;
    case "handleExportRow":
      handleExportRow(row);
      break;
  }
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

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteDailyExpense({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//导出操作
const handleExportRow = ({ id }) => {
  const fileName = "日常费用报销";
  exportExcel("/api/DailyExpense/ExportBill?", fileName, { id });
};

//审核操作
const handleAudit = row => {
  console.log("audit");
  dialogFormRef.value.show(row, "audit");
};

//导出
function handleExport() {
  const fileName = "日常费用报销";
  exportExcel("/api/DailyExpense/Export?", fileName, queryForm);
}

// 表格行选中回调resetForm
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

const handleProjectChange = val => {
  if (val) {
    const project = winBidProjectNVList.value.find(item => item.value == val);
    queryForm.projName = project.name;
  } else {
    queryForm.projName = "";
  }
};

const handleCompanyChange = val => {
  if (val) {
    const company = rootDepartment.value.find(item => item.id == val);
    queryForm.belongCompanyName = company.fullName;
  } else {
    queryForm.belongCompanyName = "";
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

emitter.on("onAuditStatusEmitter", menuName => {
  if (menuName.find(item => item == route.name)) {
    onSearch();
  }
});
</script>

<template>
  <div class="main">
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryForm"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      label-width="68px"
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
        v-show="queryItemMaxNum >= 6 || !queryFold"
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
        v-show="queryItemMaxNum >= 7 || !queryFold"
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
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-for="(item, index) in tableButtons"
          :key="index"
          :type="item.buttonType"
          :icon="useRenderIcon(item.buttonIcon)"
          @click="handleOperation(item.buttonClick)"
        >
          {{ item.buttonName }}
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          border
          :size="size"
          :height="tableHeight"
          highlight-current-row
          :data="tableData"
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
          <el-table-column label="发票" align="center" width="100">
            <template #default="{ row }">
              <div
                v-if="row.invoiceAttachList"
                class="flex flex-wrap items-center justify-center"
              >
                <el-popover
                  placement="bottom"
                  :width="874"
                  trigger="click"
                  title="发票明细"
                >
                  <template #reference>
                    <el-button type="primary" link :size="size">明细</el-button>
                  </template>
                  <el-table :data="row.invoiceAttachList" border :size="size">
                    <el-table-column
                      width="100"
                      prop="invoiceCategory"
                      label="发票类别"
                      align="center"
                    />
                    <el-table-column
                      width="100"
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
                    <el-table-column
                      prop="name"
                      label="文件名"
                      min-width="200"
                      show-overflow-tooltip
                    >
                      <template #default="{ row }">
                        {{
                          row.filePath.substring(
                            row.filePath.lastIndexOf("/") + 1
                          )
                        }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="amount"
                      label="金额（元）"
                      width="100"
                      align="right"
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

          <TableColumAudit v-if="tableData" :tableData="tableData" />
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
