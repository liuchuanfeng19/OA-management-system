<script setup lang="ts">
import dayjs from "dayjs";
import moment from "moment";
import { ref, reactive, watch } from "vue";
import { getMyLeaveApplyList } from "@/api/leaveApply";
import WorkCompletion from "./WorkCompletion.vue";

const props = defineProps({
  date: {
    type: String,
    default: moment().format("YYYY-MM-DD")
  },
  busiTripDays: {
    type: Number,
    default: 0
  },
  extraWorkHours: {
    type: Number,
    default: 0
  },
  lateCount: {
    type: Number,
    default: 0
  },
  earlyCount: {
    type: Number,
    default: 0
  },
  forgotCount: {
    type: Number,
    default: 0
  },
  skipWorkDays: {
    type: Number,
    default: 0
  }
});

const totalPage = ref(0);
const params = reactive({
  startTime:
    moment(props.date).month() == moment().month()
      ? moment().format("YYYY-MM-01")
      : moment(props.date).format("YYYY-MM-01"),
  endTime:
    moment(props.date).month() == moment().month()
      ? moment().format("YYYY-MM-DD")
      : moment(props.date)
          .add(1, "months")
          .add(-1, "days")
          .format("YYYY-MM-DD"),
  applyStatus: 2,
  pageIndex: 1,
  pageSize: 20
});
const tableData = ref([]);

watch(
  () => props.date,
  newVal => {
    params.startTime =
      moment(newVal).month() == moment().month()
        ? moment().format("YYYY-MM-01")
        : moment(newVal).format("YYYY-MM-01");
    params.endTime =
      moment(newVal).month() == moment().month()
        ? moment().format("YYYY-MM-DD")
        : moment(newVal).add(1, "months").add(-1, "days").format("YYYY-MM-DD");
    getData();
  },
  { immediate: false }
);

function getData() {
  getMyLeaveApplyList(params)
    .then(({ data }) => {
      tableData.value = data.data || [];
      totalPage.value = data.totalCount;
    })
    .catch(() => {
      tableData.value = [];
      totalPage.value = 0;
    })
    .finally();
}

getData();
</script>

