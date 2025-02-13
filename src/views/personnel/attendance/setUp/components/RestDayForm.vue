<script setup lang="ts">
import _ from "lodash";
import { ref, onMounted } from "vue";
import { getRestData } from "@/api/attendance";
defineExpose({ getData });
const props = defineProps({
  gid: {
    require: false,
    default: "",
    type: String
  }
});
function getData() {
  let restOnInterval = 0;
  let restOffInterval = 0;

  if (formData.value.sxtime != "" && formData.value.sxtime != null) {
    if (smin.value != "" && smin.value != null) {
      restOnInterval =
        parseInt(formData.value.sxtime) * 60 + parseInt(smin.value);
    } else {
      restOnInterval = parseInt(formData.value.sxtime) * 60;
    }
  } else {
    if (smin.value != "" && smin.value != null) {
      restOnInterval = parseInt(smin.value);
    } else {
      restOnInterval = 0;
    }
  }
  if (formData.value.sstime != "" && formData.value.sstime != null) {
    if (emin.value != "" && emin.value != null) {
      restOffInterval =
        parseInt(formData.value.sstime) * 60 + parseInt(emin.value);
    } else {
      restOffInterval = parseInt(formData.value.sstime) * 60;
    }
  } else {
    if (emin.value != "" && emin.value != null) {
      restOffInterval = parseInt(emin.value);
    } else {
      restOffInterval = 0;
    }
  }

  const param = {
    restStartTime: formData.value.restStartTime,
    restWay: formData.value.restWay,
    restOnInterval: restOnInterval,
    restOffInterval: restOffInterval,
    restAuditFlag: formData.value.restAuditFlag
  };
  return param;
}

const formData = ref({
  id: undefined,
  restStartTime: "",
  restWay: 0,
  sxtime: "",
  sstime: "",
  restAuditFlag: false
});
const hours = ref([]);
const mins = ref(["10", "20", "30", "40", "50"]);
const smin = ref("00");
const emin = ref("00");
async function getDetail() {
  const { data } = await getRestData({ id: formData.value.id });
  console.log("data---->", data);
  formData.value.restStartTime = data.restStartTime;
  formData.value.restWay = data.restWay;
  const sxh = data.restOnInterval % 60;
  const ssh = data.restOffInterval % 60;
  smin.value = sxh == 0 ? "00" : sxh.toString();
  emin.value = ssh == 0 ? "00" : ssh.toString();
  formData.value.sxtime = parseInt(data.restOnInterval / 60).toString();
  formData.value.sstime = parseInt(data.restOffInterval / 60).toString();
  formData.value.restAuditFlag = data.restAuditFlag;
}
//mounted周期函数
onMounted(async () => {
  const hoursData = [];
  for (let i = 0; i < 13; i++) {
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
      <div>休息日打卡开始时间</div>
      <div style="margin-top: 20px">
        <span style=" margin-right: 10px;font-size: 14px">每天</span>
        <el-time-picker
          v-model="formData.restStartTime"
          format="HH:mm"
          value-format="HH:mm"
          style="width: 100px"
        />
        <span style=" margin-left: 10px;font-size: 14px"
          >开始新的一天考勤打卡</span
        >
      </div>
    </div>
    <div style="margin-top: 40px">
      <div>休息日打卡开始方式</div>
      <div class="radioMain">
        <div class="radios">
          <el-radio v-model="formData.restWay" :label="1" size="large"
            >标准打卡模式</el-radio
          >
          <span style="margin-left: 20px; font-size: 12px; color: #999"
            >第1次打卡是上班，第2次打卡是下班，后续更新下班打卡</span
          >
        </div>
        <div class="radios">
          <el-radio v-model="formData.restWay" :label="2" size="large"
            >严格打卡模式</el-radio
          >
          <span style="margin-left: 20px; font-size: 12px; color: #999"
            >1次上班，1次下班交替打卡</span
          >
        </div>
      </div>
    </div>
    <div style="margin-top: 40px">
      <div>最小打卡间隔</div>
      <div style="margin-top: 20px">
        <div>
          <span style="margin-right: 5px; font-size: 14px">上班打卡</span>
          <el-select
            v-model="formData.sxtime"
            clearable
            placeholder="不限"
            style="width: 80px"
            ><el-option
              v-for="item in hours"
              :key="item"
              :label="item"
              :value="item"
          /></el-select>
          <span style=" margin-right: 5px;margin-left: 5px; font-size: 14px"
            >小时
          </span>
          <el-select
            v-model="smin"
            clearable
            placeholder="请选择"
            style="width: 80px"
            ><el-option
              v-for="item in mins"
              :key="item"
              :label="item"
              :value="item"
          /></el-select>
          <span style="margin-left: 5px; font-size: 14px"
            >分钟后可下班打卡</span
          >
        </div>
        <div style="margin-top: 20px">
          <span style="margin-right: 5px; font-size: 14px">下班打卡</span>
          <el-select
            v-model="formData.sstime"
            clearable
            placeholder="不限"
            style="width: 80px"
            ><el-option
              v-for="item in hours"
              :key="item"
              :label="item"
              :value="item"
          /></el-select>
          <span style=" margin-right: 5px;margin-left: 5px; font-size: 14px"
            >小时
          </span>
          <el-select
            v-model="emin"
            clearable
            placeholder="请选择"
            style="width: 80px"
            ><el-option
              v-for="item in mins"
              :key="item"
              :label="item"
              :value="item"
          /></el-select>
          <span style="margin-left: 5px; font-size: 14px"
            >分钟后可上班打卡</span
          >
        </div>
      </div>
    </div>
    <div style="margin-top: 40px">
      <div>
        <el-checkbox
          v-model="formData.restAuditFlag"
          label="休息日打卡需审批"
        />
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
