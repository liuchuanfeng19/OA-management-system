<script setup lang="ts">
import { ref, computed } from "vue";

import { GetBuyPay } from "@/api/purchasing";
import { useNav } from "@/layout/hooks/useNav";
import Print from "@/utils/print";
import dayjs from "dayjs";
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  staffName: "",
  mobile: "",
  deptName: "",
  applyReason: "",
  cancelReason: "",
  applyTime: "",
  applyStatus: 0,
  applyStatusExpr: "",
  canTemp: false,
  canApprove: false,
  canReject: false,
  canCancel: false,
  canReturnBack: false,
  canEdit: false,
  busiType: "",
  doTemp: false,
  comment1: "",
  reviewers: [],
  payCompany: "",
  feeType: "",
  payMethod: "",
  payTime: "",
  payPurpose: "",
  supplyId: "",
  supplyName: "",
  supplyContractCode: "",
  inBank: "",
  inBankAccount: "",
  projectId: "",
  projectName: "",
  contractAmount: "",
  payAmount: "",
  invoiceType: "",
  amount: 0,
  amountCHN: "",
  invoicePayAmount: 0,
  busiStaffId: "",
  busiStaffName: "",
  busiDeptId: "",
  busiDeptName: "采购部",
  attach: [],
  attachRecvSign: [],
  attachCheck: [],
  attachPay: [],
  remark: ""
};

const formData = ref(null);
const formVisible = ref(false);
const { staffName } = useNav(); //用户名
const reviewers = ref([]);
// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  reviewers.value = [];
  if (_formData) {
    await getDetail(_formData.id);
  }
  formData.value.staffName = staffName;
};
defineExpose({ show });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "合同付款申请打印";
});

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  const { data } = await GetBuyPay({ id });
  formData.value = data || {};
  const deptDatas = [
    "部门经理",
    "商务部经理",
    "财务部经理",
    "业务分管副总",
    "业务分管副总",
    "公司总裁"
  ];
  if (data) {
    for (let i = 0; i < deptDatas.length; i++) {
      const obj = {};
      obj["deptName"] = deptDatas[i];
      if (i == 4) {
        obj["auditStatus"] = "";
        obj["auditUser"] = "";
        obj["auditTime"] = "";
        obj["auditOpinion"] = "";
      } else {
        let element = {};
        data.reviewers.forEach(ele => {
          if (ele.nodeName == deptDatas[i]) {
            element = ele;
          }
        });

        if (element["hasApproved"]) {
          obj["auditStatus"] = element["isApproved"]
            ? "审核结果：已通过"
            : "审核结果：未通过";
          obj["auditUser"] = element["reviewerName"];
          obj["auditTime"] = formatDatetime(element["approveTime"]);
          obj["auditOpinion"] =
            element["comment"] != null && element["comment"] != ""
              ? "审核意见：" + element["comment"]
              : "";
        } else {
          obj["auditStatus"] = "";
          obj["auditUser"] = "";
          obj["auditTime"] = "";
          obj["auditOpinion"] = "";
        }
      }

      reviewers.value.push(obj);
    }
  }
}

