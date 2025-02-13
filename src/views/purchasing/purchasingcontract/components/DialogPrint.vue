<script setup lang="ts">
import { ref, computed } from "vue";

import { GetJoinSign } from "@/api/purchasing";
import { useNav } from "@/layout/hooks/useNav";
import Print from "@/utils/print";
import dayjs from "dayjs";
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  title: "", //合同摘要
  hasTax: true, //是否含税
  qty: 0, //数量
  amount: 0, //合同价款小写
  amountCHN: "", //合同价款大写
  payMethod: "", //付款方式
  sellContractCode: "", //买方合同编号
  customer: "", //甲方单位
  supplyId: "", //乙方单位ID
  supplyName: "", //乙方单位名称（只读）
  supplyContractCode: "", //卖方合同编号
  attachSupplyDoc: "", //供方资信履历材料
  workAddress: "", //实施地点
  handDeptId: "", //承办部门ID
  handDeptName: "", //承办部门
  handStaffId: "", //承办人ID
  handStaffName: "", //承办人
  joinSignRemark: "",
  remark: "",
  taxRateStr: "", //税率
  supplyContractTime: "", //合同日期
  unTaxAmount: 0, //未税金额
  taxAmount: 0, //税金
  qualityMoneyTime: "", //质保金到期日
  qualityTime: "", //质保期
  unPayTime: "", //未付款到期日
  attachContract: "", //附件
  businessType: "", //业务类型（合同类型）
  businessTypeName: "",
  qualityPercent: 0, //质保比例
  reqOrderItems: [],
  reqOrderItemIds: [],
  canEditSellContractCode: false
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
  return "合同审核会签表打印";
});

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  const { data } = await GetJoinSign({ id });
  formData.value = data || {};
  const deptDatas = [
    "承办部门",
    "商务部门",
    "财务部门",
    "业务分管副总",
    "业务分管副总",
    "公司总裁"
  ];
  if (data) {
    for (let i = 0; i < deptDatas.length; i++) {
      const obj = {};
      obj["deptName"] = deptDatas[i];
      if (i < 3) {
        obj["isShowUserTime"] = true;
      } else {
        obj["isShowUserTime"] = false;
      }
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
    :width="720"
    draggable
    @close="beforeClose"
  >
    <div class="print-main">
      <div class="title">合同审核会签表</div>
      <div class="content">
        <el-descriptions class="descriptions" :column="6" border>
          <el-descriptions-item :span="6">
            <template #label>
              <div class="cell-item">合同摘要</div>
            </template>
            {{ formData.title }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">是否含税</div>
            </template>
            {{ formData.hasTax ? "含税" : "不含税" }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">数量</div>
            </template>
            {{ formData.qty }}
          </el-descriptions-item>
          <el-descriptions-item :span="2" :width="120">
            <template #label>
              <div class="cell-item">合同价款及付款方式</div>
            </template>
            {{ formData.amount }}<br />
            {{ formData.amountCHN }}<br />
            {{ formData.payMethod }}
          </el-descriptions-item>
          <el-descriptions-item :span="4">
            <template #label>
              <div class="cell-item">甲方单位</div>
            </template>
            {{ formData.companyName }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">买方合同编号</div>
            </template>
            {{ formData.sellContractCode }}
          </el-descriptions-item>
          <el-descriptions-item :span="4">
            <template #label>
              <div class="cell-item">乙方单位</div>
            </template>
            {{ formData.supplyName }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">卖方合同编号</div>
            </template>
            {{ formData.supplyContractCode }}
          </el-descriptions-item>
          <el-descriptions-item :span="4">
            <template #label>
              <div class="cell-item">
                供方单位资信履约<br />能力材料是否齐全
              </div>
            </template>
            见合同
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">实施地点</div>
            </template>
            {{ formData.workAddress }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">承办部门</div>
            </template>
            {{ formData.handDeptName }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">承办人</div>
            </template>
            {{ formData.handStaffName }}
          </el-descriptions-item>
          <el-descriptions-item :span="2">
            <template #label>
              <div class="cell-item">项目负责人</div>
            </template>
            {{ formData.busiDeptName }}
          </el-descriptions-item>
          <div v-for="item in reviewers" :key="item">
            <el-descriptions-item :span="6">
              <template #label>
                <div class="cell-item">{{ item.deptName }}意见</div>
              </template>
              <div class="opinion-item">
                <div class="opinion">
                  <span>{{ item.auditStatus }}</span>
                  <span>{{ item.auditOpinion }}</span>
                </div>
                <div class="user-time">
                  <span v-show="item.isShowUserTime" style="width: 240px"
                    >负责人：{{ item.auditUser }}</span
                  >
                  <span v-show="item.isShowUserTime"
                    >日期：{{ item.auditTime }}</span
                  >
                </div>
              </div>
            </el-descriptions-item>
          </div>
        </el-descriptions>
      </div>
      <div class="bottom">
        <span class="text"
          >注：各部门之间及与客户有关价格、设备型号、数量与技术参数等的往来文件必须有邮件或者文字性东西留存备查。</span
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
  padding: 30px;

  .title {
    padding: 10px 0px;
    font-size: 16px;
    color: #000;
    font-weight: bold;
    text-align: center;
  }

  .content {
    .opinion-item {
      display: flex;
      flex-direction: column;

      .opinion {
        display: flex;
        flex-direction: column;
      }

      .user-time {
        display: flex;
        flex-direction: row;
      }
    }
  }

  .bottom {
    display: flex;
    flex-direction: row;
    padding: 10px 10px;

    .text {
      font-size: 14px;
      color: #000;
      font-weight: 500;
      padding-right: 10px;
    }
  }
}

:deep() {
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
