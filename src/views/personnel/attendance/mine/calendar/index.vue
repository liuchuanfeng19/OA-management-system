<script setup lang="ts">
import moment from "moment";
import { ElMessage } from "element-plus";
import { ref, onMounted, watch, computed } from "vue";

import {
  getAttendanceQuickByStaff,
  getAttendRecordStaffBusiTypeNV
} from "@/api/attendAccRecord";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { createAttend, getAttendRecordCur } from "@/api/attendance";

type attendance = {
  attAmTime: string;
  attCompanyName: string;
  attDeptName: string;
  attPmTime: string;
  attStaffId: string;
  attStaffName: string;
  attStandAmTime: string;
  attStandPmTime: string;
  hasAmException: boolean;
  hasPmException: boolean;
  hasAmTime: boolean;
  hasPmTime: boolean;
};

const attendanceData = ref<attendance>({
  attAmTime: "",
  attCompanyName: "",
  attDeptName: "",
  attPmTime: "",
  attStaffId: "",
  attStaffName: "",
  attStandAmTime: "",
  attStandPmTime: "",
  hasAmException: false,
  hasPmException: false,
  hasAmTime: false,
  hasPmTime: false
});
const calendar = ref();
const stepsActive = ref(0);
const calendarData = ref([]);
const staffBusiTypeList = ref([]);
const currentMonth = ref(new Date());
const stepsAMStatus = ref("wait");
const stepsPMStatus = ref("wait");
const requestLoading = ref(true);

const canNextMonth = computed(() => {
  return moment(currentMonth.value).month() == moment().month();
});

watch(currentMonth, _newVal => {
  getData();
});

function getData() {
  getTodayData();
  getCalendarData();
}

function getAttendRecordStaffBusiType() {
  getAttendRecordStaffBusiTypeNV()
    .then(({ data }) => {
      staffBusiTypeList.value = data || [];
    })
    .catch(() => {
      staffBusiTypeList.value = [];
    })
    .finally(() => {
      getData();
    });
}

/**
 * 获取当天打卡数据
 */
function getTodayData() {
  getAttendRecordCur({
    attDate: moment(currentMonth.value).format("YYYY-MM-DD")
  }).then(({ data }) => {
    attendanceData.value = data || {};
    if (!attendanceData.value.hasAmTime) {
      stepsActive.value = 0;
    } else if (
      attendanceData.value.hasAmTime &&
      !attendanceData.value.hasPmTime
    ) {
      stepsActive.value = 1;
    } else if (
      attendanceData.value.hasAmTime &&
      attendanceData.value.hasPmTime
    ) {
      stepsActive.value = 2;
    }

    stepsAMStatus.value = attendanceData.value.hasAmTime
      ? attendanceData.value.hasAmException
        ? "error"
        : "success"
      : "wait";
    stepsPMStatus.value = attendanceData.value.hasPmTime
      ? attendanceData.value.hasPmException
        ? "error"
        : "success"
      : "wait";

    console.log("stepsActive", stepsActive.value);
    console.log("stepsAMStatus", stepsAMStatus.value);
    console.log("stepsPMStatus", stepsPMStatus.value);
  });
}

/**
 * 获取指定月份考勤数据
 */
function getCalendarData() {
  requestLoading.value = true;
  getAttendanceQuickByStaff({
    month: moment(currentMonth.value).format("YYYY-MM")
  })
    .then(({ data }) => {
      calendarData.value = data || [];
    })
    .finally(() => {
      requestLoading.value = false;
    });
}

const selectDate = (val: string) => {
  calendar.value.selectDate(val);
};

function getDayData(data) {
  if (calendarData.value) {
    const matchedData = calendarData.value.find(item => {
      return moment(item.day).format("YYYY-MM-DD") == data.day;
    });
    if (matchedData) {
      let busiTypes = matchedData.busiTypeNames || [];
      busiTypes = busiTypes.filter(item => item.value != 2 && item.value != 3);
      // console.log("busiTypes", busiTypes);
      const groupBusiTypes = [];
      busiTypes.forEach(element => {
        // debugger;
        if (element.value == 1) {
          groupBusiTypes.push({ ...element, children: [element] });
        } else if (element.value >= 11 && element.value <= 15) {
          const obj = groupBusiTypes.find(
            item => item.value >= 11 && item.value <= 15
          );
          if (obj) {
            obj.children.push(element);
          } else {
            groupBusiTypes.push({ ...element, children: [element] });
          }
        } else if (element.value >= 20 && element.value <= 22) {
          const obj = groupBusiTypes.find(
            item => item.value >= 20 && item.value <= 22
          );
          if (obj) {
            obj.children.push(element);
          } else {
            groupBusiTypes.push({ ...element, children: [element] });
          }
        }
      });
      // console.log("groupBusiTypes", groupBusiTypes);
      return {
        busiTypes,
        groupBusiTypes
      };
    } else {
      return {
        busiTypes: [],
        groupBusiTypes: []
      };
    }
  } else {
    return {
      busiTypes: [],
      groupBusiTypes: []
    };
  }
}

function handleRefresh() {
  getData();
}

