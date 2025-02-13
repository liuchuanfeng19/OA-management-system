<script setup lang="ts">
import dayjs from "dayjs";
import { useRoute } from "vue-router";
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";

import router from "@/router";
import { exportExcel } from "@/api/exportAll";
import ReadDialog from "@/components/ReadDialog";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import FormDialog from "./components/FormDialog.vue";
import { GetListNVForApp } from "@/api/projectWinBid";
import DialogForm2 from "./components/DialogForm2.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { TableColumOperation } from "@/components/TableColumOperation";
import { GetMyProjectListNV, importReqCartItem } from "@/api/reqCartItem";
import { DeleteReqCartItem, GetListReqCartItem } from "@/api/reqCartItem";
import { operationButtons, tableButtons, columns, column2 } from "./constant";

defineOptions({
  name: "PickList"
});
const title = useRoute().meta.title as string;

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  projectId: "",
  keyword: ""
});
const spanArr = ref([]); // 合并单元格
const position = ref(0);
const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const tableRef = ref(null);
const columnList = ref([]);
const tableHeight = ref(0); // Table组件高度
const exporting = ref(false); // 导出加载状态
const importing = ref(false); // 请求加载状态
const queryFold = ref(true); // 查询条件折叠状态
const projectList = ref([]); // 项目列表
const readDialogRef = ref(null); // 表单对话框组件实例
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const dialogFormRef = ref(null); // 新增表单对话框组件实例
const dialogFormRef2 = ref(null); // 查看/编辑表单对话框组件实例
const formDialogRef = ref(null); //申请功能对话框组件实例
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例
const multipleSelection = ref([]); //列表选中数据存放
const IdData = ref([]);
const projectWinBidNV = ref([]); //中标项目NV
//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  GetListReqCartItem(queryForm)
    .then(({ data }) => {
      const _data = data.data || [];
      tableData.value = rebuildData(_data);
      if (tableData.value.length > 0) {
        const item = tableData.value[0];
        columnList.value = item.siteItems || [];
      }
      console.log("columnList.value", columnList.value);
      totalPage.value = data.totalCount;
      requestLoading.value = false;
      handleData();
    })
    .catch(() => {
      requestLoading.value = false;
      tableData.value = [];
    });
}

function rebuildData(_data) {
  return _data.map(item => {
    item.disabled = {};
    item.title = {};
    //申请
    item.disabled["handleApply"] = multipleSelection.value.length <= 0;
    item.title["handleApply"] =
      multipleSelection.value.length <= 0 ? "未选择数据" : "";

    //申请
    item.disabled["handlePartsAdd"] =
      item.parentId != "00000000-0000-0000-0000-000000000000";
    item.title["handlePartsAdd"] =
      item.parentId != "00000000-0000-0000-0000-000000000000"
        ? "配件无法继续添加配件"
        : "";

    if (item.childrenList.length > 0) {
      item.childrenList = rebuildData(item.childrenList);
    }
    return item;
  });
}

// 获取项目列表数据
function getProjectList() {
  GetListNVForApp()
    .then(({ data }) => {
      projectList.value = data || [];
    })
    .catch(() => {
      projectList.value = [];
    });
}

//获取中标项目列表NV;
function getProjectWinBidNV() {
  GetMyProjectListNV(queryForm)
    .then(({ data }) => {
      projectWinBidNV.value = data || [];
      console.log("projectWinBidNV.value", projectWinBidNV.value);
      if (projectWinBidNV.value.length > 0) {
        console.log("projectWinBidNV.value[0]", projectWinBidNV.value[0]);
        const item = projectWinBidNV.value[0];
        console.log("item", item);
        queryForm.projectId = item.id;
        console.log("queryForm", queryForm);
        onSearch();
      } else {
        requestLoading.value = false;
      }
    })
    .catch(() => {
      projectWinBidNV.value = [];
      requestLoading.value = false;
    });
  // if (data) {
  //   projectWinBidNV.value = data;
  // }
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handlePartsAdd":
      handlePartsAdd(row);
      break;
    case "handleSelect": //选择采购项
      handleSelect();
      break;
    case "handleAdd": //选择采购项
      handleAdd();
      break;
    case "handleRead":
      readDialogRef.value.show(row, [...columns, ...column2]);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleApply": //申请
      handleApply(row);
      break;
    case "handleTemplate": //申请
      exporting.value = true;
      exportExcel("/api/ReqCartItem/ExportTemplate", "下采单模板", {}).finally(
        () => {
          exporting.value = false;
        }
      );
      break;
  }
}