<template>
  <el-card
    shadow="hover"
    style="height: 412px"
    :body-style="{ padding: '0px' }"
  >
    <template #header>
      <span style="font-size: 16px; font-weight: 500">异常考勤汇总</span>
    </template>
    <div class="" style="width: 100%; height: 360px">
      <el-row :gutter="0" style="margin: 0">
        <el-col
          v-motion
          :xs="24"
          :sm="24"
          :md="24"
          :lg="24"
          :xl="24"
          style="margin-bottom: 0"
          :initial="{
            opacity: 0,
            y: 100
          }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              delay: 200
            }
          }"
        >
          <el-card
            shadow="never"
            :body-style="{ padding: '0px' }"
            style="height: 360px"
          >
            <template #header>
              <el-row :gutter="0" style="margin: 0">
                <el-col
                  v-motion
                  :xs="24"
                  :sm="24"
                  :md="4"
                  :lg="4"
                  :xl="4"
                  style="margin-bottom: 0"
                  :initial="{
                    opacity: 0,
                    y: 100
                  }"
                  :enter="{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: 200
                    }
                  }"
                >
                  <WorkCompletion
                    :itemData="{
                      name: '出差',
                      value: busiTripDays,
                      unit: '天'
                    }"
                  />
                </el-col>
                <el-col
                  v-motion
                  :xs="24"
                  :sm="24"
                  :md="4"
                  :lg="4"
                  :xl="4"
                  style="margin-bottom: 0"
                  :initial="{
                    opacity: 0,
                    y: 100
                  }"
                  :enter="{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: 200
                    }
                  }"
                >
                  <WorkCompletion
                    :itemData="{
                      name: '加班',
                      value: extraWorkHours,
                      unit: '小时'
                    }"
                  />
                </el-col>
                <el-col
                  v-motion
                  :xs="24"
                  :sm="24"
                  :md="4"
                  :lg="4"
                  :xl="4"
                  style="margin-bottom: 0"
                  :initial="{
                    opacity: 0,
                    y: 100
                  }"
                  :enter="{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: 200
                    }
                  }"
                >
                  <WorkCompletion
                    :itemData="{
                      name: '迟到',
                      value: lateCount,
                      unit: '次'
                    }"
                  />
                </el-col>
                <el-col
                  v-motion
                  :xs="24"
                  :sm="24"
                  :md="4"
                  :lg="4"
                  :xl="4"
                  style="margin-bottom: 0"
                  :initial="{
                    opacity: 0,
                    y: 100
                  }"
                  :enter="{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: 200
                    }
                  }"
                >
                  <WorkCompletion
                    :itemData="{
                      name: '早退',
                      value: earlyCount,
                      unit: '次'
                    }"
                  />
                </el-col>
                <el-col
                  v-motion
                  :xs="24"
                  :sm="24"
                  :md="4"
                  :lg="4"
                  :xl="4"
                  style="margin-bottom: 0"
                  :initial="{
                    opacity: 0,
                    y: 100
                  }"
                  :enter="{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: 200
                    }
                  }"
                >
                  <WorkCompletion
                    :itemData="{
                      name: '漏签',
                      value: forgotCount,
                      unit: '次'
                    }"
                  />
                </el-col>
                <el-col
                  v-motion
                  :xs="24"
                  :sm="24"
                  :md="4"
                  :lg="4"
                  :xl="4"
                  style="margin-bottom: 0"
                  :initial="{
                    opacity: 0,
                    y: 100
                  }"
                  :enter="{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: 200
                    }
                  }"
                >
                  <WorkCompletion
                    :itemData="{
                      name: '矿工',
                      value: skipWorkDays,
                      unit: '天'
                    }"
                  />
                </el-col>
              </el-row>
            </template>
            <el-table
              border
              :data="tableData"
              :height="209"
              highlight-current-row
            >
              <el-table-column
                type="index"
                width="60"
                align="center"
                label="序号"
                fixed="left"
              />
              <el-table-column
                prop="leaveTypeName"
                label="请假类型"
                align="center"
                width="100"
              />
              <el-table-column
                prop="startTime"
                label="开始时间"
                :formatter="
                  ({ startTime }) => {
                    return dayjs(startTime).hour() == 0
                      ? dayjs(startTime).format('YYYY-MM-DD') + '上午'
                      : dayjs(startTime).format('YYYY-MM-DD') + '下午';
                  }
                "
                width="150"
              />
              <el-table-column
                prop="endTime"
                label="结束时间"
                :formatter="
                  ({ endTime }) => {
                    return dayjs(endTime).hour() == 0
                      ? dayjs(endTime).format('YYYY-MM-DD') + '上午'
                      : dayjs(endTime).format('YYYY-MM-DD') + '下午';
                  }
                "
                width="150"
              />
              <el-table-column
                prop="totalDays"
                label="总计天数"
                width="90"
                align="right"
              />
              <el-table-column prop="applyTime" label="申请时间" width="160" />
              <el-table-column
                prop="applyReason"
                label="申请理由"
                show-overflow-tooltip
                width="200"
              />
              <el-table-column
                prop="cancelReason"
                label="取消理由"
                show-overflow-tooltip
                width="200"
              />
              <el-table-column
                fixed="right"
                align="center"
                prop="applyStatusExpr"
                label="申请状态"
                width="100"
              />
              <template #empty>
                <el-empty :image-size="40" description="暂无请假信息" />
              </template>
            </el-table>
            <el-pagination
              v-model:current-page="params.pageIndex"
              v-model:page-size="params.pageSize"
              class="flex justify-end mt-4 mr-5"
              :page-sizes="[10, 20, 30, 50, 100, 200]"
              :background="true"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalPage"
              @size-change="getData"
              @current-change="getData"
            />
          </el-card>
        </el-col>
        <el-col
          v-if="false"
          v-motion
          :xs="24"
          :sm="24"
          :md="4"
          :lg="4"
          :xl="4"
          style="margin-bottom: 0"
          :initial="{
            opacity: 0,
            y: 100
          }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              delay: 200
            }
          }"
        >
          <el-card
            shadow="never"
            style="height: 360px"
            :body-style="{ padding: '0px' }"
          >
            <div class="flex flex-col justify-center" style="height: 360px">
              <div class="flex justify-around mb-4">
                <span class="flex-1 text-right mr-5">10</span>
                <span class="w-[90px]">迟到</span>
              </div>
              <div v-if="false" class="flex justify-around mb-4">
                <span class="flex-1 text-right mr-5">22</span>
                <span class="w-[90px]">严重迟到</span>
              </div>
              <div class="flex justify-around mb-4">
                <span class="flex-1 text-right mr-5">123</span>
                <span class="w-[90px]">早退</span>
              </div>
              <div v-if="false" class="flex justify-around mb-4">
                <span class="flex-1 text-right mr-5">1234</span>
                <span class="w-[90px]">严重早退</span>
              </div>
              <div class="flex justify-around mb-4">
                <span class="flex-1 text-right mr-5">0</span
                ><span class="w-[90px]">旷工</span>
              </div>
              <div class="flex justify-around mb-4">
                <span class="flex-1 text-right mr-5">0</span
                ><span class="w-[90px]">漏签</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-card__header) {
  box-sizing: border-box;
  padding: calc(var(--el-card-padding) - 6px) var(--el-card-padding);
  border-bottom: 1px solid var(--el-card-border-color);
}
</style>
