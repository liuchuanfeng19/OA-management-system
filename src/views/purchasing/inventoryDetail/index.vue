<script setup lang="ts">
import dayjs from "dayjs";
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { exportExcel } from "@/api/exportAll";
import { TableProBar } from "@/components/ReTable";
import UpdateDialog from "./components/UpdateDialog.vue";
import { tableButtons, operationButtons } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { TableColumOperation } from "@/components/TableColumOperation";
import {
  getPssManageList,
  deleteOverPssManage,
  carryOverPssManage
} from "@/api/pssManage";
import moment from "moment";

defineOptions({
  name: "InventoryDetail"
});

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  projectName: "",
  materialName: "",
  supplyName: "",
  materialSpec: "",
  month: moment().format("YYYY-MM")
});
const spanArr = ref([]); // 合并单元格
const position = ref(0);
const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const customerName = ref(""); // 甲方名称
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const updateFormRef = ref(null); // 表单对话框组件实例
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例
//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  getPssManageList(queryForm)
    .then(({ data }) => {
      const list = data.data || [];
      customerName.value = list.length > 0 ? list[0].customerName : "";
      tableData.value = list.map(item => {
        item.disabled = {};
        item.title = {};
        // //更新
        // item.disabled["handleUpdate"] = !item.canEdit;
        // item.title["handleUpdate"] = !item.canEdit ? "当前数据不可编辑" : "";
        //删除
        item.disabled["handleDelete"] = !item.canDel;
        item.title["handleDelete"] = !item.canDel ? "当前数据不可删除" : "";
        return item;
      });
      totalPage.value = data.totalCount;
      handleData();
    })
    .catch(() => {
      tableData.value = [];
    })
    .finally(() => {
      requestLoading.value = false;
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
        tableData.value[index].projectName ===
        tableData.value[index - 1].projectName
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
const objectSpanMethod = ({ rowIndex, columnIndex }) => {
  //表格合并行
  if (columnIndex == 17) {
    const _row = spanArr.value[rowIndex];
    const _col = _row > 0 ? 1 : 0;
    return {
      rowspan: _row,
      colspan: _col
    };
  }
};
//切换“折叠”与“展开”
function handleFold() {
  queryFold.value = !queryFold.value;
  setTableHeight();
}

// 重置查询条件表单
const handleReset = () => {
  queryFormRef.value.resetFields();
  queryForm.month = moment().format("YYYY-MM");
  onSearch();
};

//操作按钮
function handleOperation(functionName, row?) {
  switch (functionName) {
    case "handleExport":
      handleExport();
      break;
    case "handleOver":
      handleOver();
      break;

    case "handleDelete":
      handleDelete(row);
      break;
    case "handleUpdate":
      handleUpdate(row);
      break;
  }
}

// 修改表格行
function handleUpdate(row) {
  updateFormRef.value.show(row, "update");
}

// 结转
async function handleOver() {
  const { code, message } = await carryOverPssManage();
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteOverPssManage({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//导出
function handleExport() {
  const fileName = "购销存导出";
  exportExcel("/api/PssManage/Export?", fileName, queryForm);
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
3
<template>
  <div class="main">
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryForm"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      label-width="74px"
    >
      <el-form-item v-show="queryItemMaxNum >= 1 || !queryFold" label="月份">
        <el-date-picker
          v-model="queryForm.month"
          type="month"
          format="YYYY年MM月"
          value-format="YYYY-MM"
          :clearable="false"
          :editable="false"
          placeholder="选择月份"
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 2 || !queryFold"
        label="项目名称"
        prop="projectName"
      >
        <el-input
          v-model.trim="queryForm.projectName"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 3 || !queryFold"
        label="物资名称"
        prop="materialName"
      >
        <el-input
          v-model.trim="queryForm.materialName"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 4 || !queryFold"
        label="供货单位"
        prop="supplyName"
      >
        <el-input
          v-model.trim="queryForm.supplyName"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 5 || !queryFold"
        label="规格型号"
        prop="materialSpec"
      >
        <el-input
          v-model.trim="queryForm.materialSpec"
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
      title="购销存明细"
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
          style="width: 100%"
          :size="size"
          :height="tableHeight"
          highlight-current-row
          :data="tableData"
          :span-method="objectSpanMethod"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            align="center"
            width="60"
          />
          <el-table-column
            label="日期"
            align="center"
            prop="inStockTime"
            fixed="left"
            width="100"
            :formatter="
              ({ inStockTime }) => {
                return inStockTime
                  ? dayjs(inStockTime).format('YYYY年MM月')
                  : '';
              }
            "
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
            label="物资名称"
            fixed="left"
            align="left"
            prop="materialName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="规格型号"
            fixed="left"
            align="left"
            prop="materialSpec"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="单位"
            fixed="left"
            align="center"
            prop="materialUnit"
            show-overflow-tooltip
            width="90"
          />
          <el-table-column label="期初库存" align="center">
            <el-table-column
              label="数量"
              align="right"
              prop="initialQty"
              show-overflow-tooltip
            />
            <el-table-column
              label="单价"
              align="right"
              prop="initialPrice"
              show-overflow-tooltip
            />
            <el-table-column
              label="金额"
              align="right"
              prop="initialSubTotal"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column label="本月入库" align="center">
            <el-table-column
              label="数量"
              align="right"
              prop="inQty"
              show-overflow-tooltip
            />
            <el-table-column
              label="单价"
              align="right"
              prop="inPrice"
              show-overflow-tooltip
            />
            <el-table-column
              label="金额"
              align="right"
              prop="inSubTotal"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column label="本月出库" align="center">
            <el-table-column
              label="数量"
              align="right"
              prop="outQty"
              show-overflow-tooltip
            />
            <el-table-column
              label="单价"
              align="right"
              prop="outPrice"
              show-overflow-tooltip
            />
            <el-table-column
              label="金额"
              align="right"
              prop="outSubTotal"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column label="期末库存" align="center">
            <el-table-column
              label="数量"
              align="right"
              prop="finalQty"
              show-overflow-tooltip
            />
            <el-table-column
              label="单价"
              align="right"
              prop="finalPrice"
              show-overflow-tooltip
            />
            <el-table-column
              label="金额"
              align="right"
              prop="finalSubTotal"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column
            label="项目名称"
            align="left"
            prop="projectName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="销售货物名称"
            align="left"
            prop="sellMaterialName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="进项税"
            width="150"
            align="right"
            prop="inTax"
          />
          <el-table-column
            label="价税合计"
            width="150"
            align="right"
            prop="priceTaxTotal"
          />
          <el-table-column
            label="供货单位"
            align="left"
            prop="supplyName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="单位名称"
            width="150"
            align="left"
            prop="customerName"
          />

          <el-table-column
            label="开票金额"
            width="120"
            align="right"
            prop="invoiceAmount"
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
    <UpdateDialog ref="updateFormRef" @search="onSearch" />
  </div>
</template>