function handleClockIn() {
  createAttend({
    id: undefined,
    attType: stepsActive.value == 0 ? 1 : 2, //考勤类型 1-上班 2-下班
    attAddress: "", //打卡地址
    attIP: window.location.host, //IP地址
    attFrom: "网页", //打卡方式
    attDeviceCode: "", //设备识别码
    longitude: 0, //经度
    latitude: 0, //纬度
    remark: "", //备注
    wifiMacAddress: "" //wifiMac地址
  }).then(({ code, message }) => {
    if (code == 0) {
      ElMessage.success(message);
      getData();
    }
  });
}

onMounted(() => {
  getAttendRecordStaffBusiType();
});
</script>

<template>
  <div class="flex flex-col h-[380px]">
    <div class="flex-1">
      <el-calendar ref="calendar" v-model="currentMonth">
        <template #header="{ date }">
          <div class="w-[100%] flex justify-between items-center">
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

            <div class="legend flex flex-wrap justify-end text-xs">
              <div class="legend-item flex flex-wrap items-center">
                <div class="indicator normal" />
                <div class="name">正常</div>
              </div>
              <div
                v-if="false"
                class="legend-item flex flex-wrap items-center ml-2"
              >
                <div class="indicator info" />
                <div class="name">迟到/早退</div>
              </div>
              <div class="legend-item flex flex-wrap items-center ml-2">
                <div class="indicator warning" />
                <div class="name">异常：迟到、早退、缺卡等</div>
              </div>
              <div class="legend-item flex flex-wrap items-center ml-2">
                <div class="indicator danger" />
                <div class="name">申请：请假、加班、出差等</div>
              </div>
            </div>
          </div>
        </template>
        <template #date-cell="{ data }">
          <template v-if="getDayData(data).groupBusiTypes.length > 0">
            <el-tooltip placement="top" effect="dark">
              <div class="h-[34px] flex flex-col items-center justify-center">
                <p>{{ data.day.split("-").slice(2).join("-") }}</p>
                <div class="flex">
                  <div
                    v-for="(item, index) in getDayData(data).groupBusiTypes"
                    :key="index"
                    class="indicator"
                    :class="{
                      'is-selected': false,
                      normal: item.value == 1,
                      info: false,
                      warning: item.value >= 11 && item.value <= 15,
                      danger: item.value >= 20 && item.value <= 22
                    }"
                  />
                </div>
              </div>
              <template #content>
                <p>
                  <span
                    v-for="(item, index) in getDayData(data).busiTypes"
                    :key="index"
                  >
                    {{ item.name
                    }}{{
                      index != getDayData(data).busiTypes.length - 1 ? "、" : ""
                    }}
                  </span>
                </p>
              </template>
            </el-tooltip>
          </template>
          <div
            v-else
            class="h-[34px] flex flex-col items-center justify-center"
          >
            <p>{{ data.day.split("-").slice(2).join("-") }}</p>
          </div>
        </template>
      </el-calendar>
    </div>

    <el-steps
      v-if="false"
      class="mt-0"
      :active="stepsActive"
      align-center
      simple
    >
      <el-step :status="stepsAMStatus">
        <template #icon>
          <div
            class="flex justify-center items-center text-xs w-[16px] h-[16px] rounded-lg"
          >
            <FontIcon
              :icon="
                stepsActive > 0
                  ? 'icon-shangban'
                  : stepsActive == 0
                    ? 'icon-a-shangbanweidaka'
                    : ''
              "
            />
          </div>
        </template>
        <template #title>
          <div class="ml-1 text-sm" style="line-height: 24px">
            <p>上班时间 {{ attendanceData.attStandAmTime }}</p>
            <p v-if="stepsActive > 0">
              打卡时间 {{ moment(attendanceData.attAmTime).format("HH:mm") }}
            </p>
            <template
              v-if="
                moment().date() == moment(currentMonth).date() &&
                stepsActive == 0
              "
            >
              <el-button
                v-if="
                  moment(
                    moment().format('YYYY-MM-DD') +
                      ' ' +
                      attendanceData.attStandAmTime
                  ).diff(moment(), 'minutes') >= 0
                "
                type="primary"
                size="small"
                @click="handleClockIn"
              >
                打卡
              </el-button>
              <el-popconfirm
                v-if="
                  moment(
                    moment().format(
                      'YYYY-MM-DD' + ' ' + attendanceData.attStandAmTime
                    )
                  ).diff(moment(), 'minutes') < 0
                "
                title="现在是非正常上班时间，确定要打卡吗？"
                confirmButtonText="确定"
                cancelButtonText="取消"
                confirmButtonType="primary"
                cancelButtonType="text"
                icon="el-icon-question"
                iconColor="#f90"
                :hideIcon="false"
                @confirm="handleClockIn"
              >
                <template #reference>
                  <el-button type="primary" size="small"> 打卡 </el-button>
                </template>
              </el-popconfirm>
            </template>
          </div>
        </template>
      </el-step>
      <el-step :status="stepsPMStatus">
        <template #icon>
          <div
            class="flex justify-center items-center text-xs w-[16px] h-[16px] rounded-lg"
          >
            <FontIcon
              :icon="
                stepsActive == 0
                  ? 'icon-a-xiabanweidaka'
                  : stepsActive == 1
                    ? 'icon-xiaban'
                    : stepsActive == 2
                      ? 'icon-xiaban'
                      : ''
              "
            />
          </div>
        </template>
        <template #title>
          <div class="ml-1 text-sm" style="line-height: 24px">
            <p>下班时间 {{ attendanceData.attStandPmTime }}</p>
            <p v-if="stepsActive == 2">
              打卡时间 {{ moment(attendanceData.attPmTime).format("HH:mm") }}
            </p>
            <template
              v-if="
                moment().date() == moment(currentMonth).date() &&
                stepsActive == 1
              "
            >
              <el-button
                v-if="
                  moment(
                    moment().format('YYYY-MM-DD') +
                      ' ' +
                      attendanceData.attStandPmTime
                  ).diff(moment(), 'minutes') <= 0
                "
                type="primary"
                size="small"
                @click="handleClockIn"
              >
                打卡
              </el-button>
              <el-popconfirm
                v-if="
                  moment(
                    moment().format('YYYY-MM-DD') +
                      ' ' +
                      attendanceData.attStandPmTime
                  ).diff(moment(), 'minutes') > 0
                "
                title="现在是非正常下班时间，确定要打卡吗？"
                confirmButtonText="确定"
                cancelButtonText="取消"
                confirmButtonType="primary"
                cancelButtonType="text"
                icon="el-icon-question"
                iconColor="#f90"
                :hideIcon="false"
                @confirm="handleClockIn"
              >
                <template #reference>
                  <el-button type="primary" size="small"> 打卡 </el-button>
                </template>
              </el-popconfirm>
            </template>
          </div>
        </template>
      </el-step>
    </el-steps>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-calendar) {
  --el-calendar-cell-width: 36px;
}

