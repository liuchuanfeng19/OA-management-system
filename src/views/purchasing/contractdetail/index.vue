<script setup lang="ts">
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { columns } from "./constant";
import {
  getMyCollectItemList,
  unCollectItem,
  deleteCollectItem,
  getMyCollectItem
} from "@/api/reqOrderItem";
import { batchExportExcel } from "@/api/exportAll";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue"; //编辑/查看功能弹框组件
import DialogForm2 from "./components/DialogForm2.vue"; //生成采购单弹框组件
import DialogForm3 from "./components/DialogForm3.vue"; //添加下采项，配件弹框组件
import DialogImport from "./components/DialogImport.vue"; //添加下采项，配件弹框组件
import { operationButtons, tableButtons } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { userProjectStoreHook } from "@/store/modules/project";
import { TableColumOperation } from "@/components/TableColumOperation";
import ReadDialog from "@/components/ReadDialog";

defineOptions({
  name: "ContractDetail"
});

const title = useRoute().meta.title as string;
const { getProjectWinBidNVList } = userProjectStoreHook();
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
const tableRef = ref(null);
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const dialogFormRef = ref(null); // 表单对话框组件实例
const dialogFormRef2 = ref(null); // 表单对话框组件实例
const dialogFormRef3 = ref(null); // 表单对话框组件实例
const dialogImportRef = ref(null); // 表单对话框组件实例
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例
const multipleSelection = ref([]); //列表选中数据存放
const IdData = ref([]);
const exportLoading = ref(false);
const { winBidProjectNVList } = storeToRefs(userProjectStoreHook());
const readDialogRef = ref(null); // 表单对话框组件实例

// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  getMyCollectItemList(queryForm)
    .then(({ data }) => {
      const _data = data.data || [];
      tableData.value = rebuildData(_data);
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
    //编辑
    item.disabled["handleEdit"] = item.isVirtual;
    item.title["handleEdit"] = item.isVirtual ? "当前不允许编辑" : "";
    //退回
    item.disabled["handleReturn"] = !item.canReturn;
    item.title["handleReturn"] = !item.canReturn ? "当前不允许退回" : "";
    //删除
    item.disabled["handleDelete"] = !item.canDel;
    item.title["handleDelete"] = !item.canDel ? "当前不允许删除" : "";
    //配件
    item.disabled["handlePartsAdd"] =
      item.preParentId != "00000000-0000-0000-0000-000000000000";
    item.title["handlePartsAdd"] =
      item.preParentId != "00000000-0000-0000-0000-000000000000"
        ? "配件无法继续添加配件"
        : "";
    if (item.childrenList.length > 0) {
      item.childrenList = rebuildData(item.childrenList);
    }
    return item;
  });
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handlePickAdd":
      handlePickAdd();
      break;
    case "handleExport":
      handleExport();
      break;
    case "handleImport":
      handleImport();
      break;
    case "handleRead":
      getMyCollectItem({
        id: row.id
      }).then(({ data }) => {
        readDialogRef.value.show(data, columns);
      });
      break;
    case "handlePartsAdd":
      handlePartsAdd(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleReturn":
      handleReturn(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
  }
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
  queryFormRef.value.resetFields();
  onSearch();
};