/**
 * 导入
 * @param options
 */
async function handleImport(options) {
  const data = new FormData();
  data.append("file", options.file);
  importing.value = true;
  await importReqCartItem(data)
    .then(({ code, message }) => {
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .finally(() => {
      importing.value = false;
    });
}

function handleData() {
  spanArr.value = [];
  tableData.value.forEach((item, index) => {
    if (index == 0) {
      spanArr.value.push(1);
      position.value = 0;
    } else {
      if (
        tableData.value[index].fullName === tableData.value[index - 1].fullName
      ) {
        spanArr.value[position.value] += 1;
        spanArr.value.push(0);
      } else {
        spanArr.value.push(1);
        position.value = index;
      }
    }
  });
}

//切换“折叠”与“展开”
function handleFold() {
  queryFold.value = !queryFold.value;
  setTableHeight();
}

// 重置查询条件表单
const handleReset = () => {
  let projectId = "";
  if (projectWinBidNV.value.length > 0) {
    projectId = projectWinBidNV.value[0].id;
  }
  queryFormRef.value.resetFields();
  queryForm.projectId = projectId;
  onSearch();
};

// 表格行选中回调resetForm
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
  multipleSelection.value = val;
}

function handleRowSelect(selection, row) {
  console.log("row", row);
  const selectResult = selection.find(item => item.id == row.id);
  if (selectResult) {
    //勾选
    let parent = null;
    if (selectResult.parentId == "00000000-0000-0000-0000-000000000000") {
      //父节点勾选，同时要勾选其所有子节点
      parent = selectResult;
    } else {
      //子节点勾选，
      parent = tableData.value.find(item => item.id == selectResult.parentId);
    }
    nextTick(() => {
      tableRef.value.toggleRowSelection(parent, true);
    });
    parent.childrenList.forEach(element => {
      nextTick(() => {
        tableRef.value.toggleRowSelection(element, true);
      });
    });
  } else {
    // 取消勾选
    let parent = null;
    if (row.parentId == "00000000-0000-0000-0000-000000000000") {
      //父节点取消勾选
      parent = row;
    } else {
      //子节点取消勾选
      parent = tableData.value.find(item => item.id == row.parentId);
    }
    nextTick(() => {
      tableRef.value.toggleRowSelection(parent, false);
    });
    parent.childrenList.forEach(element => {
      nextTick(() => {
        tableRef.value.toggleRowSelection(element, false);
      });
    });
  }
}
function handleTableSelect(selection) {
  console.log("selection", selection);
  selection.forEach(element => {
    if (element.parentId == "00000000-0000-0000-0000-000000000000") {
      //全选
      element.childrenList.forEach(_element => {
        nextTick(() => {
          tableRef.value.toggleRowSelection(_element, true);
        });
      });
    } else {
      //取消全选
      nextTick(() => {
        tableRef.value.toggleRowSelection(element, false);
      });
    }
  });
}
//申请
function handleApply(row) {
  if (multipleSelection.value) {
    IdData.value = multipleSelection.value.map(item => {
      return item.projectId;
    });
    // multipleSelection.value.every(item => {
    //   if (item.materialQty > 0 && item.receiveTime) {
    formDialogRef.value.show(row, "apply");
    //   } else {
    //     ElMessage.error("需要填写正确的数量和到货日期");
    //   }
    // });
  }
}

//选择采购
function handleSelect() {
  router.push("/purchasing/PurchasList");
}

//新增操作
const handleAdd = () => {
  dialogFormRef2.value.show(null, "extraAdd");
};

//新增操作
const handlePartsAdd = row => {
  dialogFormRef2.value.show(row, "partsAdd");
};

// 修改表格行
function handleEdit(row) {
  dialogFormRef2.value.show(row, "edit");
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    const { code, message } = await DeleteReqCartItem({ id: row.id });
    if (code == 0) {
      ElMessage.success(message);
      onSearch();
    }
  });
}

