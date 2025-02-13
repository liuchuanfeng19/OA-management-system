<script setup lang="ts">
import { ref } from "vue";
import moment from "moment";

import Print from "@/utils/print";
import { getProjCredit } from "@/api/projRegister";

/**
 * 打印容器分辨率宽度：1123px
 * 打印容器分辨率高度：794px
 * 打印容器内边距：30px
 * 打印容器内容：打印容器分辨率宽度-打印容器内边距*2=1063px
 */

interface CreditCertificationModel {
  reqCompany: string;
  applyTime: string;
  oppCompany: string;
  projectFullName: string;
  planTime: string;
  specialReq: string;
  busiStaffName: string;
  finaStaffName: string;
  remark: string;
  reviewers: Array<any>;
}

const reviewers = ref([]);
const dialogVisible = ref(false);
const requestLoading = ref(false);
const printData = ref<CreditCertificationModel>();

const show = data => {
  dialogVisible.value = true;
  getDetail(data.id);
};

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  requestLoading.value = true;
  const { data } = await getProjCredit({ id });
  printData.value = data || {};
  reviewers.value = data.reviewers || [];
  requestLoading.value = false;
}

function getAuditor(nodeName) {
  const auditNode =
    reviewers.value.find(item => item.nodeName == nodeName) || {};
  console.log(nodeName, auditNode);
  return auditNode.reviewerName;
}

function handleSure() {
  Print(".print-content").toPrint;
}

defineExpose({ show });
</script>

<template>
  <el-dialog v-model="dialogVisible" title="打印资信证明" :width="800">
    <div class="print-content w-full p-[30px]">
      <el-descriptions class="mb-0" title="With border" :column="2" border>
        <template #title>
          <div class="text-center text-black font-bold text-base">
            银行函件开具申请单
          </div>
          <div class="text-left text-black font-normal text-sm pt-2 pb-2">
            函件类型：1、资信证明：
          </div>
          <div
            class="flex border-solid border-black border-[1px] border-b-0 text-sm"
          >
            <div
              class="cell-item w-[140px] p-[10px] border-solid border-black border-r-[1px] text-center"
            >
              申请单位：
            </div>
            <div
              class="cell-item flex-1 p-[10px] border-solid border-black border-r-[1px] text-center"
            >
              {{ printData?.reqCompany }}
            </div>
            <div
              class="cell-item w-[340px] p-[10px] border-solid border-black border-r-0 text-center"
            >
              申请日期：{{
                moment(printData?.applyTime).format("YYYY年MM月DD日")
              }}
            </div>
          </div>
        </template>
        <el-descriptions-item
          align="center"
          :span="2"
          label-class-name="descriptions-item-label"
        >
          <template #label>
            <div class="cell-item">对方公司：</div>
          </template>
          {{ printData?.oppCompany }}
        </el-descriptions-item>
        <el-descriptions-item
          align="center"
          :span="2"
          label-class-name="descriptions-item-label"
        >
          <template #label>
            <div class="cell-item">项目或合同名称：</div>
          </template>
          {{ printData?.projectFullName }}
        </el-descriptions-item>
        <el-descriptions-item
          align="center"
          :span="2"
          label-class-name="descriptions-item-label"
        >
          <template #label>
            <div class="cell-item">预期日期：</div>
          </template>
          {{ moment(printData?.planTime).format("YYYY年MM月DD日") }}前提供
        </el-descriptions-item>
        <el-descriptions-item
          align="center"
          :span="2"
          label-class-name="descriptions-item-label"
        >
          <template #label>
            <div class="cell-item">其它特殊要求：</div>
          </template>
          <div class="text-center">{{ printData?.specialReq }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions
        class="mb-3 mt-[0px]"
        title="With border"
        :column="2"
        border
      >
        <template #title>
          <div class="bg-gray-300 mb-[0.5px]">
            <div
              class="cell-item p-[10px] border-solid border-black border-[1px] border-t-0 text-sm text-center"
            >
              （资信证明不需要填写灰色部分）
            </div>
            <div
              class="flex border-solid border-black border-[1px] border-t-0 text-sm"
            >
              <div
                class="cell-item w-[140px] p-[10px] border-solid border-black border-r-[1px] text-center"
              >
                合同金额：
              </div>
              <div
                class="cell-item flex-1 p-[10px] border-solid border-black border-r-[0px] text-center"
              >
                &nbsp;
              </div>
              <div
                class="cell-item w-[340px] p-[10px] border-solid border-black border-r-0 text-left"
              >
                比例：
              </div>
            </div>
            <div
              class="flex border-solid border-black border-[1px] border-t-0 text-sm"
            >
              <div
                class="cell-item w-[140px] p-[10px] border-solid border-black border-r-[1px] text-center"
              >
                保函金额大写：
              </div>
              <div
                class="cell-item flex-1 p-[10px] border-solid border-black border-r-[0px] text-center"
              >
                &nbsp;
              </div>
              <div
                class="cell-item w-[340px] p-[10px] border-solid border-black border-r-0 text-left"
              >
                金额小写：
              </div>
            </div>
            <div
              class="flex border-solid border-black border-[1px] border-y-0 text-sm"
            >
              <div
                class="cell-item w-[140px] p-[10px] border-solid border-black border-r-[1px] text-center"
              >
                保函期限：
              </div>
              <div
                class="cell-item flex-1 p-[10px] border-solid border-black border-r-[0px] text-center"
              >
                &nbsp;
              </div>
            </div>
          </div>
        </template>
        <el-descriptions-item
          align="center"
          :span="2"
          label-class-name="descriptions-item-label"
        >
          <template #label>
            <div class="cell-item">业务申请人：</div>
          </template>
          <div class="flex justify-between">
            <div class="flex-1 text-left">{{ printData?.busiStaffName }}</div>
            <div class="flex-1 cell-item text-left">
              部门经理审核：{{ printData ? getAuditor("部门经理审核") : "" }}
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item
          align="center"
          :span="2"
          label-class-name="descriptions-item-label"
        >
          <template #label>
            <div class="cell-item">财务经理审核：</div>
          </template>
          <div class="flex justify-between">
            <div class="flex-1 cell-item text-left">
              {{ printData ? getAuditor("财务经理审核") : "" }}
            </div>
            <div class="flex-1 cell-item text-left">
              财务经办人：{{ printData?.finaStaffName }}
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>
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
  .el-descriptions__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 0;
  }

  .el-descriptions__title {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .descriptions-item-label {
    width: 140px;
    background-color: transparent !important;
  }

  .el-descriptions__content.el-descriptions__cell.is-bordered-content {
    color: #000 !important;
  }

  .el-descriptions__body
    .el-descriptions__table.is-bordered
    .el-descriptions__cell {
    border: #000 1px solid !important;
  }

  .cell-item {
    font-weight: normal !important;
    color: #000 !important;
  }
}
</style>
