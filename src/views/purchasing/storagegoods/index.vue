<script setup lang="ts">
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { columns } from "./constant";
import {
  getRecvInStockList,
  getInStockStatus,
  doInStock,
  deleteRecvInStock,
  getRecvInStock
} from "@/api/recvInStock";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import PrintDialog from "./components/PrintDialog.vue";
import { tableButtons, operationButtons } from "./constant";
import { PreviewButton } from "@/components/PreviewButton";
import { DownloadButton } from "@/components/DownloadButton";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { userProjectStoreHook } from "@/store/modules/project";
import { TableColumOperation } from "@/components/TableColumOperation";
import ReadDialog from "@/components/ReadDialog";

defineOptions({
  name: "StorageGoods"
});

const title = useRoute().meta.title as string;
const { getProjectWinBidNVList } = userProjectStoreHook();
// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  inStockStatus: "", //入库状态
  projectId: "",
  projectFullName: "",
  keyword: ""
});
const spanArr = ref([]); // 合并单元格
const position = ref(0);
const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const inStockStatusNV = ref([]); // 入库状态列表
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const dialogFormRef = ref(null); // 表单对话框组件实例
const printDialogRef = ref(null);
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例
const { winBidProjectNVList } = storeToRefs(userProjectStoreHook());
const readDialogRef = ref(null); // 表单对话框组件实例

//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  getRecvInStockList(queryForm)
    .then(({ data }) => {
      const _data = data.data || [];
      tableData.value = _data.map(item => {
        item.disabled = {};
        item.title = {};
        //编辑
        item.disabled["handleEdit"] = item.inStockStatus != 1;
        item.title["handleEdit"] =
          item.inStockStatus != 1 ? "已入库，不可编辑" : "";
        //删除
        item.disabled["handleDelete"] = item.inStockStatus != 1;
        item.title["handleDelete"] =
          item.inStockStatus != 1 ? "已入库，不可删除" : "";
        //入库
        item.disabled["handleReceive"] =
          item.inStockStatus == 2 || !item.keepStaffId;
        item.title["handleReceive"] =
          item.inStockStatus == 2
            ? "不能重复收货"
            : !item.keepStaffId
              ? "请先完善入库信息"
              : "";
        return item;
      });
      console.log("tableData", tableData.value);
      totalPage.value = data.totalCount;
      requestLoading.value = false;
      handleData();
    })
    .catch(() => {
      requestLoading.value = false;
      tableData.value = [];
    });
}

// 获取投标状态列表
function getBidStatusList() {
  getInStockStatus(queryForm)
    .then(({ data }) => {
      inStockStatusNV.value = data || [];
    })
    .catch(() => {
      inStockStatusNV.value = [];
    });
}

/*
  rowspan（）这个函数就是用来返回 spanArr 数组的，定义每一行的 rowspan
  if( index === 0)，第一行，直接先给数组 push 进一个1，表示自己先占一行，position 是数组元素的位置
  （此时是从数组元素的第一个开始，所以position 为 0）， position为 0 意思表示的就是数组的第一个元素。

  当到了 index 为 2 的时候，if(listData.value[index][spanName] === listData.value[index-1][spanName])，
  让第二行与第一行作比较：
  （1）如果第二行与第一行相等的话，position 就 +1，当有 n 行第一行相同，position 就为 n，表示向下合并 n 行；
  第二行自己就 spanArr.push(0)，表示第二行“消失”，因为第一行和第二行合并了；
  （2）如果第二行与第一行不相等的话，那么 spanArr.push(1);就让第二行自己独占一行；

  position = index ：把指针拿到 index 这行来，表示设置数组 spanArr[position] 的元素值，然后定义从此行开始向下合并几行
  （可以根据示例研究下，当 index 为 2 时，position 为 2，当 index 为 3 时，第四行与第三行需要合并，
  那么在数组的 position 元素就要 +1 了，也就是 spanArr[position] += 1）
*/
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

