<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { getReqInvoice } from "@/api/reqInvoice";
import { getInvoiceCompany } from "@/api/invoiceCompany";
import Print from "@/utils/print";
import dayjs from "dayjs";
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  reqCode: "", //申请单号
  deptId: "", //经办部门
  staffId: "", //申请人ID
  projectId: "", //项目Id
  staffName: "",
  mobile: "", //电话
  deptName: "", //部门名称
  applyReason: "",
  projectFullName: "", //项目名称
  projectShortName: "", //项目立项简称
  invoiceCompanyId: "", //开票单位Id
  invoiceCompanyName: "", //开票单位
  sellContractId: "", //销售合同ID
  sellContractCode: "", //销售合同编号
  invoiceAmount: 0, //开票金额
  invoiceAmountCHN: "", //开票金额大写
  invoiceRemark: "", //备注
  doTemp: false, //暂存：true，提交：false,
  reqInvoiceItems: [
    // {
    //   id: undefined, //
    //   reqInvoiceId: undefined, //开票申请ID
    //   sellContractItemId: undefined, //销售合同明细ID
    //   materialName: "", //物资名称
    //   materialSpec: "", //规格型号
    //   materialUnit: "", //单位
    //   materialQty: 1, //数量
    //   materialPrice: 0, //单价
    //   subTotal: 0 //小计
    // }
  ] //发票明细
};
// 表单模型
const INITIAL_COM_DATA = {
  id: undefined,
  projectId: "", //项目Id
  projectFullName: "", //项目名称
  projectShortName: "", //项目立项简称
  companyName: "", //单位名称
  invoiceType: "", //发票种类
  taxRate: "", //税率
  taxNo: "", //税号
  planCollectTime: "", //预计收款日期
  telephone: "", //电话
  address: "", //地址
  bank: "", //开户行
  bankAccount: "", //帐号
  sellContractCode: "", //合同号
  financeProjectName: "" //财务立项
};
const mData = ref([]);
const formData = ref(null);
const formCompnayData = ref(null);
const formVisible = ref(false);
const columns = ref([
  {
    props: "column0",
    width: 130
  },
  {
    props: "column1",
    width: 130
  },
  {
    props: "column2",
    width: 120
  },
  {
    props: "column3",
    width: 120
  },
  {
    props: "column4",
    width: 120
  },
  {
    props: "column5",
    width: 70
  },
  {
    props: "column6",
    width: 130
  },
  {
    props: "column7",
    width: 170
  }
]);
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "增值税发票开票申请单";
});

