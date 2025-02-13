<script setup lang="ts">
import _ from "lodash";
import dayjs from "dayjs";
import { ref, computed } from "vue";

import Print from "@/utils/print";
import { getFundApply } from "@/api/fundApply";

/**
 * 打印容器分辨率宽度：1123px
 * 打印容器分辨率高度：794px
 * 打印容器内边距：30px
 * 打印容器内容：打印容器分辨率宽度-打印容器内边距*2=1063px
 */

const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  staffName: "",
  mobile: "",
  companyId: "",
  companyName: "",
  deptId: "",
  deptName: "",
  applyReason: "",
  cancelReason: "",
  applyTime: "",
  applyFundDate: dayjs().format("YYYY-MM-DD"),
  applyDate: "",
  applyStatus: 0,
  applyStatusExpr: "",
  ccs: [],
  canTemp: true,
  canApprove: true,
  canReject: true,
  canCancel: true,
  canReturnBack: true,
  canEdit: true,
  canDel: true,
  busiType: "",
  doTemp: true,
  comment1: "",
  reviewers: [],
  reviewersShow: [],
  abCurrentStaffApproveResult: true,
  fundNature: 1,
  applyCompanyId: "",
  applyCompanyName: "",
  agentId: "",
  agent: "",
  amount: 0,
  amountCN: "",
  remark: "",
  fundPayRecordList: []
};

const formData = ref(null);
const formVisible = ref(false);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "打印备用金/专项资金";
});

// 子组件暴露给父组件调用的方法
const show = async _formData => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  await getDetail(_formData.id);
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  const { data } = await getFundApply({ id });
  formData.value = data || {};
}

//打印
function handlePrint() {
  Print(".print-main").toPrint;
}
function formatDatetime(dt, format) {
  return dayjs(dt).format(format);
}
//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="834"
    draggable
    @close="closeDialog"
  >
    <div
      class="flex flex-col items-center print-main relative p-[30px] pl-[54px]"
    >
      <div
        class="w-[200px] pt-[10px] pb-[4px] border-solid border-b-[1.5px] border-black text-3xl text-black font-semibold text-center font-mono flex justify-evenly"
      >
        <span>借</span>
        <span>款</span>
        <span>单</span>
      </div>
      <div class="w-[100%] flex justify-between my-[6px]">
        <div class="flex ml-5">
          <div class="">资金性质</div>
          <div class="w-[200px] border-solid border-b-[1px] border-black pl-2">
            {{ formData.fundNature == 1 ? "因公" : "因项目" }}
          </div>
        </div>
        <div
          class="w-[200px] text-sm text-black text-center flex justify-around"
        >
          <span>{{ formatDatetime(formData.applyFundDate, "YYYY") }}年</span>
          <span>{{ formatDatetime(formData.applyFundDate, "MM") }}月</span>
          <span>{{ formatDatetime(formData.applyFundDate, "DD") }}日</span>
        </div>
      </div>
      <div
        class="w-[100%] flex flex-col border-solid border-black border-[1.5px]"
      >
        <div class="pl-3 py-3 border-solid border-black border-b-[1px]">
          借款单位：{{ formData.applyCompanyName }}
        </div>
        <div class="pl-3 py-3 border-solid border-black border-b-[1px]">
          借款理由：{{ formData.applyReason }}
        </div>
        <div
          class="pl-3 py-3 border-solid border-black border-b-[1px] flex justify-between"
        >
          <div>借款数额：人民币（大写）{{ formData.amountCN }}</div>
          <div class="flex">
            <div>￥</div>
            <div class="w-[150px]">{{ formData.amount }}</div>
          </div>
        </div>
        <div
          class="pl-3 py-3 border-solid border-black border-b-[1px] flex justify-between"
        >
          <div class="flex-1">本单位负责人意见{{ formData.inCompany }}</div>
          <div class="flex-1">借款人（签章）</div>
        </div>
        <div class="flex justify-around">
          <div class="flex-1 flex border-solid border-black border-r-[1px]">
            <div
              class="flex-1 flex justify-start pl-3 py-3 border-solid border-black border-r-[1px]"
            >
              机关首长批示：
            </div>
            <div class="flex-1 pl-3 py-3">会计主管人员核批：</div>
          </div>
          <div class="flex flex-1 flex-col pl-3 py-3">
            <p class="mb-2">付款记录：</p>
            <p class="flex mb-2">
              <span class="">
                <span class="pl-10 text-center">&nbsp;</span>年
                <span class="pl-10 text-center">&nbsp;</span>月
                <span class="pl-10 text-center">&nbsp;</span>日
              </span>
              以第
              <span class="pl-10 text-center">&nbsp;</span>
              号
            </p>
            <p class="pl-11">
              支票或现金支出凭单付给<span class="pl-5 text-center">&nbsp;</span>
            </p>
          </div>
        </div>
      </div>
      <div
        class="w-[343px] flex justify-evenly absolute -left-[130px] top-[250px] rotate-90"
      >
        <div>两式-107</div>
        <div>12x21厘米</div>
      </div>
    </div>
    <template #footer>
      <el-button @click="formVisible = false"> 取消 </el-button>
      <el-button type="success" @click="handlePrint">打印 </el-button>
    </template>
  </el-dialog>
</template>
