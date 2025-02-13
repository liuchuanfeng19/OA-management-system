<script setup lang="ts">
import moment from "moment";
import { ref, onMounted, computed } from "vue";

import Pie from "./components/Pie.vue";
import Abnormal from "./components/Abnormal.vue";
import HolidayCard from "./components/HolidayCard.vue";
import { getMyRecordByStaff } from "@/api/attendAccRecord";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

const realWorkDays = ref(0);
const leaveItems = ref([]);
const busiTripDays = ref(0);
const extraWorkHours = ref(0);
const lateCount = ref(0);
const earlyCount = ref(0);
const forgotCount = ref(0);
const skipWorkDays = ref(0);
const lackRealWorkDays = ref(0);
const thisMonthWorkDays = ref(0);
const requestLoading = ref(true);
const date = ref(moment().format("YYYY-MM"));

const canNextMonth = computed(() => {
  return moment(date.value).month() == moment().month();
});

function getData() {
  requestLoading.value = true;
  getMyRecordByStaff({ month: date.value })
    .then(({ data }) => {
      realWorkDays.value = data?.realWorkDays;
      lackRealWorkDays.value = data?.lackRealWorkDays;
      thisMonthWorkDays.value = data?.thisMonthWorkDays;
      busiTripDays.value = data?.busiTripDays;
      extraWorkHours.value = data?.extraWorkHours;
      lateCount.value = data?.lateCount;
      earlyCount.value = data?.earlyCount;
      forgotCount.value = data?.forgotCount;
      skipWorkDays.value = data?.skipWorkDays;
      leaveItems.value = data.leaveItems || [];
    })
    .finally(() => {
      requestLoading.value = false;
    });
}

function handleRefresh() {
  getData();
}

const selectDate = (flag: string) => {
  switch (flag) {
    case "prev-year":
      date.value = moment(date.value).add(-1, "year").format("YYYY-MM");
      break;
    case "next-year":
      date.value = moment(date.value).add(1, "year").format("YYYY-MM");
      break;
    case "prev-month":
      date.value = moment(date.value).add(-1, "months").format("YYYY-MM");
      break;
    case "next-month":
      date.value = moment(date.value).add(1, "months").format("YYYY-MM");
      break;
    case "today":
      date.value = moment().format("YYYY-MM");
      break;
  }
  getData();
};

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="welcome">
    <el-card shadow="never" :body-style="{ padding: '0px' }">
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <span v-if="false" class="flex items-baseline">
              <span>考勤管理</span>
              <el-tooltip
                content="考勤规则：固定上下班09：00至18：00"
                placement="top"
                effect="dark"
              >
                <IconifyIconOffline
                  icon="questionFilled"
                  class="icon ml-1 w-[15px] h-[15px] cursor-pointer text-gray-400"
                />
              </el-tooltip>
            </span>
            <el-button-group>
              <el-button
                v-if="false"
                size="small"
                @click="selectDate('prev-year')"
              >
                上年
              </el-button>
              <el-button size="small" @click="selectDate('prev-month')">
                上月
              </el-button>
              <el-button size="small" @click="selectDate('today')"
                ><span>{{ date }}</span></el-button
              >
              <el-button
                size="small"
                :disabled="canNextMonth"
                @click="selectDate('next-month')"
              >
                下月
              </el-button>
              <el-button
                v-if="false"
                size="small"
                @click="selectDate('next-year')"
              >
                下年
              </el-button>
            </el-button-group>
            <el-button
              class="ml-[10px]"
              type="primary"
              size="small"
              :icon="useRenderIcon('refresh')"
              :loading="requestLoading"
              @click="handleRefresh"
            >
              刷新
            </el-button>
            <IconifyIconOffline
              v-if="false"
              icon="refresh"
              class="icon ml-[10px] w-[15px] h-[15px] cursor-pointer text-gray-400"
              @click="handleRefresh"
            />
          </div>
        </div>
      </template>
      <el-row :gutter="10" style="margin: 10px 5px 0">
        <!-- 出勤统计 -->
        <el-col
          v-motion
          :xs="24"
          :sm="24"
          :md="8"
          :lg="8"
          :xl="8"
          style="margin-bottom: 10px"
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
          <Pie
            :realWorkDays="realWorkDays"
            :lackRealWorkDays="lackRealWorkDays"
            :thisMonthWorkDays="thisMonthWorkDays"
          />
        </el-col>

        <!-- 异常考勤汇总 -->
        <el-col
          v-motion
          :xs="24"
          :sm="24"
          :md="16"
          :lg="16"
          :xl="16"
          style="margin-bottom: 10px"
          :initial="{
            opacity: 0,
            y: 100
          }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              delay: 400
            }
          }"
        >
          <Abnormal
            :date="date"
            :busiTripDays="busiTripDays"
            :extraWorkHours="extraWorkHours"
            :lateCount="lateCount"
            :earlyCount="earlyCount"
            :forgotCount="forgotCount"
            :skipWorkDays="skipWorkDays"
          />
        </el-col>

        <el-col
          v-for="(item, index) in leaveItems"
          :key="index"
          v-motion
          :xs="24"
          :sm="24"
          :md="6"
          :lg="6"
          :xl="6"
          style="margin-bottom: 10px"
          :initial="{
            opacity: 0,
            y: 100
          }"
          :enter="{
            opacity: 1,
            y: 0,
            transition: {
              delay: 400
            }
          }"
        >
          <HolidayCard :holidayData="item" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.welcome {
  height: 100%;

  .top-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    background: var(--el-bg-color);

    .left-mark {
      display: flex;
      align-items: center;

      img {
        display: block;
        width: 50px;
        height: 50px;
        margin-right: 10px;
        cursor: pointer;
        border-radius: 50%;
      }

      span {
        font-size: 14px;
      }
    }
  }
}
</style>
