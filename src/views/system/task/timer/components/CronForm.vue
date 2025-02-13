<script setup lang="ts">
import { ref, computed } from "vue";
import { isValidCronExpression } from "cron-expression-validator";

defineOptions({
  name: "CronForm"
});

//使用https://www.kjson.com/tools/cron/网站生成的后面的(0 0 22 ? * ?)cron表达式是有效的，但是前端和后端验证均是无效的
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["cronResult"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const dialogVisible = ref(false);
const activeName = ref("second");

const secondType = ref();
const minuteType = ref();
const hourType = ref();
const dayType = ref();
const monthType = ref();
const weekType = ref();
const yearType = ref();

const secondOptions = ref([]);
const minuteOptions = ref([]);
const hourOptions = ref([]);
const dayOptions = ref([]);
const monthOptions = ref([]);
const weekOptions = ref([]);
const yearOptions = ref([]);

const second1 = ref("*");
const second2 = ref(0);
const second3 = ref(1);
const second4 = ref(0);
const second5 = ref(1);
const second6 = ref([]);

const minute1 = ref("*");
const minute2 = ref(0);
const minute3 = ref(1);
const minute4 = ref(0);
const minute5 = ref(1);
const minute6 = ref([]);

const hour1 = ref("*");
const hour2 = ref(0);
const hour3 = ref(1);
const hour4 = ref(0);
const hour5 = ref(1);
const hour6 = ref([]);

const day1 = ref("*");
const day2 = ref("?");
const day3 = ref(1);
const day4 = ref(2);
const day5 = ref(1);
const day6 = ref(1);
const day7 = ref(1);
const day8 = ref("L");
const day9 = ref([]);

const month1 = ref("*");
const month2 = ref(0);
const month3 = ref(2);
const month4 = ref(1);
const month5 = ref(1);
const month6 = ref([]);

const week1 = ref("*");
const week2 = ref("?");
const week3 = ref(1);
const week4 = ref(2);
const week5 = ref(1);
const week6 = ref(1);
const week7 = ref(1);
const week8 = ref([]);

const currentYear = ref(new Date());
const year1 = ref("");
const year2 = ref("*");
const year3 = ref(currentYear.value.getFullYear().toString());
const year4 = ref(currentYear.value.getFullYear().toString());
const year5 = ref(currentYear.value.getFullYear().toString());
const year6 = ref(1);
const year7 = ref([]);

const secondResult = computed(() => {
  switch (secondType.value) {
    case 0:
      return second1.value;
    case 1:
      return `${second2.value}-${second3.value}`;
    case 2:
      return `${second4.value}/${second5.value}`;
    case 3:
      return second6.value && second6.value.length > 0
        ? second6.value.join()
        : "*";
    default:
      return undefined;
  }
});
const minuteResult = computed(() => {
  switch (minuteType.value) {
    case 0:
      return minute1.value;
    case 1:
      return `${minute2.value}-${minute3.value}`;
    case 2:
      return `${minute4.value}/${minute5.value}`;
    case 3:
      return second6.value && minute6.value.length > 0
        ? minute6.value.join()
        : "*";
    default:
      return undefined;
  }
});
const hourResult = computed(() => {
  switch (hourType.value) {
    case 0:
      return hour1.value;
    case 1:
      return `${hour2.value}-${hour3.value}`;
    case 2:
      return `${hour4.value}/${hour5.value}`;
    case 3:
      return hour6.value && hour6.value.length > 0 ? hour6.value.join() : "*";
    default:
      return undefined;
  }
});
const dayResult = computed(() => {
  switch (dayType.value) {
    case 0:
      return day1.value;
    case 1:
      return day2.value;
    case 2:
      return `${day3.value}-${day4.value}`;
    case 3:
      return `${day5.value}/${day6.value}`;
    case 4:
      return `${day7.value}W`;
    case 5:
      return day8.value;
    case 6:
      return day9.value && day9.value.length > 0 ? day9.value.join() : "*";
    default:
      return undefined;
  }
});
const monthResult = computed(() => {
  switch (monthType.value) {
    case 0:
      return month1.value;
    case 1:
      return `${month2.value}-${month3.value}`;
    case 2:
      return `${month4.value}/${month5.value}`;
    case 3:
      return month6.value && month6.value.length > 0
        ? month6.value.join()
        : "*";
    default:
      return undefined;
  }
});
const weekResult = computed(() => {
  switch (weekType.value) {
    case 0:
      return week1.value;
    case 1:
      return week2.value;
    case 2:
      return `${week3.value}-${week4.value}`;
    case 3:
      return `${week5.value}#${week6.value}`;
    case 4:
      return `${week7.value}L`;
    case 5:
      return week8.value && week8.value.length > 0 ? week8.value.join() : "*";
    default:
      return undefined;
  }
});
const yearResult = computed(() => {
  switch (yearType.value) {
    case 0:
      return year1.value;
    case 1:
      return year2.value;
    case 2:
      return `${year3.value}-${year4.value}`;
    case 3:
      return `${year5.value}/${year6.value}`;
    case 4:
      return year7.value && year7.value.length > 0 ? year7.value.join() : "";
    default:
      return undefined;
  }
});
const cronResult = computed(() => {
  const res = `${secondResult.value} ${minuteResult.value} ${hourResult.value} ${dayResult.value} ${monthResult.value} ${weekResult.value} ${yearResult.value}`;
  return res.trim();
});
const cronValidResult = computed<boolean>(() => {
  return isValidCronExpression(cronResult.value);
});

function show(cronExpression: string) {
  if (cronExpression) {
    const cronArr = cronExpression.split(" ");
    parseSecond(cronArr[0]);
    parseMinute(cronArr[1]);
    parseHour(cronArr[2]);
    parseDay(cronArr[3]);
    parseMonth(cronArr[4]);
    parseWeek(cronArr[5]);
    parseYear(cronArr[6]);
  }
  dialogVisible.value = true;
}
defineExpose({ show });

function parseSecond(secondStr: string) {
  if (secondStr == "*") {
    secondType.value = 0;
    second1.value = "*";
  } else if (secondStr.match(RegExp(/-/))) {
    secondType.value = 1;
    second2.value = parseInt(secondStr.split("-")[0]);
    second3.value = parseInt(secondStr.split("-")[1]);
  } else if (secondStr.match(RegExp(/\//))) {
    secondType.value = 2;
    second4.value = parseInt(secondStr.split("/")[0]);
    second5.value = parseInt(secondStr.split("/")[1]);
  } else {
    secondType.value = 3;
    second6.value = secondStr.split(",");
  }
}
function parseMinute(minuteStr: string) {
  if (minuteStr == "*") {
    minuteType.value = 0;
    minute1.value = "*";
  } else if (minuteStr.match(RegExp(/-/))) {
    minuteType.value = 1;
    minute2.value = parseInt(minuteStr.split("-")[0]);
    minute3.value = parseInt(minuteStr.split("-")[1]);
  } else if (minuteStr.match(RegExp(/\//))) {
    minuteType.value = 2;
    minute4.value = parseInt(minuteStr.split("/")[0]);
    minute5.value = parseInt(minuteStr.split("/")[1]);
  } else {
    minuteType.value = 3;
    minute6.value = minuteStr.split(",");
  }
}
function parseHour(hourStr: string) {
  if (hourStr == "*") {
    hourType.value = 0;
    hour1.value = "*";
  } else if (hourStr.match(RegExp(/-/))) {
    hourType.value = 1;
    hour2.value = parseInt(hourStr.split("-")[0]);
    hour3.value = parseInt(hourStr.split("-")[1]);
  } else if (hourStr.match(RegExp(/\//))) {
    hourType.value = 2;
    hour4.value = parseInt(hourStr.split("/")[0]);
    hour5.value = parseInt(hourStr.split("/")[1]);
  } else {
    hourType.value = 3;
    hour6.value = hourStr.split(",");
  }
}
function parseDay(dayStr: string) {
  if (dayStr == "*") {
    dayType.value = 0;
    day1.value = "*";
  } else if (dayStr == "?") {
    dayType.value = 1;
    day2.value = "?";
  } else if (dayStr.match(RegExp(/-/))) {
    dayType.value = 2;
    day3.value = parseInt(dayStr.split("-")[0]);
    day4.value = parseInt(dayStr.split("-")[1]);
  } else if (dayStr.match(RegExp(/\//))) {
    dayType.value = 3;
    day5.value = parseInt(dayStr.split("/")[0]);
    day6.value = parseInt(dayStr.split("/")[1]);
  } else if (dayStr.match(RegExp(/W/))) {
    dayType.value = 4;
    day7.value = parseInt(dayStr.split("W")[0]);
  } else if (dayStr == "L") {
    dayType.value = 5;
    day8.value = "L";
  } else {
    dayType.value = 6;
    day9.value = dayStr.split(",");
  }
}
function parseMonth(monthStr: string) {
  if (monthStr == "*") {
    monthType.value = 0;
    month1.value = "*";
  } else if (monthStr.match(RegExp(/-/))) {
    monthType.value = 1;
    month2.value = parseInt(monthStr.split("-")[0]);
    month3.value = parseInt(monthStr.split("-")[1]);
  } else if (monthStr.match(RegExp(/\//))) {
    monthType.value = 2;
    month4.value = parseInt(monthStr.split("/")[0]);
    month5.value = parseInt(monthStr.split("/")[1]);
  } else {
    monthType.value = 3;
    month6.value = monthStr.split(",");
  }
}
function parseWeek(weekStr: string) {
  if (weekStr == "*") {
    weekType.value = 0;
    week1.value = "*";
  } else if (weekStr == "?") {
    weekType.value = 1;
    week2.value = "?";
  } else if (weekStr.match(RegExp(/-/))) {
    weekType.value = 2;
    week3.value = parseInt(weekStr.split("-")[0]);
    week4.value = parseInt(weekStr.split("-")[1]);
  } else if (weekStr.match(RegExp(/#/))) {
    weekType.value = 3;
    week5.value = parseInt(weekStr.split("#")[0]);
    week6.value = parseInt(weekStr.split("#")[1]);
  } else if (weekStr.match(RegExp(/L/))) {
    weekType.value = 4;
    week7.value = parseInt(weekStr.split("L")[0]);
  } else {
    weekType.value = 5;
    week8.value = weekStr.split(",");
  }
}
function parseYear(yearStr: string) {
  if (typeof yearStr == "undefined") {
    yearType.value = 0;
    year1.value = "";
  } else if (yearStr == "*") {
    yearType.value = 1;
    year2.value = "*";
  } else if (yearStr.match(RegExp(/-/))) {
    yearType.value = 2;
    year3.value = yearStr.split("-")[0];
    year4.value = yearStr.split("-")[1];
  } else if (yearStr.match(RegExp(/\//))) {
    yearType.value = 3;
    year5.value = yearStr.split("/")[0];
    year6.value = parseInt(yearStr.split("/")[1]);
  } else {
    yearType.value = 4;
    year7.value = yearStr.split(",");
  }
}

function save() {
  dialogVisible.value = false;
  emit("cronResult", cronResult.value);
}
function close() {
  activeName.value = "second";

  secondType.value = undefined;
  minuteType.value = undefined;
  hourType.value = undefined;
  dayType.value = undefined;
  monthType.value = undefined;
  weekType.value = undefined;
  yearType.value = undefined;

  second1.value = "*";
  second2.value = 0;
  second3.value = 1;
  second4.value = 0;
  second5.value = 1;
  second6.value = [];

  minute1.value = "*";
  minute2.value = 0;
  minute3.value = 1;
  minute4.value = 0;
  minute5.value = 1;
  minute6.value = [];

  hour1.value = "*";
  hour2.value = 0;
  hour3.value = 1;
  hour4.value = 0;
  hour5.value = 1;
  hour6.value = [];

  day1.value = "*";
  day2.value = "?";
  day3.value = 1;
  day4.value = 2;
  day5.value = 1;
  day6.value = 1;
  day7.value = 1;
  day8.value = "L";
  day9.value = [];

  month1.value = "*";
  month2.value = 0;
  month3.value = 2;
  month4.value = 1;
  month5.value = 1;
  month6.value = [];

  week1.value = "*";
  week2.value = "?";
  week3.value = 1;
  week4.value = 2;
  week5.value = 1;
  week6.value = 1;
  week7.value = 1;
  week8.value = [];

  year1.value = "";
  year2.value = "*";
  year3.value = currentYear.value.getFullYear().toString();
  year4.value = currentYear.value.getFullYear().toString();
  year5.value = currentYear.value.getFullYear().toString();
  year6.value = 1;
  year7.value = [];
}
//关闭对话框
const closeDialog = () => {
  close();
  dialogVisible.value = false;
};

secondOptions.value = Array.from({ length: 60 }, (v, k) => k);
minuteOptions.value = Array.from({ length: 60 }, (v, k) => k);
hourOptions.value = Array.from({ length: 24 }, (v, k) => k);
dayOptions.value = Array.from({ length: 31 }, (v, k) => k + 1);
monthOptions.value = Array.from({ length: 12 }, (v, k) => k + 1);
const weeks = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
weekOptions.value = Array.from({ length: 7 }, (v, k) => {
  return { name: weeks[k], value: k + 1 };
});
currentYear.value = new Date();
yearOptions.value = Array.from({ length: 10 }, (v, k) => {
  return parseInt(currentYear.value.getFullYear().toString()) + k;
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :close-on-click-modal="false"
    title="Cron表达式生成器"
    width="800px"
    append-to-body
    draggable
    :before-close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane label="秒" name="second">
        <el-radio-group v-model="secondType">
          <el-row :gutter="20">
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="0" :label="0">秒，允许的通配符[,-*/]</el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="1" :label="1">
                周期从
                <el-input-number
                  v-model="second2"
                  :controls="true"
                  controls-position="right"
                  :max="59"
                  :min="0"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                -
                <el-input-number
                  v-model="second3"
                  :controls="true"
                  controls-position="right"
                  :max="59"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                秒
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="2" :label="2">
                从
                <el-input-number
                  v-model="second4"
                  :controls="true"
                  controls-position="right"
                  :max="59"
                  :min="0"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                秒开始，每
                <el-input-number
                  v-model="second5"
                  :controls="true"
                  controls-position="right"
                  :max="59"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                秒执行一次
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="3" :label="3">
                指定
                <el-select
                  v-model="second6"
                  clearable
                  filterable
                  multiple
                  placeholder="可多选"
                  style="width: 560px"
                >
                  <el-option
                    v-for="item in secondOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-radio>
            </el-col>
          </el-row>
        </el-radio-group>
      </el-tab-pane>
      <el-tab-pane label="分钟" name="minute">
        <el-radio-group v-model="minuteType">
          <el-row :gutter="20">
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="0" :label="0">分钟，允许的通配符[,-*/]</el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="1" :label="1">
                周期从
                <el-input-number
                  v-model="minute2"
                  :controls="true"
                  controls-position="right"
                  :max="59"
                  :min="0"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                -
                <el-input-number
                  v-model="minute3"
                  :controls="true"
                  controls-position="right"
                  :max="59"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                分钟
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="2" :label="2">
                从
                <el-input-number
                  v-model="minute4"
                  :controls="true"
                  controls-position="right"
                  :max="59"
                  :min="0"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                分钟开始，每
                <el-input-number
                  v-model="minute5"
                  :controls="true"
                  controls-position="right"
                  :max="59"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                分钟执行一次
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="3" :label="3">
                指定
                <el-select
                  v-model="minute6"
                  clearable
                  filterable
                  multiple
                  placeholder="可多选"
                  style="width: 560px"
                >
                  <el-option
                    v-for="item in minuteOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-radio>
            </el-col>
          </el-row>
        </el-radio-group>
      </el-tab-pane>
      <el-tab-pane label="小时" name="hour">
        <el-radio-group v-model="hourType">
          <el-row :gutter="20">
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="0" :label="0">小时，允许的通配符[,-*/]</el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="1" :label="1">
                周期从
                <el-input-number
                  v-model="hour2"
                  :controls="true"
                  controls-position="right"
                  :max="23"
                  :min="0"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                -
                <el-input-number
                  v-model="hour3"
                  :controls="true"
                  controls-position="right"
                  :max="23"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                小时
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="2" :label="2">
                从
                <el-input-number
                  v-model="hour4"
                  :controls="true"
                  controls-position="right"
                  :max="23"
                  :min="0"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                小时开始，每
                <el-input-number
                  v-model="hour5"
                  :controls="true"
                  controls-position="right"
                  :max="23"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                小时执行一次
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="3" :label="3">
                指定
                <el-select
                  v-model="hour6"
                  clearable
                  filterable
                  multiple
                  placeholder="可多选"
                  style="width: 560px"
                >
                  <el-option
                    v-for="item in hourOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-radio>
            </el-col>
          </el-row>
        </el-radio-group>
      </el-tab-pane>
      <el-tab-pane label="日" name="day">
        <el-radio-group v-model="dayType">
          <el-row :gutter="20">
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="0" :label="0">日，允许的通配符[,-*/LM]</el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="1" :label="1">不指定</el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="2" :label="2">
                周期从
                <el-input-number
                  v-model="day3"
                  :controls="true"
                  controls-position="right"
                  :max="31"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                -
                <el-input-number
                  v-model="day4"
                  :controls="true"
                  controls-position="right"
                  :max="31"
                  :min="2"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                日
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="3" :label="3">
                从
                <el-input-number
                  v-model="day5"
                  :controls="true"
                  controls-position="right"
                  :max="31"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                号开始，每
                <el-input-number
                  v-model="day6"
                  :controls="true"
                  controls-position="right"
                  :max="31"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                日执行一次
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="4" :label="4">
                每月
                <el-input-number
                  v-model="day7"
                  :controls="true"
                  controls-position="right"
                  :max="31"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                号最近的那个工作日
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="5" :label="5">本月最后一天</el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="6" :label="6">
                指定
                <el-select
                  v-model="day9"
                  clearable
                  filterable
                  multiple
                  placeholder="可多选"
                  style="width: 560px"
                >
                  <el-option
                    v-for="item in dayOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-radio>
            </el-col>
          </el-row>
        </el-radio-group>
      </el-tab-pane>
      <el-tab-pane label="月" name="month">
        <el-radio-group v-model="monthType">
          <el-row :gutter="20">
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="0" :label="0">月，允许的通配符[,-*/]</el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="1" :label="1">
                周期从
                <el-input-number
                  v-model="month2"
                  :controls="true"
                  controls-position="right"
                  :max="12"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                -
                <el-input-number
                  v-model="month3"
                  :controls="true"
                  controls-position="right"
                  :max="12"
                  :min="2"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                月
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="2" :label="2">
                从
                <el-input-number
                  v-model="month4"
                  :controls="true"
                  controls-position="right"
                  :max="12"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                月开始，每
                <el-input-number
                  v-model="month5"
                  :controls="true"
                  controls-position="right"
                  :max="12"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                月执行一次
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="3" :label="3">
                指定
                <el-select
                  v-model="month6"
                  clearable
                  filterable
                  multiple
                  placeholder="可多选"
                  style="width: 560px"
                >
                  <el-option
                    v-for="item in monthOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-radio>
            </el-col>
          </el-row>
        </el-radio-group>
      </el-tab-pane>
      <el-tab-pane label="周" name="week">
        <el-radio-group v-model="weekType">
          <el-row :gutter="20">
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="0" :label="0">周，允许的通配符[,-*/L#]</el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="1" :label="1">不指定</el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="2" :label="2">
                周期从星期
                <el-input-number
                  v-model="week3"
                  :controls="true"
                  controls-position="right"
                  :max="7"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                -
                <el-input-number
                  v-model="week4"
                  :controls="true"
                  controls-position="right"
                  :max="7"
                  :min="2"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="3" :label="3">
                第
                <el-input-number
                  v-model="week5"
                  :controls="true"
                  controls-position="right"
                  :max="4"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                周的星期
                <el-input-number
                  v-model="week6"
                  :controls="true"
                  controls-position="right"
                  :max="7"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="4" :label="4">
                本月最后一个星期
                <el-input-number
                  v-model="week7"
                  :controls="true"
                  controls-position="right"
                  :max="7"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="5" :label="5">
                指定
                <el-select
                  v-model="week8"
                  clearable
                  filterable
                  multiple
                  placeholder="可多选"
                  style="width: 560px"
                >
                  <el-option
                    v-for="item in weekOptions"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-radio>
            </el-col>
          </el-row>
        </el-radio-group>
      </el-tab-pane>
      <el-tab-pane label="年" name="year">
        <el-radio-group v-model="yearType">
          <el-row :gutter="20">
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="0" :label="0">不填，允许的通配符[,-*/]</el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="1" :label="1">每年</el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="2" :label="2">
                周期从
                <el-date-picker
                  v-model="year3"
                  type="year"
                  clearable
                  :editable="false"
                  format="YYYY"
                  :default-value="currentYear"
                  value-format="YYYY"
                  placeholder="选择开始年份"
                />
                -
                <el-date-picker
                  v-model="year4"
                  type="year"
                  clearable
                  :editable="false"
                  format="YYYY"
                  :default-value="currentYear"
                  value-format="YYYY"
                  placeholder="选择开始年份"
                />
                年
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="3" :label="3">
                从
                <el-date-picker
                  v-model="year5"
                  type="year"
                  clearable
                  :editable="false"
                  format="YYYY"
                  :default-value="currentYear"
                  value-format="YYYY"
                  placeholder="选择开始年份"
                />
                年开始，每
                <el-input-number
                  v-model="year6"
                  :controls="true"
                  controls-position="right"
                  :min="1"
                  :step="1"
                  :precision="0"
                  step-strictly
                  value-on-clear="min"
                />
                年执行一次
              </el-radio>
            </el-col>
            <el-col class="col" :offset="0" :span="24">
              <el-radio :key="4" :label="4">
                指定
                <el-select
                  v-model="year7"
                  clearable
                  filterable
                  multiple
                  placeholder="可多选"
                  style="width: 560px"
                >
                  <el-option
                    v-for="item in yearOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-radio>
            </el-col>
          </el-row>
        </el-radio-group>
      </el-tab-pane>
    </el-tabs>
    <el-descriptions
      border
      :column="10"
      :content-style="{ textAlign: 'center', width: '100px' }"
      direction="vertical"
      :label-style="{ textAlign: 'center', width: '100px' }"
      style="margin: 20px 0"
      title="时间表达式"
    >
      <el-descriptions-item label="秒">
        {{ secondResult }}
      </el-descriptions-item>
      <el-descriptions-item label="分钟">
        {{ minuteResult }}
      </el-descriptions-item>
      <el-descriptions-item label="小时">{{ hourResult }}</el-descriptions-item>
      <el-descriptions-item label="日">{{ dayResult }}</el-descriptions-item>
      <el-descriptions-item label="月">{{ monthResult }}</el-descriptions-item>
      <el-descriptions-item label="周">{{ weekResult }}</el-descriptions-item>
      <el-descriptions-item label="年">{{ yearResult }}</el-descriptions-item>
      <el-descriptions-item label="Cron表达式" :span="2">
        <el-text :type="cronValidResult ? 'success' : 'danger'" effect="plain">
          {{ cronValidResult ? cronResult : "" }}
        </el-text>
      </el-descriptions-item>
      <el-descriptions-item v-if="false" label="有效性" :span="2">
        <el-text :type="cronValidResult ? 'success' : 'danger'" effect="plain">
          {{ cronValidResult ? "有效" : "无效" }}
        </el-text>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="closeDialog">{{
        cronValidResult ? "取消" : "关闭"
      }}</el-button>
      <el-button
        v-if="cronValidResult"
        :type="cronValidResult ? 'primary' : 'danger'"
        @click="save"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.el-radio {
  width: 100%;
}

.col {
  padding-top: 15px;

  &:first-of-type {
    padding-top: 5px;
  }
}

:deep(.el-descriptions__title) {
  font-size: 16px;
  font-weight: normal;
}

:deep(.el-input-number) {
  width: 160px !important;
}
</style>
