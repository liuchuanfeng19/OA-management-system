<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import {
  deleteReqInvoice,
  getReqInvoiceList,
  getReqInvoiceProjectList,
  UpdateCollected
} from "@/api/reqInvoice";
import { emitter } from "@/utils/mitt";
import { exportExcel } from "@/api/exportAll";
import { TableProBar } from "@/components/ReTable";
import FormDialog from "./components/FormDialog.vue";
import DialogPrint from "./components/DialogPrint.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { getInvoiceCompanyNVList } from "@/api/invoiceCompany";
import { tableButtons, operationButtons, columns } from "./constant";
import { TableColumOperation } from "@/components/TableColumOperation";
import { TableColumAudit } from "@/components/TableColumAudit";
import { formatAuditData } from "@/utils/index";
import ReadDialog from "@/components/ReadDialog";

defineOptions({
  name: "SaleInvoice"
});
const route = useRoute();
const title = route.meta.title as string;

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  projectId: "",
  projectFullName: "",
  invoiceCompanyId: "",
  invoiceAmount: "",
  startInvoiceTime: "",
  endInvoiceTime: "",
  startInvoiceAmount: "",
  endInvoiceAmount: ""
});

const date = ref(); //开票日期
const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const projectList = ref([]); // 项目列表数据
const companyList = ref([]); // 开票单位列表数据
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const readDialogRef = ref(null); // 表单对话框组件实例
const dialogFormRef = ref(null); // 表单对话框组件实例
const dialogPrintRef = ref(null); // 表单对话框组件实例
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例

watch(
  () => queryForm.projectId,
  newVal => {
    queryForm.invoiceCompanyId = "";
    if (newVal) {
      getCompanyList(newVal);
      const project = projectList.value.find(item => item.projectId == newVal);
      queryForm.projectFullName = project.projectFullName;
    } else {
      queryForm.projectFullName = "";
      companyList.value = [];
    }
  }
);
//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  if (date.value != null && date.value.length > 0) {
    queryForm.startInvoiceTime = date.value[0];
    queryForm.endInvoiceTime = date.value[1];
  } else {
    queryForm.startInvoiceTime = "";
    queryForm.endInvoiceTime = "";
  }
  getReqInvoiceList(queryForm)
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
        //收款
        item.disabled["handleCollect"] = !item.canCollect;
        item.title["handlehandleCollectAudit"] = !item.canCollect
          ? "当前记录不可操作"
          : "";
        return item;
      });
      console.log("tableData", tableData.value);
      totalPage.value = data.totalCount;
      requestLoading.value = false;
    })
    .catch(() => {
      requestLoading.value = false;
      tableData.value = [];
    });
}

// 获取项目列表数据
function getProjectList() {
  getReqInvoiceProjectList()
    .then(({ data }) => {
      projectList.value = data || [];
    })
    .catch(() => {
      projectList.value = [];
    });
}

