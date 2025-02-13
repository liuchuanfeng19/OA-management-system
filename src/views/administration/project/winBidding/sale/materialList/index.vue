<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";

import {
  getSellContractNV,
  deleteSellContractItemAttach,
  getSellContractItemAttachList
} from "@/api/sellContractItemAttach";
import { useDetail } from "./hooks";
import { exportExcel } from "@/api/exportAll";
import ReadDialog from "@/components/ReadDialog";
import { getWinBidListNV } from "@/api/projectExt";
import { TableProBar } from "@/components/ReTable";
import FormDialog from "./components/FormDialog.vue";
import BindDialog from "./components/BindDialog.vue";
import DetailedDialog from "./components/DetailedDialog.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { tableButtons, operationButtons, columns } from "./constant";
import { TableColumOperation } from "@/components/TableColumOperation";

defineOptions({
  name: "MaterialList"
});
const title = useRoute().meta.title as string;

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  projectId: "",
  projectFullName: "",
  sellContractId: ""
});
const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const projectList = ref([]); // 项目列表数据
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const dialogFormRef = ref(null); // 表单对话框组件实例
const sellContractList = ref([]); // 合同列表数据
const requestLoading = ref(true); // 请求加载状态
const detailedDialogRef = ref(null); // 明细对话框组件实例
const bindDialogRef = ref(null); // 绑定对话框组件实例
const readDialogRef = ref(null); // 表单对话框组件实例
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例

const { toDetail } = useDetail();

watch(
  () => queryForm.projectId,
  newVal => {
    queryForm.sellContractId = "";
    if (newVal) {
      getSellContractList(newVal);
      const project = projectList.value.find(item => item.projectId == newVal);
      queryForm.projectFullName = project.projectFullName;
    } else {
      queryForm.projectFullName = "";
      sellContractList.value = [];
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
  getSellContractItemAttachList(queryForm)
    .then(({ data }) => {
      const _data = data.data || [];
      tableData.value = _data.map(item => {
        item.disabled = {};
        item.title = {};
        // //删除
        // item.disabled["handleDelete"] = item.isWzhtqdMapping;
        // item.title["handleDelete"] = item.isWzhtqdMapping
        //   ? "已绑定不可删除"
        //   : "";
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
  getWinBidListNV(queryForm)
    .then(({ data }) => {
      projectList.value = data || [];
    })
    .catch(() => {
      projectList.value = [];
    });
}

// 获取销售合同NV列表
function getSellContractList(projectId) {
  getSellContractNV({ projectId })
    .then(({ data }) => {
      sellContractList.value = data || [];
    })
    .catch(() => {
      sellContractList.value = [];
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
  onSearch();
};

//新增操作
const handleAdd = () => {
  dialogFormRef.value.show(null, "add");
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
    case "handleTemplate":
      handleTemplate();
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
    case "handleBind":
      handleBind(row);
      break;
    case "handleDetail":
      handleDetail(row);
      break;
  }
}

// 查看表格行明细
function handleDetail(row) {
  // detailedDialogRef.value.show(row);
  toDetail(row);
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
      const { code, message } = await deleteSellContractItemAttach({
        id: row.id
      });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//绑定
const handleBind = row => {
  bindDialogRef.value.show(row, "bind");
};

// 模板下载
function handleTemplate() {
  const fileName = "物资合同清单模板";
  exportExcel("/api/SellContractItem/ExportTemplate", fileName, {});
}

//导出
function handleExport() {
  const fileName = "员工导出";
  exportExcel("/api/Staff/Export?", fileName, queryForm);
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
        label="合同编号"
        prop="sellContractId"
      >
        <el-select
          v-model="queryForm.sellContractId"
          placeholder="请选择"
          filterable
          clearable
          :no-data-text="
            queryForm.projectFullName == '' ? '请先选择项目' : '未获取到数据'
          "
          no-match-text="未匹配到数据"
          style="width: 100%"
        >
          <!-- <el-option label="全部" value="" /> -->
          <el-option
            v-for="item in sellContractList"
            :key="item.sellContractId"
            :label="item.sellContractCode"
            :value="item.sellContractId"
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
              :fixed="column.fixed"
              :label="column.label"
              :prop="column.prop"
              :show-overflow-tooltip="column.showOverflowTooltip"
              :min-width="column.width"
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
    <DetailedDialog ref="detailedDialogRef" />
    <BindDialog ref="bindDialogRef" @search="onSearch" />
    <ReadDialog ref="readDialogRef" :title="title" :width="370" :column="1" />
  </div>
</template>
