<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance } from "element-plus";

import { getSellContractNV } from "@/api/sellContractItemAttach";
import { exportExcel } from "@/api/exportAll";
import { getWinBidListNV } from "@/api/projectExt";
import { TableProBar } from "@/components/ReTable";
import FormDialog from "./components/FormDialog.vue";
import FormDialog2 from "./components/FormDialog2.vue";
import { getListWithSite } from "@/api/sellContractItem";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { TableColumOperation } from "@/components/TableColumOperation";
import { tableButtons, operationButtons } from "./constant";

defineOptions({
  name: "SaleContractDetail"
});

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  projectId: "",
  sellContractId: ""
});
const projectList = ref([]);
const sellContractList = ref([]);
const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const columnList = ref([]);
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const dialogFormRef = ref(null); // 表单对话框组件实例
const dialogFormRef2 = ref(null); // 表单对话框组件实例
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例

// 获取项目列表数据
function getProjectList() {
  getWinBidListNV(queryForm)
    .then(({ data }) => {
      projectList.value = data || [];
      if (projectList.value.length > 0) {
        const item = projectList.value[0];
        queryForm.projectId = item.projectId;
        getSellContractList(item.projectId);
        onSearch();
      } else {
        requestLoading.value = false;
      }
    })
    .catch(() => {
      projectList.value = [];
      requestLoading.value = false;
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

// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  getListWithSite(queryForm)
    .then(({ data }) => {
      const list = data.data || [];
      tableData.value = list.map(item => {
        item.disabled = {};
        item.title = {};
        //编辑
        // item.disabled["handleEdit"] = !item.canEdit;
        // item.title["handleEdit"] = !item.canEdit ? "当前数据不可编辑" : "";
        //删除
        // item.disabled["handleDelete"] = !item.canDel;
        // item.title["handleDelete"] = !item.canDel ? "当前数据不可删除" : "";
        return item;
      });
      if (tableData.value.length > 0) {
        const item = tableData.value[0];
        columnList.value = item.items || [];
      }
      totalPage.value = data.totalCount;
    })
    .catch(() => {
      tableData.value = [];
    })
    .finally(() => {
      requestLoading.value = false;
    });
}
function handleProjectChange(val) {
  getSellContractList(val);
}
//切换“折叠”与“展开”
function handleFold() {
  queryFold.value = !queryFold.value;
  setTableHeight();
}

// 重置查询条件表单
const handleReset = () => {
  queryFormRef.value.resetFields();
  if (projectList.value.length > 0) {
    const item = projectList.value[0];
    queryForm.projectId = item.projectId;
  }
  onSearch();
};

//操作按钮
function handleOperation(functionName, row?) {
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handleTemplate":
      handleTemplate();
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
  }
}
// 导入模板
function handleTemplate() {
  const fileName = "销售合同明细模板";
  exportExcel("/api/SellContractItem/ExportTemplate", fileName, {});
}
//新增操作
const handleAdd = () => {
  dialogFormRef.value.show("add", projectList.value, queryForm.projectId);
};

// 查看表格行
function handleRead(row) {
  dialogFormRef.value.show(row, "read");
}

// 修改表格行
function handleEdit(row) {
  dialogFormRef2.value.show(row, "edit");
}

// 删除表格行
async function handleDelete(row) {
  console.log(row);
  // const { code, message } = await deleteExample({ id: row.id });
  // if (code==0) {
  //   ElMessage.success(message);
  //   onSearch();
  // }
}

// 表格行选中回调resetForm
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

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
      label-width="90px"
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
          style="width: 100%"
          @change="handleProjectChange"
        >
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
            queryForm.projectId == '' ? '请先选择项目' : '未获取到数据'
          "
          no-match-text="未匹配到数据"
          style="width: 100%"
        >
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
      title="销售合同明细"
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
            prop="seq"
            label="序号"
            align="center"
            width="80"
          />
          <el-table-column
            label="物资名称"
            align="center"
            prop="materialName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="规格型号"
            min-width="180"
            align="center"
            prop="materialSpec"
          />
          <el-table-column
            label="参数要求"
            align="center"
            prop="materialParams"
            min-width="180"
          />
          <el-table-column
            label="单位"
            align="center"
            prop="materialUnit"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="单价"
            align="center"
            prop="materialPrice"
            width="100"
          />
          <el-table-column
            label="数量"
            align="center"
            prop="materialQty"
            width="100"
          />
          <el-table-column
            v-for="(item, idx) in columnList"
            :key="item.id"
            :label="item.siteName"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <span>{{ row.items[idx].materialQty }}</span>
            </template>
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
    <FormDialog ref="dialogFormRef" @search="onSearch" />
    <FormDialog2 ref="dialogFormRef2" @search="onSearch" />
  </div>
</template>