// 获取开票单位列表数据
function getCompanyList(projectId: string) {
  getInvoiceCompanyNVList({ projectId })
    .then(({ data }) => {
      companyList.value = data || [];
    })
    .catch(() => {
      companyList.value = [];
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
  date.value = [];
  onSearch();
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
      readDialogRef.value.show(row, columns);
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
    case "handleCollect":
      handleCollect(row);
      break;
    case "handlePrint":
      handlePrint(row);
      break;
  }
}

//新增操作
const handleAdd = () => {
  dialogFormRef.value.show(null, "apply");
};

// 收款
function handleCollect(row) {
  ElMessageBox.confirm("确定已收款?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await UpdateCollected({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
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
      const { code, message } = await deleteReqInvoice({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}
// 打印
function handlePrint(row) {
  dialogPrintRef.value.show(row);
}
//审核操作
const handleAudit = row => {
  dialogFormRef.value.show(row, "audit");
};

//导出
function handleExport() {
  exportExcel("/api/ReqInvoice/Export?", title, queryForm);
}

//导出单条
function handleExportRow(row) {
  exportExcel("/api/ReqInvoice/ExportOne?", "发票" + row.id, { id: row.id });
}

// 表格行选中回调resetForm
function handleSelectionChange(_val) {}

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
  getProjectList();
  setTableHeight();
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
      label-width="96px"
    >
      <!-- <el-form-item
        v-show="queryItemMaxNum >= 1 || !queryFold"
        label="项目名称"
        prop="projectId"
      >
        <el-select
          v-model="queryForm.projectId"
          placeholder="请选择"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="item in projectList"
            :key="item.projectId"
            :label="item.projectFullName"
            :value="item.projectId"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 2 || !queryFold"
        label="开票单位"
        prop="invoiceCompanyId"
      >
        <el-select
          v-model="queryForm.invoiceCompanyId"
          placeholder="请选择"
          filterable
          :no-data-text="
            queryForm.projectFullName == '' ? '请先选择项目' : '未获取到数据'
          "
          no-match-text="未匹配到数据"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in companyList"
            :key="item.value"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item
        v-show="queryItemMaxNum >= 1 || !queryFold"
        label="开票金额大于"
        prop="startInvoiceAmount"
      >
        <el-input
          v-model="queryForm.startInvoiceAmount"
          type="number"
          clearable
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 2 || !queryFold"
        label="开票金额小于"
        prop="endInvoiceAmount"
      >
        <el-input
          v-model="queryForm.endInvoiceAmount"
          type="number"
          clearable
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 3 || !queryFold"
        label="开票日期"
        prop="date"
      >
        <el-date-picker
          v-model="date"
          type="daterange"
          style="width: 220px !important"
          :editable="false"
          :clearable="true"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD 00:00:00"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="截止日期"
        />
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
          :data="tableData"
          highlight-current-row
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
          <el-table-column
            label="项目名称"
            align="left"
            prop="projectFullName"
            min-width="300"
            show-overflow-tooltip
          />
          <el-table-column
            v-if="false"
            label="项目立项简称"
            align="left"
            prop="projectShortName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            prop="reqCode"
            label="申请单编号"
            width="160"
            align="center"
          />
          <el-table-column
            prop="deptName"
            label="经办部门"
            width="100"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            prop="staffName"
            label="业务经办人"
            width="100"
            align="center"
          />
          <el-table-column
            label="开票单位"
            align="left"
            prop="invoiceCompanyName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="开票金额"
            width="100"
            align="right"
            prop="invoiceAmount"
          />
          <el-table-column
            label="开票金额大写"
            min-width="200"
            show-overflow-tooltip
            align="right"
            prop="invoiceAmountCHN"
          />
          <el-table-column
            label="开票日期"
            align="center"
            prop="applyTime"
            width="120"
            :formatter="
              ({ applyTime }) => {
                return applyTime != '1900-01-01 00:00:00' && applyTime != null
                  ? dayjs(applyTime).format('YYYY-MM-DD')
                  : '-';
              }
            "
          />
          <el-table-column
            label="开票申请单"
            align="center"
            prop="file1"
            min-width="120"
          >
            <template #default="{ row }">
              <div>
                <el-button
                  link
                  type="primary"
                  :size="size"
                  @click="handleExportRow(row)"
                  >下载</el-button
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="收款状态"
            align="center"
            prop="isCollect"
            width="160"
          >
            <template #default="{ row }">
              <el-tag :type="row.isCollect ? 'danger' : 'info'">
                {{ row.isCollect ? "已收款" : "未收款" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="收款日期"
            align="center"
            prop="collectTime"
            width="120"
            :formatter="
              ({ collectTime }) => {
                return collectTime != '1900-01-01 00:00:00' &&
                  collectTime != null
                  ? dayjs(collectTime).format('YYYY-MM-DD')
                  : '-';
              }
            "
          />
          <el-table-column
            label="备注"
            align="left"
            prop="invoiceRemark"
            show-overflow-tooltip
            width="160"
          />
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
      :projectList="projectList"
      @search="onSearch"
    />
    <DialogPrint ref="dialogPrintRef" @search="onSearch" />
    <ReadDialog ref="readDialogRef" :title="title" :width="936" :column="3" />
  </div>
</template>
