<script setup lang="ts">
import _ from "lodash";
import { ref, onMounted } from "vue";
import { getExData } from "@/api/attendance";
defineExpose({ getData });
const props = defineProps({
  gid: {
    require: false,
    default: "",
    type: String
  }
});
function getData() {
  const param = {
    exWorkFlag: formData.value.wswitch,
    exWorkAllowType: formData.value.wswitch ? formData.value.wradio1 : 0,
    exWorkCalcWay: formData.value.wswitch ? formData.value.wradio2 : 0,
    exWorkStartTime: formData.value.wswitch ? formData.value.wstime : 0,
    exWorkOnMinTime: formData.value.wswitch ? formData.value.wpmins : 0,
    exWorkOffMinTime: formData.value.wswitch ? formData.value.wnmins : 0,
    exWorkSumMinTime: formData.value.wswitch ? formData.value.wtmins : 0,
    exWorkMinusRest: formData.value.wswitch ? formData.value.wswitch2 : false,
    exWorkBonus: formData.value.wswitch ? formData.value.wswitch3 : false,
    exWorkBonusType: formData.value.wswitch ? formData.value.wworktimeTran : 0,
    exWorkBonusTypeA: formData.value.wswitch ? formData.value.wscale : "",
    exRestFlag: formData.value.rswitch,
    exRestCalcWay: formData.value.rswitch ? formData.value.rradio1 : 0,
    exRestSumMinTime: formData.value.rswitch ? formData.value.rtmins : 0,
    exRestMinusRest: formData.value.rswitch ? formData.value.rswitch2 : false,
    exRestBonus: formData.value.rswitch ? formData.value.rswitch3 : false,
    exRestBonusType: formData.value.rswitch ? formData.value.rworktimeTran : 0,
    exRestBonusTypeA: formData.value.rswitch ? formData.value.rscale : "",
    exFestFlag: formData.value.hswitch,
    exFestCalcWay: formData.value.hswitch ? formData.value.hradio1 : 0,
    exFestSumMinTime: formData.value.hswitch ? formData.value.htmins : 0,
    exFestMinusRest: formData.value.hswitch ? formData.value.hswitch2 : false,
    exFestBonus: formData.value.hswitch ? formData.value.hswitch3 : false,
    exFestBonusType: formData.value.rswitch ? formData.value.hworktimeTran : 0,
    exFestBonusTypeA: formData.value.rswitch ? formData.value.hscale : "",
    exRestStartTime: formData.value.rszwtime,
    exRestEndTime: formData.value.rezwtime
  };
  return param;
}
const formData = ref({
  id: undefined,
  activeName: "weekday", //工作日  休息日  节假日
  wswitch: true, //工作日允许加班
  wradio1: 0, //加班方式
  wradio2: 0, //计算方式
  wstime: "30", //加班起算时间
  wpmins: "30", //最小班前加班时间
  wnmins: "30", //最小班后加班时间
  wtmins: "60", //累计加班时间
  wswitch2: false, //是否扣除休息时间
  wdeduction: "1", //扣除方式
  wszwtime: "", //扣除中午开始时间
  wezwtime: "", //扣除中午结束时间
  wsxwtime: "", //扣除下午开始时间
  wexwtime: "", //扣除下午开始时间
  wmhours: "5", //累计加班时间
  wkhours: "1", //累计加班时间 后扣除时间
  wswitch3: false, //加班时长记为调休或加班费
  wworktimeTran: "",
  wscale: "1:1",

  rswitch: true, //休息日允许加班
  rradio1: 0, //计算方式
  rtmins: "60", //累计加班时间
  rswitch2: false, //是否扣除休息时间
  rdeduction: "1", //扣除方式
  rszwtime: "", //扣除中午开始时间
  rezwtime: "", //扣除中午结束时间
  rsxwtime: "", //扣除下午开始时间
  rexwtime: "", //扣除下午开始时间
  rmhours: "5", //累计加班时间
  rkhours: "1", //累计加班时间 后扣除时间
  rswitch3: false, //加班时长记为调休或加班费
  rworktimeTran: "",
  rscale: "1:1",

  hswitch: true, //节假日允许加班
  hradio1: 0, //计算方式
  htmins: "60", //累计加班时间
  hswitch2: false, //是否扣除休息时间
  hdeduction: "1", //扣除方式
  hszwtime: "", //扣除中午开始时间
  hezwtime: "", //扣除中午结束时间
  hsxwtime: "", //扣除下午开始时间
  hexwtime: "", //扣除下午开始时间
  hmhours: "5", //累计加班时间
  hkhours: "1", //累计加班时间 后扣除时间
  hswitch3: false, //加班时长记为调休或加班费
  hworktimeTran: "",
  hscale: "1:1"
});
const hours = ref([]);
const mins = ref(["30", "60", "90", "120", "180"]);
const scales = ref(["1:1", "2:1"]);
function handleClick() {}
async function getDetail() {
  const { data } = await getExData({ id: formData.value.id });
  console.log("data---->", data);
  formData.value.wswitch = data.exWorkFlag;
  formData.value.wradio1 = data.exWorkAllowType;
  formData.value.wradio2 = data.exWorkCalcWay;
  formData.value.wstime = data.exWorkStartTime;
  formData.value.wpmins = data.exWorkOnMinTime;
  formData.value.wnmins = data.exWorkOffMinTime;
  formData.value.wtmins = data.exWorkSumMinTime;
  formData.value.wswitch2 = data.exWorkMinusRest;
  formData.value.wswitch3 = data.exWorkBonus;
  formData.value.wworktimeTran = data.exWorkBonusType;
  formData.value.wscale = data.exWorkBonusTypeA;

  formData.value.rswitch = data.exRestFlag;
  formData.value.rradio1 = data.exRestCalcWay;
  formData.value.rtmins = data.exRestSumMinTime;
  formData.value.rswitch2 = data.exRestMinusRest;
  formData.value.rszwtime = data.exRestStartTime;
  formData.value.rezwtime = data.exRestEndTime;
  formData.value.rswitch3 = data.exRestBonus;
  formData.value.rworktimeTran = data.exRestBonusType;
  formData.value.rscale = data.exRestBonusTypeA;

  formData.value.hswitch = data.exFestFlag;
  formData.value.hradio1 = data.exFestCalcWay;
  formData.value.htmins = data.exFestSumMinTime;
  formData.value.hswitch2 = data.exFestMinusRest;
  formData.value.hswitch3 = data.exFestBonus;
  formData.value.hworktimeTran = data.exFestBonusType;
  formData.value.hscale = data.exFestBonusTypeA;
}
//mounted周期函数
onMounted(async () => {
  const hoursData = [];
  for (let i = 1; i < 25; i++) {
    hoursData.push(i);
  }
  hours.value = hoursData;
  formData.value.id = props.gid;
  if (formData.value.id != null && formData.value.id != "") {
    getDetail();
  }
});
</script>