// 子组件暴露给父组件调用的方法
const show = async _formData => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  formCompnayData.value = { ...INITIAL_COM_DATA };
  await getDetail(_formData.id);
  setDatas();
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  const { data } = await getReqInvoice({ id });
  formData.value = data || {};
  await getCompanyDetail(formData.value.invoiceCompanyId);
  formData.value.applyDate = formatDatetime(formData.value.applyDate);
}
// 获取详情数据;
async function getCompanyDetail(id) {
  const { data } = await getInvoiceCompany({ id });
  formCompnayData.value = data;
}
function setDatas() {
  for (let i = 0; i < 5; i++) {
    const obj = {};
    if (i == 0) {
      obj["column0"] = "开票单位";
      obj["column1"] = "名称";
      obj["column2"] = formData.value.invoiceCompanyName;
      obj["column3"] = "发票种类";
      obj["column4"] = formCompnayData.value.invoiceTypeName;
      obj["column5"] = "";
      obj["column6"] = "";
      obj["column7"] = "";
    } else if (i == 1) {
      obj["column0"] = "税率";
      obj["column1"] = formCompnayData.value.taxRate + "%";
      obj["column2"] = "";
      obj["column3"] = "";
      obj["column4"] = "";
      obj["column5"] = "";
      obj["column6"] = "";
      obj["column7"] = "";
    } else if (i == 2) {
      obj["column0"] = "税号";
      obj["column1"] = formCompnayData.value.taxNo;
      obj["column2"] = "预计收款日期";
      obj["column3"] = formatDatetime(formCompnayData.value.planCollectTime);
      obj["column4"] = "";
      obj["column5"] = "";
      obj["column6"] = "";
      obj["column7"] = "";
    } else if (i == 3) {
      obj["column0"] = "地址\n电话";
      obj["column1"] =
        formCompnayData.value.address + "\n" + formCompnayData.value.telephone;
      obj["column2"] = "合同号";
      obj["column3"] = formCompnayData.value.sellContractCode;
      obj["column4"] = "";
      obj["column5"] = "";
      obj["column6"] = "";
      obj["column7"] = "";
    } else if (i == 4) {
      obj["column0"] = "开户行账号";
      obj["column1"] =
        formCompnayData.value.bank + " " + formCompnayData.value.bankAccount;
      obj["column2"] = "财务立项";
      obj["column3"] = formCompnayData.value.financeProjectName;
      obj["column4"] = "";
      obj["column5"] = "";
      obj["column6"] = "";
      obj["column7"] = "";
    }
    mData.value.push(obj);
  }
  const obj5 = {};
  obj5["column0"] = "货物名称";
  obj5["column1"] = "";
  obj5["column2"] = "规格型号";
  obj5["column3"] = "单位";
  obj5["column4"] = "数量";
  obj5["column5"] = "单价";
  obj5["column6"] = "";
  obj5["column7"] = "总价（含税金额）";
  mData.value.push(obj5);
  const reqInvoiceItems = formData.value.reqInvoiceItems || [];
  reqInvoiceItems.forEach(item => {
    const obj = {};
    obj["column0"] = item.materialName;
    obj["column1"] = "";
    obj["column2"] = item.materialSpec;
    obj["column3"] = item.materialUnit;
    obj["column4"] = item.materialQty;
    obj["column5"] = "￥" + item.materialPrice;
    obj["column6"] = "";
    obj["column7"] = "￥" + item.subTotal;
    mData.value.push(obj);
  });
  const obj6 = {};
  obj6["column0"] = "价税合计(大写)";
  obj6["column1"] = "人民币：" + formData.value.invoiceAmountCHN;
  obj6["column2"] = "小写";
  obj6["column3"] = "￥" + formData.value.invoiceAmount;
  obj6["column4"] = "";
  obj6["column5"] = "";
  obj6["column6"] = "";
  obj6["column7"] = "";
  mData.value.push(obj6);
  const obj7 = {};
  obj7["column0"] = "备注";
  obj7["column1"] = formData.value.invoiceRemark;
  obj7["column2"] = "";
  obj7["column3"] = "";
  obj7["column4"] = "";
  obj7["column5"] = "";
  obj7["column6"] = "";
  obj7["column7"] = "";
  mData.value.push(obj7);
  const obj8 = {};
  const reviewer1 = formData.value.reviewers[1];
  obj8["column0"] = "经办部门";
  obj8["column1"] = formData.value.deptName;
  obj8["column2"] = "业务经办人";
  obj8["column3"] = formData.value.staffName;
  obj8["column4"] = "部门经理";
  obj8["column5"] = "";
  if (reviewer1.hasApproved) {
    obj8["column5"] = reviewer1.reviewerName;
  } else {
    obj8["column5"] = "";
  }
  obj8["column6"] = "";
  obj8["column7"] = "";
  mData.value.push(obj8);
  const obj9 = {};
  const reviewer2 = formData.value.reviewers[2];
  const reviewer3 = formData.value.reviewers[3];
  obj9["column0"] = "财务经理";
  if (reviewer1.hasApproved) {
    obj9["column1"] = reviewer2.reviewerName;
  } else {
    obj9["column1"] = "";
  }
  obj9["column2"] = "分管副总";
  if (reviewer3.hasApproved) {
    obj9["column3"] = reviewer3.reviewerName;
  } else {
    obj9["column3"] = "";
  }
  obj9["column4"] = "开票员确认签字及日期：";
  obj9["column5"] = "";
  obj9["column6"] = "";
  obj9["column7"] = "";
  mData.value.push(obj9);
}
const arraySpanMethod = ({ rowIndex, columnIndex }) => {
  if (columnIndex === 0 && rowIndex == 0) {
    return [5, 1];
  }
  if (columnIndex === 1 && rowIndex === 0) {
    return [2, 1];
  }
  if (columnIndex === 2 && rowIndex === 0) {
    return [2, 4];
  }
  if (
    (rowIndex === 2 || rowIndex === 3 || rowIndex === 4) &&
    columnIndex === 1
  ) {
    return [1, 4];
  }
  if (
    rowIndex >= 5 &&
    rowIndex <= 5 + formData.value.reqInvoiceItems.length &&
    (columnIndex === 0 || columnIndex === 5)
  ) {
    return [1, 2];
  }
  if (
    rowIndex >= 5 &&
    rowIndex <= 5 + formData.value.reqInvoiceItems.length &&
    (columnIndex === 1 || columnIndex === 6)
  ) {
    return [0, 0];
  }
  if (
    rowIndex >= 6 + formData.value.reqInvoiceItems.length &&
    rowIndex <= 9 + formData.value.reqInvoiceItems.length &&
    columnIndex === 0
  ) {
    return [1, 2];
  }
  if (
    (rowIndex === 6 + formData.value.reqInvoiceItems.length ||
      rowIndex === 7 + formData.value.reqInvoiceItems.length) &&
    columnIndex === 1
  ) {
    return [1, 4];
  }
  if (
    (rowIndex === 8 + formData.value.reqInvoiceItems.length ||
      rowIndex === 9 + formData.value.reqInvoiceItems.length) &&
    columnIndex === 3
  ) {
    return [1, 2];
  }
  if (
    rowIndex === 9 + formData.value.reqInvoiceItems.length &&
    columnIndex === 4
  ) {
    return [1, 2];
  }
  return [1, 1];
};
//打印
function handlePrint() {
  Print(".print-main").toPrint;
}
function formatDatetime(dt) {
  return dayjs(dt).format("YYYY年MM月DD日");
}
//关闭对话框
const closeDialog = () => {
  mData.value = [];
  formVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="1050"
    draggable
    @close="closeDialog"
  >
    <div class="print-main">
      <div class="title">{{ formData.companyName }}增值税发票开票申请单</div>
      <div class="top">
        <span>申请单编号：{{ formData.reqCode }}</span>
        <span>{{ formData.applyDate }}</span>
      </div>
      <el-table
        border
        :data="mData"
        :show-header="false"
        :span-method="arraySpanMethod"
      >
        <template v-for="(item, idx) in columns" :key="idx">
          <el-table-column
            :prop="item.props"
            :width="item.width"
            align="left"
          />
        </template>
      </el-table>
      <div class="bottom">
        <span class="text"
          >注：1、此表格除签字部分外需电子填写打印，不得手写。2、格式及要求栏目、纸张大小不得更改。3、经办人及部门经理须对开票单位及开票信息核实无误。4、开票员开票核对确认并签字。</span
        >
      </div>
    </div>
    <template #footer>
      <el-button @click="formVisible = false"> 取消 </el-button>
      <el-button type="success" @click="handlePrint">打印 </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.print-main {
  display: flex;
  flex-direction: column;
  margin: 30px;

  .title {
    padding: 10px 0px;
    font-size: 16px;
    color: #000;
    font-weight: bold;
    text-align: center;
  }

  .top {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: #000;
  }

  .bottom {
    display: flex;
    flex-direction: row;
    padding: 10px 10px;

    .text {
      font-size: 14px;
      color: #000;
      font-weight: bold;
      padding-right: 10px;
    }
  }
}

:deep() {
  .el-table--border .el-table__inner-wrapper::after,
  .el-table--border::after,
  .el-table--border::before,
  .el-table__inner-wrapper::before {
    background-color: #000 !important;
    border-top: #000 1px solid;
    border-right: #000 1px solid;
  }

  .el-table__border-left-patch {
    background-color: #000 !important;
    border-left: #000 1px solid;
  }

  .el-table td.el-table__cell,
  .el-table th.el-table__cell.is-leaf {
    border-bottom: 1px #000 solid;
    border-right: 1px #000 solid;
  }

  .el-table .cell {
    color: #000 !important;
    white-space: pre-wrap !important;
  }
}
</style>