/*
  :span-method="objectSpanMethod"
  这个是官方给定的绑定属性和对应的方法，objectSpanMethod 传入了 { row, column, rowIndex, columnIndex }
  row: 当前行
  column: 当前列
  rowIndex：当前行号
  columnIndex ：当前列号

  该函数可以返回一个包含两个元素的数组，第一个元素代表rowspan，第二个元素代表 colspan。
  也可以返回一个键名为 rowspan 和 colspan 的对象。

  const _col = _row > 0 ? 1 : 0;  定义的这个单元格列的合并，我们项目只合并行，不合并列；

  _row：代表合并行的行数，_row 的值要么是 1，或者更大的自然正整数，要么是 0。
  1代表：独占一行
  更大的自然数：代表合并了若干行
  0：代表“消失”的哪那一个单元格，后面的单元格向前推一格
*/

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

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handleRead":
      // handleRead(row);
      getRecvInStock({
        id: row.id
      }).then(({ data }) => {
        readDialogRef.value.show(data, columns);
      });
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleReceive":
      handleReceive(row);
      break;
    case "handlePrint":
      handlePrint(row);
      break;
  }
}
// 添加表格行
function handleAdd() {
  dialogFormRef.value.show(null, "add");
}
// // 查看表格行
// function handleRead(row) {
//   dialogFormRef.value.show(row, "read");
// }

// 编辑表格行
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
      const { code, message } = await deleteRecvInStock({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//打印行
function handlePrint(row) {
  printDialogRef.value.show(row);
}

// 表格行收获
async function handleReceive(row) {
  // dialogFormRef.value.show(row, "receive");
  const { code, message } = await doInStock({
    id: row.id,
    keepStaffId: row.keepStaffId,
    inStockTime: row.inStockTime,
    attach: row.attach
  });
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
}

// 表格行选中回调resetForm
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

function handleProjectChange(val) {
  const project = winBidProjectNVList.value.find(item => item.value == val);
  if (project) {
    queryForm.projectFullName = project.name;
  } else {
    queryForm.projectFullName = "";
  }
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
  if (winBidProjectNVList.value.length < 1) {
    getProjectWinBidNVList();
  }
  getBidStatusList();
  onSearch();
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
      label-width="96px"
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
          @change="handleProjectChange"
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
        label="入库状态"
        prop="inStockStatus"
      >
        <el-select v-model="queryForm.inStockStatus">
          <el-option label="全部" value="" />
          <el-option
            v-for="item in inStockStatusNV"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 3 || !queryFold"
        label="采购合同编号"
        prop="keyword"
      >
        <el-input
          v-model.trim="queryForm.keyword"
          placeholder="请输入"
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
      title="入库单列表"
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
          :data="tableData"
          border
          style="width: 100%"
          :size="size"
          :height="tableHeight"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('序号列')"
            type="index"
            :index="getIndex"
            fixed="left"
            label="序号"
            align="center"
            width="60"
          />
          <el-table-column
            label="入库单编号"
            fixed="left"
            min-width="200"
            prop="inStockCode"
            align="center"
          />

          <el-table-column
            min-width="100"
            fixed="left"
            label="入库状态"
            prop="inStockStatusName"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                :type="row.inStockStatus == 1 ? 'info' : 'success'"
                :size="size"
              >
                {{ row.inStockStatusName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="采购合同编号"
            min-width="200"
            prop="sellContractCode"
            align="center"
          />
          <el-table-column
            label="乙方单位"
            align="left"
            prop="supplyName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="项目名称"
            align="left"
            prop="projectFullName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            min-width="100"
            label="项目负责人"
            prop="projectDutyStaffName"
            align="center"
          />
          <el-table-column
            min-width="100"
            label="采购经办人"
            prop="joinSignHandStaffName"
            align="center"
          />
          <el-table-column
            label="经手人"
            min-width="100"
            prop="handStaffName"
            align="center"
          />
          <el-table-column
            min-width="100"
            label="保管员"
            prop="keepStaffName"
            align="center"
          />
          <el-table-column
            min-width="100"
            label="审核员"
            prop="auditStaffName"
            align="center"
          />
          <el-table-column
            min-width="100"
            label="实际经办人"
            prop="realJoinSignHandStaffName"
            align="center"
          />

          <el-table-column align="center" label="附件" min-width="120">
            <template #default="{ row }">
              <div v-if="row.attach && row.attach.length > 0">
                <PreviewButton :srcList="row.attach" :size="size" />
                <DownloadButton :srcList="row.attach" :size="size" />
              </div>
            </template>
          </el-table-column>

          <el-table-column
            min-width="120"
            label="入库日期"
            prop="inStockTime"
            :formatter="
              ({ inStockTime }) =>
                inStockTime ? dayjs(inStockTime).format('YYYY-MM-DD') : '-'
            "
            align="center"
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
      :winBidProjectNVList="winBidProjectNVList"
      @search="onSearch"
    />
    <PrintDialog
      ref="printDialogRef"
      :winBidProjectNVList="winBidProjectNVList"
    />
    <ReadDialog ref="readDialogRef" :title="title" :column="2" :width="1000" />
  </div>
</template>
