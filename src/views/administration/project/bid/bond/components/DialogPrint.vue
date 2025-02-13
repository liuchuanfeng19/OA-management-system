<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { convertCurrency } from "@/utils/validate";
import Print from "@/utils/print";
import dayjs from "dayjs";

const formVisible = ref(false);
const pData = ref([]);
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "支出凭单";
});

// 子组件暴露给父组件调用的方法
const show = async _pData => {
  formVisible.value = true;
  pData.value = _pData;
};
defineExpose({ show });

//打印
function handlePrint() {
  Print(".print-main").toPrint;
}
function formatDatetime(dt, format) {
  if (dt != null && dt != "") {
    return dayjs(dt).format(format);
  } else {
    return "";
  }
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
    :width="756"
    draggable
    @close="closeDialog"
  >
    <div class="print-main">
      <div v-for="item in pData" :key="item.id" class="item">
        <div class="title">
          <span>支</span>
          <span>出</span>
          <span>凭</span>
          <span>单</span>
        </div>
        <div class="date">
          <span>{{ formatDatetime(item.applyTime, "YYYY") }}年</span>
          <span>{{ formatDatetime(item.applyTime, "MM") }}月</span>
          <span>{{ formatDatetime(item.applyTime, "DD") }}日</span>
        </div>
        <div class="content">
          <div class="jf">
            <div class="tt">
              <span>即</span>
              <span>付</span>
            </div>
            <div class="xx">{{ item.inCompany }}</div>
          </div>
          <div class="sec">
            <div class="kx">
              <div class="xx">{{ item.payMethod }}</div>
              <span class="tt">款</span>
            </div>
            <div class="bh">对方科目编号</div>
          </div>
          <div class="rmb">
            <div class="chn">
              <div class="tt">
                <span>计</span>
                <span>人</span>
                <span>民</span>
                <span>币</span>
              </div>
              <div class="xx">{{ convertCurrency(item.payAmount) }}</div>
            </div>
            <div class="num">
              <div class="tt">
                <span>￥</span>
              </div>
              <div class="xx">{{ item.payAmount }}元</div>
            </div>
          </div>
          <div class="bot">
            <div class="lkr">
              <div class="tt">
                <span>领款人</span>
              </div>
              <div class="sx" />
            </div>
            <div class="lkr">
              <div class="tt">
                <span>主管审核</span>
              </div>
              <div class="sx" />
            </div>
          </div>
        </div>
        <div class="bottom">
          <span>财务主管</span>
          <span>记账</span>
          <span>出纳</span>
          <span>审核</span>
          <span>制单</span>
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
.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 30px 150px;

  .title {
    display: flex;
    justify-content: space-around;
    width: 200px;
    padding: 10px 0;
    font-size: 16px;
    font-weight: bold;
    color: #000;
    text-align: center;
    border-bottom: #000 1px solid;
  }

  .date {
    display: flex;
    justify-content: space-around;
    width: 200px;
    padding: 10px 0;
    font-size: 14px;
    color: #000;
    text-align: center;
  }

  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 30px 40px;
    border: #000 1px solid;

    .jf {
      display: flex;
      flex-direction: row;

      .tt {
        display: flex;
        justify-content: space-between;
        width: 70px;
        font-size: 14px;
        color: #000;
      }

      .xx {
        width: 95%;
        margin-left: 5px;
        font-size: 14px;
        color: #000;
        border-bottom: #000 1px dashed;
      }
    }

    .sec {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
      margin-top: 20px;
      margin-left: 66px;

      .kx {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        width: 60%;

        .tt {
          font-size: 14px;
          color: #000;
        }

        .xx {
          width: 90%;
          font-size: 14px;
          color: #000;
          border-bottom: #000 1px dashed;
        }
      }

      .bh {
        width: 25%;
        padding: 10px 5px;
        margin-left: 20px;
        font-size: 14px;
        color: #000;
        border: #000 1px solid;
      }
    }

    .rmb {
      display: flex;
      flex-direction: row;
      width: 100%;
      margin-top: 20px;

      .chn {
        display: flex;
        flex-direction: row;
        width: 70%;

        .tt {
          width: 66px;
          font-size: 14px;
          color: #000;
        }

        .xx {
          width: 90%;
          font-size: 14px;
          color: #000;
          border-bottom: #000 1px dashed;
        }
      }

      .num {
        display: flex;
        flex-direction: row;
        width: 30%;

        .tt {
          font-size: 14px;
          color: #000;
        }

        .xx {
          width: 98%;
          font-size: 14px;
          color: #000;
          border-bottom: #000 1px dashed;
        }
      }
    }

    .bot {
      display: flex;
      flex-direction: row;
      justify-content: center;
      width: 100%;
      margin-top: 40px;

      .lkr {
        display: flex;
        flex-direction: row;
        width: 40%;

        .tt {
          font-size: 14px;
          color: #000;
        }

        .sx {
          width: 70%;
          font-size: 14px;
          color: #000;
          border-bottom: #000 1px solid;
        }
      }
    }
  }

  .bottom {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
    padding: 10px 0;
    font-size: 14px;
    color: #000;
  }
}
</style>
