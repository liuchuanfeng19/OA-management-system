<script lang="ts">
export default {
  name: "ProjectAttendanceDetail"
};
</script>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, reactive, onMounted, nextTick } from "vue";
import { GetDetialList } from "@/api/projAttend";
import { TableProBar } from "@/components/ReTable";
import { FormInstance } from "element-plus";

import _ from "lodash";

import { emitter } from "@/utils/mitt";

const route = useRoute();
//staffid值，用于详情页请求字表接口
const id = route.query?.id;
const proTitle = route.query?.proTitle;
// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryFormData = reactive({
  id: id
});
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const tableHeight = ref(0);
const maxItemNum = ref(1);
const columnList = ref([]);
const leaveList = ref([]);

const formLoading = ref(false);
const loading = ref(false);
const projAttendList = ref([]);
const handleBack = () => {
  emitter.emit("closeTag", {
    routeName: route.name as string,
    query: route.query,
    targetPath: "/personnel/attendance/projectAttendance"
  });
};

// 获取详情列表
async function onSearch() {
  loading.value = true;
  const { data } = await GetDetialList(queryFormData);
  projAttendList.value = data || [];
  if (projAttendList.value.length > 0) {
    projAttendList.value.map(aitem => {
      columnList.value = aitem.dateItems || [];
      leaveList.value = aitem.leaveItems || [];
    });
  }
  loading.value = false;
}

// 设置表格组件高度
const setTableHeight = () => {
  nextTick(() => {
    maxItemNum.value =
      (ruleFormRef.value.$el.clientWidth -
        8 -
        32 -
        ruleFormRef.value.$el.children[
          ruleFormRef.value.$el.children.length - 1
        ].clientWidth) /
      (ruleFormRef.value.$el.children[0].clientWidth + 32);
    maxItemNum.value = Math.floor(maxItemNum.value);
    tableHeight.value =
      window.innerHeight - ruleFormRef.value.$el.clientHeight - 100;
  });
};

// mounted周期函数
onMounted(async () => {
  if (id) {
    onSearch();
  }
  nextTick(() => {
    setTableHeight();
  });
});
// 窗口尺寸改变事件回调
window.onresize = function () {
  console.log("onresize");
  nextTick(() => {
    setTableHeight();
  });
};
</script>

<template>
  <el-form ref="ruleFormRef" v-loading="formLoading" label-width="112px">
    <TableProBar
      :title="proTitle"
      :loading="loading"
      :dataList="projAttendList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="primary" :loading="loading" @click="handleBack">
          返回
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          border
          :height="tableHeight"
          :select-on-indeterminate="false"
          :size="size"
          :data="projAttendList"
          highlight-current-row
          row-key="path"
        >
          <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            label="序号"
            align="center"
            width="60"
          />
          <el-table-column
            label="姓名"
            fixed="left"
            align="center"
            width="70"
            prop="attStaffName"
          />
          <el-table-column
            v-for="(item, idx) in columnList"
            :key="item.id"
            :label="item.dateName"
            width="45"
            align="center"
          >
            <el-table-column
              :label="item.weekDayName"
              width="45"
              align="center"
            >
              <template #default="{ row }">
                <span>{{ row.dateItems[idx].mark }}</span>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column
            label="实际出勤"
            width="45"
            align="center"
            prop="realWorkDays"
            show-overflow-tooltip
          />
          <el-table-column
            label="公差"
            width="45"
            align="center"
            prop="busiTripDays"
            show-overflow-tooltip
          />
          <el-table-column label="加班">
            <el-table-column
              label="工作日"
              width="45"
              align="center"
              prop="normalExtraHours"
              show-overflow-tooltip
            />
            <el-table-column
              label="周末"
              width="45"
              align="center"
              prop="weekendExtraHours"
              show-overflow-tooltip
            />
            <el-table-column
              label="节假日"
              width="45"
              align="center"
              prop="festivalExtraHours"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column label="缺勤天数">
            <el-table-column
              label="法定休息日"
              width="45"
              align="center"
              prop="legalRestDays"
              show-overflow-tooltip
            />
            <el-table-column
              label="旷工"
              width="45"
              align="center"
              prop="skipWorkDays"
              show-overflow-tooltip
            />
            <el-table-column
              v-for="(item, idx) in leaveList"
              :key="item.id"
              :label="item.leaveTypeName"
              min-width="45"
              align="center"
            >
              <template #default="{ row }">
                <span>{{ row.leaveItems[idx].totalValue }}</span>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column
            label="地区补助合计"
            align="center"
            width="60"
            prop="areaHelpAmount"
          />
          <el-table-column
            label="售后维保出勤天数合计"
            align="center"
            width="60"
            prop="afterSellDays"
          />
          <el-table-column
            label="现场工程出勤天数合计"
            align="center"
            width="60"
            prop="projWorkDays"
          />

          <el-table-column
            label="备注"
            align="left"
            width="150"
            show-overflow-tooltip
            prop="remark"
          />

          <template #empty>
            <el-empty :image-size="50" style="height: 150px" />
          </template>
        </el-table>
        <div style=" margin-top: 8px; font-size: 12px;background-color: white">
          <span
            >注：出勤√ 外地出差△ 出差半天▲ 法定休息日:休 调休◎ 调休半天※ 年假★
            年假半天☆ 事假○ 请假半天⊙ 病假■ 病假半天□ 婚假♥ 产假☺ 护理假♡
            丧假● 旷工× 工伤♣ 在途 途 漏打卡Ψ 迟到早退$ 入职标记► 试用期结束◄
            离职标记✘ 待岗∞</span
          >
        </div>
      </template>
    </TableProBar>
  </el-form>
</template>
<style lang="scss" scoped>
.el-col-5 {
  width: 10%;
  padding-right: 0 !important;
  padding-left: 0 !important;
}

.header-container {
  display: flex;
  justify-content: space-between;
  padding: 24px 12px 16px;

  .header-container-button {
    flex-direction: row-reverse;
  }
}
</style>