//新增操作
const handleAdd = () => {
  if (multipleSelection.value) {
    IdData.value = multipleSelection.value.map(item => {
      return item.projectId;
    });
    const data = new Set(IdData.value);
    if (data.size == 1) {
      multipleSelection.value.every(item => {
        if (item.materialPrice > 0 && item.materialPrice) {
          dialogFormRef2.value.show(null, "add");
        } else {
          ElMessage.error("请编辑采购单价");
        }
      });
    } else {
      ElMessage.error("选择项目需为同一中标单位");
    }
  }
};
// 添加下采项
function handlePickAdd() {
  dialogFormRef3.value.show(null, "extraAdd");
}
//导出
async function handleExport() {
  if (queryForm.projectId == "" || queryForm.projectId == null) {
    ElMessage.error("选择一个项目");
    return;
  }
  const fileName = "待采单";
  exportLoading.value = true;
  await batchExportExcel("/api/MyCollectItem/Export?", fileName, queryForm);
  exportLoading.value = false;
}
//导入
function handleImport() {
  dialogImportRef.value.show(winBidProjectNVList.value, queryForm.projectId);
}
// 查看表格行
// function handleRead(row) {
//   dialogFormRef.value.show(row, "query");
// }
// 添加配件
function handlePartsAdd(row) {
  dialogFormRef3.value.show(row, "partsAdd");
}
// // 修改表格行
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}
// 退回
async function handleReturn(row) {
  ElMessageBox.confirm("确定要退回吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    const { code, message } = await unCollectItem({ id: row.id });
    if (code == 0) {
      ElMessage.success(message);
      onSearch();
    }
  });
}
// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    const { code, message } = await deleteCollectItem({ id: row.id });
    if (code == 0) {
      ElMessage.success(message);
      onSearch();
    }
  });
}
function rowSelectable({ materialQty, isVirtual }) {
  return materialQty > 0 && !isVirtual;
}
// 表格行选中回调resetForm
function handleSelectionChange(val) {
  multipleSelection.value = val;
}
// function handleRowSelect(selection, row) {
//   console.log("row", row);
//   const selectResult = selection.find(item => item.id == row.id);
//   if (selectResult) {
//     //勾选
//     let parent = null;
//     if (selectResult.preParentId == "00000000-0000-0000-0000-000000000000") {
//       //父节点勾选，同时要勾选其所有子节点
//       parent = selectResult;
//     } else {
//       //子节点勾选，
//       parent = tableData.value.find(
//         item => item.id == selectResult.preParentId
//       );
//     }
//     nextTick(() => {
//       tableRef.value.toggleRowSelection(parent, true);
//     });
//     parent.childrenList.forEach(element => {
//       nextTick(() => {
//         tableRef.value.toggleRowSelection(element, true);
//       });
//     });
//   } else {
//     // 取消勾选
//     let parent = null;
//     if (row.preParentId == "00000000-0000-0000-0000-000000000000") {
//       //父节点取消勾选
//       parent = row;
//     } else {
//       //子节点取消勾选
//       parent = tableData.value.find(item => item.id == row.preParentId);
//     }
//     nextTick(() => {
//       tableRef.value.toggleRowSelection(parent, false);
//     });
//     parent.childrenList.forEach(element => {
//       nextTick(() => {
//         tableRef.value.toggleRowSelection(element, false);
//       });
//     });
//   }
// }
// function handleTableSelect(selection) {
//   console.log("selection", selection);
//   selection.forEach(element => {
//     if (element.preParentId == "00000000-0000-0000-0000-000000000000") {
//       //全选
//       element.childrenList.forEach(_element => {
//         nextTick(() => {
//           tableRef.value.toggleRowSelection(_element, true);
//         });
//       });
//     } else {
//       //取消全选
//       nextTick(() => {
//         tableRef.value.toggleRowSelection(element, false);
//       });
//     }
//   });
// }
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
  if (winBidProjectNVList.value.length < 1) {
    getProjectWinBidNVList();
  }
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
        prop="projectId"
        label="项目名称"
      >
        <el-select
          v-model="queryForm.projectId"
          placeholder="请选择"
          filterable
          style="width: 100%"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="item in winBidProjectNVList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
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
        <el-button
          v-for="item in tableButtons"
          :key="item.buttonClick"
          type="primary"
          :loading="item.buttonClick == 'handleExport' && exportLoading"
          :disabled="
            item.buttonClick == 'handleAdd' && multipleSelection.length < 1
          "
          @click="handleOperation(item.buttonClick)"
        >
          {{ item.buttonName }}
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          ref="tableRef"
          border
          row-key="id"
          :size="size"
          :height="tableHeight"
          :data="tableData"
          highlight-current-row
          :default-expand-all="true"
          :tree-props="{ children: 'childrenList' }"
          @selection-change="handleSelectionChange"
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
            label="序号"
            align="center"
            prop="sequence"
            width="70"
          />
          <el-table-column
            fixed="left"
            label="项目名称"
            align="left"
            prop="projectFullName"
            min-width="240"
            show-overflow-tooltip
          />
          <el-table-column
            label="项目负责人"
            align="center"
            prop="projectDutyStaffName"
            width="120"
            show-overflow-tooltip
          />

          <el-table-column
            label="中标单位"
            align="left"
            prop="winBidCompanyName"
            min-width="240"
            show-overflow-tooltip
          />

          <el-table-column
            label="设备名称"
            width="150"
            align="left"
            prop="materialName"
            show-overflow-tooltip
          />
          <el-table-column
            label="品牌"
            width="150"
            align="left"
            prop="materialBrand"
            show-overflow-tooltip
          />
          <el-table-column
            label="规格型号"
            align="left"
            prop="materialSpec"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column
            label="参数要求"
            align="left"
            prop="materialParams"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="单位"
            align="center"
            prop="materialUnit"
            width="80"
            show-overflow-tooltip
          />
          <el-table-column
            label="采购单价"
            align="right"
            prop="materialPrice"
            width="100"
            show-overflow-tooltip
          />
          <el-table-column
            label="数量"
            align="right"
            prop="materialQty"
            width="80"
            show-overflow-tooltip
          />

          <el-table-column
            label="收货人"
            align="center"
            prop="recvName"
            min-width="100"
            show-overflow-tooltip
          />
          <el-table-column
            label="电话"
            align="left"
            prop="recvMobile"
            min-width="120"
            show-overflow-tooltip
          />
          <el-table-column
            label="收货地址"
            align="left"
            prop="recvAddress"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="备注"
            align="left"
            prop="remark"
            min-width="200"
            show-overflow-tooltip
          />
          <!-- <el-table-column
            label="站点明细"
            align="left"
            prop="siteItemsStr"
            min-width="260"
            show-overflow-tooltip
          /> -->
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
      :winBidProjectNVList="winBidProjectNVList"
      @search="onSearch"
    />
    <DialogForm2
      ref="dialogFormRef2"
      :multipleSelection="multipleSelection"
      @search="onSearch"
    />
    <DialogForm3 ref="dialogFormRef3" @search="onSearch" />
    <DialogImport ref="dialogImportRef" @search="onSearch" />
    <ReadDialog ref="readDialogRef" :title="title" :column="2" :width="1000" />
  </div>
</template>