:deep(.el-calendar-table) {
  width: 100%;
  font-size: 14px;
  table-layout: fixed;
}

:deep(.el-calendar-table thead th) {
  padding: 0 0 12px;
  font-weight: 400;
  color: var(--el-text-color-regular);
}

:deep(.el-calendar__header) {
  // line-height: 24px;
  // display: none;
  // padding: 8px 0px;
  // border-bottom: 1px solid var(--el-card-border-color);
  box-sizing: border-box;
  // padding: 0px 0px 16px;
  height: var(--el-tabs-header-height);
}

:deep(.el-calendar__body) {
  // padding: 12px 0px 12px;
}

:deep(.el-calendar-table td) {
  text-align: center;
  vertical-align: middle;
  border-right: var(--el-calendar-border);
  border-bottom: var(--el-calendar-border);
  transition: background-color var(--el-transition-duration-fast) ease;
}

:deep(.el-calendar-table .el-calendar-day) {
  position: relative;
  box-sizing: border-box;
  // height: var(--el-calendar-cell-width);
  height: auto;
  padding: 10px;
  // height: 0;
  // padding-bottom: 100%;
  // p {
  //   width: 100%;
  //   height: 100%;
  //   position: absolute;
  //   display: flex;
  //   justify-content: center;
  //   align-items: center;
  // }
}

:deep(.el-step.is-simple .el-step__main) {
  position: relative;
  display: flex;
  flex-grow: initial;
  align-items: stretch;
}

:deep(.el-step.is-simple .el-step__arrow) {
  display: none;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
}

:deep(.el-step.is-simple) {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  &:first-of-type {
    justify-content: flex-start;
  }
}

:deep(.el-steps--simple) {
  padding: 0;
  background: transparent;
  border-radius: 4px;
}

:deep(.el-step.is-simple .el-step__title) {
  font-size: 14px;
  line-height: 20px;
}

:deep(.el-step.is-simple:not(:last-of-type) .el-step__title) {
  max-width: 100%;
  word-break: break-all;
}

:deep(.el-step.is-simple .el-step__head) {
  width: auto;
  padding-right: 4px;
  font-size: 0;
}

.is-selected {
  color: #1989fa;
}

.normal {
  background-color: var(--el-color-primary);
  // color: var(--el-text-color-regular);
}

.info {
  background-color: var(--el-color-info);
  // color: var(--el-text-color-regular);
}

.warning {
  background-color: var(--el-color-warning);
  // color: var(--el-text-color-regular);
}

.danger {
  background-color: var(--el-color-danger);
  // color: var(--el-text-color-regular);
}

.indicator {
  width: 6px;
  height: 6px;
  margin-right: 3px;
  border-radius: 50%;

  &.normal {
    background-color: var(--el-color-primary);
  }

  &.info {
    background-color: var(--el-color-info);
  }

  &.warning {
    background-color: var(--el-color-warning);
  }

  &.danger {
    background-color: var(--el-color-danger);
  }
}

.legend {
  .name {
    color: #a4a7ac;
  }
}

.rules {
  padding-top: 20px;
  margin-top: 10px;
  font-size: 12px;
  font-weight: 400;
  color: #999;
  border-top: 1px solid var(--el-card-border-color);
}
</style>