//打印
function handlePrint() {
  Print(".print-main").toPrint;
}
function formatDatetime(dt) {
  if (dt != null && dt != "") {
    return dayjs(dt).format("YYYY年MM月DD日");
  } else {
    return "";
  }
}
//关闭对话框
const beforeClose = () => {
  formVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="900"
    draggable
    @close="beforeClose"
  >
    <div class="print-main">
      <div class="title">合同付款申请单</div>
      <div class="top">
        <div>
          <el-radio-group v-model="formData.feeType">
            <el-radio label="项目">项目</el-radio>
            <el-radio label="费用">费用</el-radio>
            <el-radio label="其他">其他</el-radio>
          </el-radio-group>
        </div>
        <div>
          <el-radio-group v-model="formData.payMethod">
            <el-radio label="支票">支票</el-radio>
            <el-radio label="网银转账">网银转账</el-radio>
            <el-radio label="加急电汇">加急电汇</el-radio>
            <el-radio label="现金">现金</el-radio>
            <el-radio label="付款时间："
              >付款时间：{{ formatDatetime(formData.payTime) }}</el-radio
            >
          </el-radio-group>
        </div>
        <div class="desc">
          <span class="text">付款单位：{{ formData.payCompany }}</span>
          <span class="text"
            >申请日期：{{ formatDatetime(formData.applyTime) }}</span
          >
        </div>
      </div>
      <div class="content">
        <el-descriptions class="descriptions" :column="6" border>
          <el-descriptions-item :span="3">
            <template #label>
              <div class="cell-item">收款单位</div>
            </template>
            {{ formData.supplyName }}
          </el-descriptions-item>
          <el-descriptions-item :span="3">
            <template #label>
              <div class="cell-item">合同编号</div>
            </template>
            {{ formData.sellContractCode }}
          </el-descriptions-item>
          <el-descriptions-item :span="2" width="150">
            <template #label>
              <div class="cell-item">收款单位开户银行</div>
            </template>
            {{ formData.inBank }}
          </el-descriptions-item>
          <el-descriptions-item :span="4">
            <template #label>
              <div class="cell-item">收款单位银行账号</div>
            </template>
            {{ formData.inBankAccount }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">项目名称</div>
            </template>
            {{ formData.projectName }}
          </el-descriptions-item>
          <el-descriptions-item :span="4">
            <template #label>
              <div class="cell-item">付款用途</div>
            </template>
            {{ formData.payPurpose }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">合同金额</div>
            </template>
            ￥{{ formData.contractAmount }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">累计已付金额</div>
            </template>
            ￥{{ formData.payAmount }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">发票类型</div>
            </template>
            {{ formData.invoiceType }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">申请金额(大写)</div>
            </template>
            {{ formData.amountCHN }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">小写</div>
            </template>
            ￥{{ formData.amount }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">累计发票金额</div>
            </template>
            ￥{{ formData.invoicePayAmount }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">所属部门</div>
            </template>
            {{ formData.busiDeptName }}
          </el-descriptions-item>
          <el-descriptions-item :span="4">
            <template #label>
              <div class="cell-item">业务经办人</div>
            </template>
            {{ formData.busiStaffName }}
          </el-descriptions-item>
          <div v-for="item in reviewers" :key="item">
            <el-descriptions-item :span="2">
              <template #label>
                <div class="cell-item">
                  {{ item.deptName }}
                </div>
              </template>
              {{ item.auditUser }}
            </el-descriptions-item>
            <el-descriptions-item :span="4">
              <template #label>
                <div class="cell-item">签字日期</div>
              </template>
              {{ item.auditTime }}
              <!-- <div class="date">
                <span style="margin-right: 50px">年</span>
                <span style="margin-right: 50px">月</span>
                <span>日</span>
              </div> -->
            </el-descriptions-item>
          </div>
        </el-descriptions>
      </div>
      <div class="bottom">
        <span class="text">注：</span>
        <div>
          <span class="text"
            >1、除签字内容外，其他填写内容均为电子打印，不得手写</span
          >
          <span class="text">2、格式及需求栏目，纸张大小不得更改</span>
          <span class="text"
            >3、人民币大写为 壹 贰 叁 肆 伍 陆 柒 捌 玖 零</span
          >
        </div>
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
  padding: 30px;

  .title {
    padding: 10px 0px;
    font-size: 16px;
    color: #000;
    font-weight: bold;
    text-align: center;
  }

  .top {
    .desc {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .text {
        font-size: 14px;
        color: #000;
      }
    }
  }

  .content {
    .date {
      text-align: center;
    }
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
  .el-radio__label {
    color: #000 !important;
    font-weight: normal !important;
  }

  .el-descriptions__content.el-descriptions__cell.is-bordered-content {
    color: #000 !important;
  }

  .el-descriptions__body
    .el-descriptions__table.is-bordered
    .el-descriptions__cell {
    border: #000 1px solid !important;
  }

  .el-descriptions__label.el-descriptions__cell.is-bordered-label {
    background: transparent !important;
  }

  .cell-item {
    color: #000 !important;
    font-weight: normal !important;
  }
}
</style>