<template>
  <div class="mainView">
    <div>
      <el-tabs v-model="formData.activeName" @tab-click="handleClick">
        <el-tab-pane label="工作日" name="weekday" />
        <el-tab-pane label="休息日" name="restday" />
        <el-tab-pane label="节假日" name="holiday" />
      </el-tabs>
    </div>
    <div v-if="formData.activeName == 'weekday'">
      <div style="margin-top: 20px">
        <span style="margin-right: 10px">允许加班</span>
        <el-switch v-model="formData.wswitch" />
      </div>
      <div v-if="formData.wswitch">
        <el-radio-group
          v-model="formData.wradio1"
          style="display: flex; flex-direction: column; align-items: flex-start"
        >
          <el-radio :label="1" size="large">允许班前和班后加班</el-radio>
          <el-radio :label="2" size="large">仅允许班前加班</el-radio>
          <el-radio :label="3" size="large">仅允许班后加班</el-radio>
        </el-radio-group>
      </div>
      <div v-if="formData.wswitch" style="margin-top: 20px">
        <div>计算方式</div>
        <el-radio-group
          v-model="formData.wradio2"
          style="display: flex; flex-direction: column; align-items: flex-start"
        >
          <el-radio :label="1" size="large">按审批时长计算</el-radio>
          <el-radio :label="2" size="large"
            >在审批的时段内，按打卡时长计算</el-radio
          >
          <el-radio :label="3" size="large">无需审批，按打卡时长计算</el-radio>
        </el-radio-group>
      </div>
      <div v-if="formData.wswitch" style="margin-top: 20px">
        <div>加班起算时间</div>
        <div style="margin-top: 20px">
          <span style=" margin-right: 10px;font-size: 14px">下班</span>
          <el-select
            v-model="formData.wstime"
            clearable
            placeholder="请选择"
            style="width: 100px"
            ><el-option
              v-for="item in mins"
              :key="item"
              :label="item"
              :value="item"
          /></el-select>
          <span style=" margin-left: 10px;font-size: 14px"
            >分钟后开始算加班</span
          >
        </div>
      </div>
      <div v-if="formData.wswitch" style="margin-top: 20px">
        <div>最小加班时间</div>
        <div v-if="formData.activeName == 'weekday'" style="margin-top: 20px">
          <span style=" margin-right: 10px;font-size: 14px">班前加班少于</span>
          <el-select
            v-model="formData.wpmins"
            clearable
            placeholder="请选择"
            style="width: 100px"
            ><el-option
              v-for="item in mins"
              :key="item"
              :label="item"
              :value="item"
          /></el-select>
          <span style=" margin-left: 10px;font-size: 14px">分钟不计入加班</span>
        </div>
        <div style="margin-top: 20px">
          <span style=" margin-right: 10px;font-size: 14px">班后加班少于</span>
          <el-select
            v-model="formData.wnmins"
            clearable
            placeholder="请选择"
            style="width: 100px"
            ><el-option
              v-for="item in mins"
              :key="item"
              :label="item"
              :value="item"
          /></el-select>
          <span style=" margin-left: 10px;font-size: 14px">分钟不计入加班</span>
        </div>
        <div style="margin-top: 20px">
          <span style=" margin-right: 10px;font-size: 14px">累计加班少于</span>
          <el-select
            v-model="formData.wtmins"
            clearable
            placeholder="请选择"
            style="width: 100px"
            ><el-option
              v-for="item in mins"
              :key="item"
              :label="item"
              :value="item"
          /></el-select>
          <span style=" margin-left: 10px;font-size: 14px">分钟不计入加班</span>
        </div>
      </div>
      <div v-if="formData.wswitch" style="margin-top: 20px">
        <div style="margin-top: 20px">
          <span style="margin-right: 10px">扣除休息时间</span>
          <el-switch v-model="formData.wswitch2" />
        </div>
        <div v-if="formData.wswitch2" class="radioMain">
          <div class="radios">
            <el-radio v-model="formData.wdeduction" label="1" size="large"
              >按休息时段扣除</el-radio
            >
            <div
              v-if="formData.wdeduction == '1'"
              style=" margin-top: 10px;margin-left: 20px"
            >
              <span style="font-size: 14px">中午休息开始：</span>
              <el-time-picker
                v-model="formData.wszwtime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="请选择"
                style="width: 100px"
              />
              <span style=" margin-left: 10px;font-size: 14px"
                >中午休息结束：</span
              >
              <el-time-picker
                v-model="formData.wezwtime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="请选择"
                style="width: 100px"
              />
            </div>
            <div
              v-if="formData.wdeduction == '1'"
              style=" margin-top: 10px;margin-left: 20px"
            >
              <span style="font-size: 14px">下午休息开始：</span>
              <el-time-picker
                v-model="formData.wsxwtime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="请选择"
                style="width: 100px"
              />
              <span style=" margin-left: 10px;font-size: 14px"
                >下午休息结束：</span
              >
              <el-time-picker
                v-model="formData.wexwtime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="请选择"
                style="width: 100px"
              />
            </div>
          </div>
          <div class="radios">
            <el-radio v-model="formData.wdeduction" label="2" size="large"
              >按加班时长扣除</el-radio
            >
            <div
              v-if="formData.wdeduction == '2'"
              style=" margin-top: 10px;margin-left: 20px"
            >
              <span style=" margin-right: 10px;font-size: 14px"
                >每天加班满</span
              >
              <el-select
                v-model="formData.wmhours"
                clearable
                placeholder="请选择"
                style="width: 100px"
                ><el-option
                  v-for="item in hours"
                  :key="item"
                  :label="item"
                  :value="item"
              /></el-select>
              <span
                style=" margin-right: 10px; margin-left: 10px;font-size: 14px"
                >小时，扣除</span
              >
              <el-select
                v-model="formData.wkhours"
                clearable
                placeholder="请选择"
                style="width: 100px"
                ><el-option
                  v-for="item in hours"
                  :key="item"
                  :label="item"
                  :value="item"
              /></el-select>
              <span
                style=" margin-right: 10px; margin-left: 10px;font-size: 14px"
                >小时</span
              >
            </div>
          </div>
        </div>
      </div>
      <div v-if="formData.wswitch" style="margin-top: 20px">
        <div style="margin-top: 20px">
          <span style="margin-right: 10px">加班时长记为调休或加班费</span>
          <el-switch v-model="formData.wswitch3" />
        </div>
        <div v-if="formData.wswitch3" class="radioMain">
          <div class="radios">
            <el-radio v-model="formData.wworktimeTran" label="1" size="large"
              >记为调休</el-radio
            >
            <div
              v-if="formData.wworktimeTran == '1'"
              style=" margin-top: 10px;margin-left: 20px"
            >
              <span style=" margin-right: 10px;font-size: 14px">按照</span>
              <el-select
                v-model="formData.wscale"
                clearable
                placeholder="请选择"
                style="width: 100px"
                ><el-option
                  v-for="item in scales"
                  :key="item"
                  :label="item"
                  :value="item"
              /></el-select>
              <span style=" margin-left: 10px;font-size: 14px"
                >记为调休时长</span
              >
            </div>
          </div>
          <div class="radios">
            <el-radio v-model="formData.wworktimeTran" label="2" size="large"
              >记为加班费</el-radio
            >
          </div>
        </div>
      </div>
    </div>
    <div v-if="formData.activeName == 'restday'">
      <div style="margin-top: 20px">
        <span style="margin-right: 10px">允许加班</span>
        <el-switch v-model="formData.rswitch" />
      </div>
      <div v-if="formData.rswitch" style="margin-top: 20px">
        <div>计算方式</div>
        <el-radio-group
          v-model="formData.rradio1"
          style="display: flex; flex-direction: column; align-items: flex-start"
        >
          <el-radio :label="1" size="large">按审批时长计算</el-radio>
          <el-radio :label="2" size="large"
            >在审批的时段内，按打卡时长计算</el-radio
          >
          <el-radio :label="3" size="large">无需审批，按打卡时长计算</el-radio>
        </el-radio-group>
      </div>
      <div v-if="formData.rswitch" style="margin-top: 20px">
        <div>最小加班时间</div>
        <div style="margin-top: 20px">
          <span style=" margin-right: 10px;font-size: 14px">累计加班少于</span>
          <el-select
            v-model="formData.rtmins"
            clearable
            placeholder="请选择"
            style="width: 100px"
            ><el-option
              v-for="item in mins"
              :key="item"
              :label="item"
              :value="item"
          /></el-select>
          <span style=" margin-left: 10px;font-size: 14px">分钟不计入加班</span>
        </div>
      </div>
      <div v-if="formData.rswitch" style="margin-top: 20px">
        <div style="margin-top: 20px">
          <span style="margin-right: 10px">扣除休息时间</span>
          <el-switch v-model="formData.rswitch2" />
        </div>
        <div v-if="formData.rswitch2" class="radioMain">
          <div class="radios">
            <el-radio v-model="formData.rdeduction" label="1" size="large"
              >按休息时段扣除</el-radio
            >
            <div
              v-if="formData.rdeduction == '1'"
              style=" margin-top: 10px;margin-left: 20px"
            >
              <span style="font-size: 14px">中午休息开始：</span>
              <el-time-picker
                v-model="formData.rszwtime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="请选择"
                style="width: 100px"
              />
              <span style=" margin-left: 10px;font-size: 14px"
                >中午休息结束：</span
              >
              <el-time-picker
                v-model="formData.rezwtime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="请选择"
                style="width: 100px"
              />
            </div>
            <div
              v-if="formData.rdeduction == '1'"
              style=" margin-top: 10px;margin-left: 20px"
            >
              <span style="font-size: 14px">下午休息开始：</span>
              <el-time-picker
                v-model="formData.rsxwtime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="请选择"
                style="width: 100px"
              />
              <span style=" margin-left: 10px;font-size: 14px"
                >下午休息结束：</span
              >
              <el-time-picker
                v-model="formData.rexwtime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="请选择"
                style="width: 100px"
              />
            </div>
          </div>
          <div class="radios">
            <el-radio v-model="formData.rdeduction" label="2" size="large"
              >按加班时长扣除</el-radio
            >
            <div
              v-if="formData.rdeduction == '2'"
              style=" margin-top: 10px;margin-left: 20px"
            >
              <span style=" margin-right: 10px;font-size: 14px"
                >每天加班满</span
              >
              <el-select
                v-model="formData.rmhours"
                clearable
                placeholder="请选择"
                style="width: 100px"
                ><el-option
                  v-for="item in hours"
                  :key="item"
                  :label="item"
                  :value="item"
              /></el-select>
              <span
                style=" margin-right: 10px; margin-left: 10px;font-size: 14px"
                >小时，扣除</span
              >
              <el-select
                v-model="formData.rkhours"
                clearable
                placeholder="请选择"
                style="width: 100px"
                ><el-option
                  v-for="item in hours"
                  :key="item"
                  :label="item"
                  :value="item"
              /></el-select>
              <span
                style=" margin-right: 10px; margin-left: 10px;font-size: 14px"
                >小时</span
              >
            </div>
          </div>
        </div>
      </div>
      <div v-if="formData.rswitch" style="margin-top: 20px">
        <div style="margin-top: 20px">
          <span style="margin-right: 10px">加班时长记为调休或加班费</span>
          <el-switch v-model="formData.rswitch3" />
        </div>
        <div v-if="formData.rswitch3" class="radioMain">
          <div class="radios">
            <el-radio v-model="formData.rworktimeTran" label="1" size="large"
              >记为调休</el-radio
            >
            <div
              v-if="formData.rworktimeTran == '1'"
              style=" margin-top: 10px;margin-left: 20px"
            >
              <span style=" margin-right: 10px;font-size: 14px">按照</span>
              <el-select
                v-model="formData.rscale"
                clearable
                placeholder="请选择"
                style="width: 100px"
                ><el-option
                  v-for="item in scales"
                  :key="item"
                  :label="item"
                  :value="item"
              /></el-select>
              <span style=" margin-left: 10px;font-size: 14px"
                >记为调休时长</span
              >
            </div>
          </div>
          <div class="radios">
            <el-radio v-model="formData.rworktimeTran" label="2" size="large"
              >记为加班费</el-radio
            >
          </div>
        </div>
      </div>
    </div>
    <div v-if="formData.activeName == 'holiday'">
      <div style="margin-top: 20px">
        <span style="margin-right: 10px">允许加班</span>
        <el-switch v-model="formData.hswitch" />
      </div>
      <div v-if="formData.hswitch" style="margin-top: 20px">
        <div>计算方式</div>
        <el-radio-group
          v-model="formData.hradio1"
          style="display: flex; flex-direction: column; align-items: flex-start"
        >
          <el-radio :label="1" size="large">按审批时长计算</el-radio>
          <el-radio :label="2" size="large"
            >在审批的时段内，按打卡时长计算</el-radio
          >
          <el-radio :label="3" size="large">无需审批，按打卡时长计算</el-radio>
        </el-radio-group>
      </div>
      <div v-if="formData.hswitch" style="margin-top: 20px">
        <div>最小加班时间</div>
        <div style="margin-top: 20px">
          <span style=" margin-right: 10px;font-size: 14px">累计加班少于</span>
          <el-select
            v-model="formData.htmins"
            clearable
            placeholder="请选择"
            style="width: 100px"
            ><el-option
              v-for="item in mins"
              :key="item"
              :label="item"
              :value="item"
          /></el-select>
          <span style=" margin-left: 10px;font-size: 14px">分钟不计入加班</span>
        </div>
      </div>
      <div v-if="formData.hswitch" style="margin-top: 20px">
        <div style="margin-top: 20px">
          <span style="margin-right: 10px">扣除休息时间</span>
          <el-switch v-model="formData.hswitch2" />
        </div>
        <div v-if="formData.hswitch2" class="radioMain">
          <div class="radios">
            <el-radio v-model="formData.hdeduction" label="1" size="large"
              >按休息时段扣除</el-radio
            >
            <div
              v-if="formData.hdeduction == '1'"
              style=" margin-top: 10px;margin-left: 20px"
            >
              <span style="font-size: 14px">中午休息开始：</span>
              <el-time-picker
                v-model="formData.hszwtime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="请选择"
                style="width: 100px"
              />
              <span style=" margin-left: 10px;font-size: 14px"
                >中午休息结束：</span
              >
              <el-time-picker
                v-model="formData.hezwtime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="请选择"
                style="width: 100px"
              />
            </div>
            <div
              v-if="formData.hdeduction == '1'"
              style=" margin-top: 10px;margin-left: 20px"
            >
              <span style="font-size: 14px">下午休息开始：</span>
              <el-time-picker
                v-model="formData.hsxwtime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="请选择"
                style="width: 100px"
              />
              <span style=" margin-left: 10px;font-size: 14px"
                >下午休息结束：</span
              >
              <el-time-picker
                v-model="formData.hexwtime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="请选择"
                style="width: 100px"
              />
            </div>
          </div>
          <div class="radios">
            <el-radio v-model="formData.hdeduction" label="2" size="large"
              >按加班时长扣除</el-radio
            >
            <div
              v-if="formData.hdeduction == '2'"
              style=" margin-top: 10px;margin-left: 20px"
            >
              <span style=" margin-right: 10px;font-size: 14px"
                >每天加班满</span
              >
              <el-select
                v-model="formData.hmhours"
                clearable
                placeholder="请选择"
                style="width: 100px"
                ><el-option
                  v-for="item in hours"
                  :key="item"
                  :label="item"
                  :value="item"
              /></el-select>
              <span
                style=" margin-right: 10px; margin-left: 10px;font-size: 14px"
                >小时，扣除</span
              >
              <el-select
                v-model="formData.hkhours"
                clearable
                placeholder="请选择"
                style="width: 100px"
                ><el-option
                  v-for="item in hours"
                  :key="item"
                  :label="item"
                  :value="item"
              /></el-select>
              <span
                style=" margin-right: 10px; margin-left: 10px;font-size: 14px"
                >小时</span
              >
            </div>
          </div>
        </div>
      </div>
      <div v-if="formData.hswitch" style="margin-top: 20px">
        <div style="margin-top: 20px">
          <span style="margin-right: 10px">加班时长记为调休或加班费</span>
          <el-switch v-model="formData.hswitch3" />
        </div>
        <div v-if="formData.hswitch3" class="radioMain">
          <div class="radios">
            <el-radio v-model="formData.hworktimeTran" label="1" size="large"
              >记为调休</el-radio
            >
            <div
              v-if="formData.hworktimeTran == '1'"
              style=" margin-top: 10px;margin-left: 20px"
            >
              <span style=" margin-right: 10px;font-size: 14px">按照</span>
              <el-select
                v-model="formData.hscale"
                clearable
                placeholder="请选择"
                style="width: 100px"
                ><el-option
                  v-for="item in scales"
                  :key="item"
                  :label="item"
                  :value="item"
              /></el-select>
              <span style=" margin-left: 10px;font-size: 14px"
                >记为调休时长</span
              >
            </div>
          </div>
          <div class="radios">
            <el-radio v-model="formData.hworktimeTran" label="2" size="large"
              >记为加班费</el-radio
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.radioMain {
  display: flex;
  flex-direction: column;

  .radios {
    display: flex;
    flex-direction: column;
  }
}
</style>
