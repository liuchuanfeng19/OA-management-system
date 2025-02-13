<script setup lang="ts">
import { ref } from "vue";
import moment from "moment";
import type { TableColumnCtx } from "element-plus";

import Print from "@/utils/print";

import { getOutStock } from "@/api/outStock";

/**
 * 打印容器分辨率宽度：1123px
 * 打印容器内边距：30px
 * 打印容器内容：打印容器分辨率宽度-打印容器内边距*2=1063px
 */
interface Product {
  materialName: string;
  materialSpec: string;
  materialUnit: string;
  materialQty: number;
  materialPrice: number;
  subTotal: number;
  remark: string;
  outStockTime: string;
}
interface SpanMethodProps {
  row: Product;
  column: TableColumnCtx<Product>;
  rowIndex: number;
  columnIndex: number;
}
//1063
const columns = [
  // {
  //   id: "taxCategory",
  //   label: "税收类别",
  //   width: 170,
  //   align: "center"
  // },
  {
    id: "materialName",
    label: "产品名称",
    width: 220,
    align: "center"
  },
  {
    id: "materialSpec",
    label: "规格型号",
    width: 220,
    align: "center"
  },
  {
    id: "materialUnit",
    label: "单位",
    width: 100,
    align: "center"
  },
  {
    id: "materialQty",
    label: "数量",
    width: 100,
    align: "center"
  },
  {
    id: "materialPrice",
    label: "单价",
    width: 100,
    align: "center"
  },
  {
    id: "subTotal",
    label: "金额",
    width: 103,
    align: "center"
  },
  {
    id: "remark",
    label: "备注",
    align: "center",
    width: 220
  }
];
const show = data => {
  getDetail(data.id);
  dialogVisible.value = true;
};

const tableData = ref([]);
const printData = ref();
const dialogVisible = ref(false);

// 根据部门Id获取员工列表
const getDetail = async id => {
  const { data = {} } = await getOutStock({
    id
  });
  printData.value = data;
  let _tableData = data.items || [];
  _tableData = JSON.parse(JSON.stringify(_tableData));
  let totalNum = 0;
  let totalAmount = 0;
  _tableData.forEach(item => {
    totalNum += item.materialQty;
    totalAmount += item.subTotal;
  });
  _tableData.unshift({
    // taxCategory: "税收类别",
    materialName: "产品名称",
    materialSpec: "规格型号",
    materialUnit: "单位",
    materialQty: "数量",
    materialPrice: "单价",
    subTotal: "金额",
    remark: "备注"
  });
  _tableData.push({
    // taxCategory: "合计",
    materialName: "合计",
    materialSpec: "",
    materialUnit: "",
    materialQty: totalNum,
    materialPrice: "",
    subTotal: totalAmount,
    remark: ""
  });
  tableData.value = _tableData;
  console.log("tableData", tableData.value);
};

const objectSpanMethod = ({ rowIndex, columnIndex }: SpanMethodProps) => {
  if (columnIndex === 7) {
    if (rowIndex == 0 || rowIndex == tableData.value.length - 1) {
      return {
        rowspan: 1,
        colspan: 1
      };
    } else {
      if (rowIndex === 1) {
        return {
          rowspan: tableData.value.length - 2,
          colspan: 1
        };
      } else {
        return {
          rowspan: 0,
          colspan: 0
        };
      }
    }
  }
};

function handleSure() {
  Print(".print-content").toPrint;
}

//关闭对话框
const closeDialog = () => {
  tableData.value = [];
  dialogVisible.value = false;
};

defineExpose({ show });
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="打印出库单"
    :width="1163"
    draggable
    @close="closeDialog"
  >
    <div class="print-content flex flex-col w-[1123px] p-[30px]">
      <div
        class="text-center text-black font-bold text-base border-solid border-x-0 border-black py-2"
      >
        {{ printData?.secondName }}出库单
      </div>
      <div
        class="flex justify-between px-2 border-solid border-x-0 border-t-0 border-black pb-2"
      >
        <div>出库单号：{{ printData?.outStockCode }}</div>
        <div>
          出库日期：{{
            printData?.outStockTime
              ? moment(printData?.outStockTime).format("YYYY-MM-DD")
              : ""
          }}
        </div>
        <div>
          审核日期：{{
            printData?.auditTime
              ? moment(printData?.auditTime).format("YYYY-MM-DD")
              : ""
          }}
        </div>
      </div>
      <div
        class="flex justify-start px-2 border-solid border-0 border-black pb-2"
      >
        单位名称：{{ printData?.customerName }}
      </div>
      <div
        class="flex justify-between px-2 border-solid border-x-0 border-t-0 border-black pb-2"
      >
        <div>开票金额：{{ printData?.amount }}</div>

        <div>单位：{{ printData?.amountUnit }}</div>
      </div>
      <el-table
        :data="tableData"
        border
        :show-header="false"
        :span-method="objectSpanMethod"
      >
        <el-table-column
          v-for="col in columns"
          :key="col.id"
          :prop="col.id"
          :label="col.label"
          :width="col.width"
          :align="col.align"
        />
      </el-table>
      <div class="flex border-solid border-0 border-t-0 border-black py-2 mb-4">
        <!-- <div class="flex-1">审核：{{ printData.keepStaffName }}</div>
        <div class="flex-1">保管员：{{ printData.keepStaffName }}</div>
        <div class="flex-1">经手人：{{ printData.joinSignHandStaffName }}</div> -->
        <div class="w-[440px] px-2">经办人：</div>
        <div class="w-[300px] px-2">保管：</div>
        <div class="flex-1 px-9">会计：</div>
      </div>
    </div>
    <template #footer>
      <span>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="success" @click="handleSure">打印</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep() {
  .el-table--border .el-table__inner-wrapper::after,
  .el-table--border::after,
  .el-table--border::before,
  .el-table__inner-wrapper::before {
    background-color: transparent !important;
    border-top: 1px solid #000;
  }

  .el-table__border-left-patch {
    background-color: transparent !important;
    border-left: 1px solid #000;
  }

  .el-table td.el-table__cell,
  .el-table th.el-table__cell.is-leaf {
    border-right: 1px #000 solid;
    border-bottom: 1px #000 solid;
  }
}
</style>