function rowSelectable({ materialQty, siteItems }) {
  const siteItem = siteItems.find(
    item =>
      (item.materialQty != 0 && item.receiveTime == null) ||
      (item.materialQty == 0 && item.receiveTime != null)
  );
  return materialQty > 0 && !siteItem;
}

function formatDatetime(dt) {
  return dayjs(dt).format("YYYY-MM-DD");
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
  setTableHeight();
  getProjectList();
  getProjectWinBidNV();
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
          style="width: 100%"
        >
          <el-option
            v-for="item in projectWinBidNV"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        v-show="queryItemMaxNum >= 2 || !queryFold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model.trim="queryForm.keyword"
          placeholder="设备名称"
          clearable
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
        <template v-for="(item, index) in tableButtons" :key="index">
          <el-upload
            v-if="item.buttonClick == 'handleImport'"
            action="#"
            :http-request="handleImport"
            :multiple="false"
            name="file"
            :show-file-list="false"
            class="mx-3"
          >
            <template #trigger>
              <el-button
                type="primary"
                :loading="importing"
                :title="item.buttonName"
                :icon="useRenderIcon(item.buttonIcon)"
                >{{ item.buttonName }}</el-button
              >
            </template>
          </el-upload>
          <el-button
            v-else
            :type="item.buttonType"
            :loading="
              (item.buttonClick == 'handleExport' ||
                item.buttonClick == 'handleQrCode' ||
                item.buttonClick == 'handleMultipleQrCode') &&
              exporting
            "
            :disabled="
              item.buttonClick == 'handleApply' && multipleSelection.length <= 0
            "
            :icon="useRenderIcon(item.buttonIcon)"
            :title="item.buttonName"
            @click="handleOperation(item.buttonClick)"
            >{{ item.buttonName }}</el-button
          >
        </template>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          ref="tableRef"
          border
          :size="size"
          row-key="id"
          :data="tableData"
          :height="tableHeight"
          highlight-current-row
          :default-expand-all="true"
          :tree-props="{ children: 'childrenList' }"
          @selection-change="handleSelectionChange"
          @select="handleRowSelect"
          @select-all="handleTableSelect"
        >
          <el-table-column
            type="selection"
            align="center"
            width="60"
            :selectable="rowSelectable"
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
              v-else-if="column.prop != 'siteItems'"
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
              width="120"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span>{{
                  row.siteItems[idx].receiveTime
                    ? formatDatetime(row.siteItems[idx].receiveTime)
                    : "-"
                }}</span>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column
            label="备注"
            align="left"
            prop="remark"
            min-width="200"
            show-overflow-tooltip
          />
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
    <DialogForm
      ref="dialogFormRef"
      :projectList="projectWinBidNV"
      @search="onSearch"
    />
    <DialogForm2
      ref="dialogFormRef2"
      :projectList="projectWinBidNV"
      :projectId="queryForm.projectId"
      @search="onSearch"
    />
    <ReadDialog ref="readDialogRef" :title="title" :width="820" :column="2" />
    <FormDialog
      ref="formDialogRef"
      :projectList="projectList"
      :multipleSelection="multipleSelection"
      @search="onSearch"
    />
  </div>
</template>
