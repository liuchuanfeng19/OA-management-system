<script setup lang="ts">
import _ from "lodash";
import { ElMessage, FormInstance } from "element-plus";
import { ref, onMounted } from "vue";
import AddStaffDialog from "./components/AddStaffDialog.vue";
import TimesDialog from "./components/TimesDialog.vue";
import UpdateClockDialog from "./components/UpdateClockDialog.vue";
import TimesForm from "./components/TimesForm.vue";
import MethodForm from "./components/MethodForm.vue";
import WorkoverTimeForm from "./components/WorkoverTimeForm.vue";
import FieldPersonnelForm from "./components/FieldPersonnelForm.vue";
import RestDayForm from "./components/RestDayForm.vue";
import { useRoute } from "vue-router";
import route from "@/router";
import {
  getAttendGroupDetailBasic,
  createAttendGroupBasic,
  updateAttendGroupBasic,
  updateAttendGroupWorkData,
  updateAttendGroupHitData,
  updateAttendGroupOutData,
  updateAttendGroupRestData,
  updateAttendGroupExData
} from "@/api/attendance";
const router = useRoute();
defineOptions({
  name: "AttendanceSetUp"
});
const rules = {
  name: [{ required: true, message: "请输入考勤组名称", trigger: "blur" }]
};
const formData = ref({
  name: "",
  ids: []
});
const did = ref("");
const ruleFormRef = ref<FormInstance>();
const requesting = ref(false);
const drawerTitle = ref("");
const drawerType = ref("");
const drawerVisible = ref(false); //显示
//关闭
function handleClose() {
  drawerVisible.value = false;
}
//取消
function cancelClick() {
  drawerVisible.value = false;
}
//确定
function confirmClick() {
  if (drawerType.value == "date") {
    isChecked1.value = false;
    isChecked2.value = false;
    workdays.value = "";
    const data = timesFormRef.value.getData();
    console.log("data----->", data);
    if (data != null && data != undefined) {
      isChecked1.value = data.check1;
      isChecked2.value = data.check2;
      const weeks = data.weekData;
      weeks.forEach(item => {
        if (workdays.value == "") {
          workdays.value =
            getweek(item.day) + ":" + item.period == "" ? "休息" : item.period;
        } else {
          workdays.value =
            workdays.value + "、" + getweek(item.day) + ":" + item.period == ""
              ? "休息"
              : item.period;
        }
      });
      submitTimes(weeks);
    }
    drawerVisible.value = false;
  } else if (drawerType.value == "method") {
    methods.value = "";
    methodAddrcontents.value = "";
    methodWificontents.value = "";
    const data = methodFormRef.value.getData();
    if (data != null && data != undefined) {
      let areas = "";
      let wifis = "";
      const areaItems = [];
      const wifiItems = [];
      if (data.areaData.length > 0) {
        if (methods.value == "") {
          methods.value = "地点打卡";
        } else {
          methods.value = methods.value + "、" + "地点打卡";
        }
        data.areaData.forEach(item => {
          if (areas == "") {
            areas = "地点打卡：" + item.name;
          } else {
            areas = areas + "、" + item.name;
          }
          areaItems.push({
            id: item.id,
            attendGroupId: did.value,
            name: item.name,
            address: item.address,
            longitude: item.longitude,
            latitude: item.latitude
          });
        });
      } else {
        data.check1 = false;
      }
      if (data.wifiData.length > 0) {
        if (methods.value == "") {
          methods.value = "WiFi打卡";
        } else {
          methods.value = methods.value + "、" + "WiFi打卡";
        }
        data.wifiData.forEach(item => {
          if (wifis == "") {
            wifis = "wifi打卡：" + item.name;
          } else {
            wifis = wifis + "、" + item.name;
          }
          wifiItems.push({
            id: item.id,
            attendGroupId: did.value,
            name: item.name,
            mac: item.mac
          });
        });
      } else {
        data.check2 = false;
      }
      isChecked3.value = data.check1;
      isChecked4.value = data.check2;
      isChecked5.value = data.check3;
      methodAddrcontents.value = areas;
      methodWificontents.value = wifis;
      submitMethods(areaItems, wifiItems);
    }
    drawerVisible.value = false;
  } else if (drawerType.value == "fieldPersonnel") {
    const data = fieldPersonnelFormRef.value.getData();
    if (data != null && data != undefined) {
      fieldPersonnels.value = data.switch;
      fieldPersonnelAudits.value = data.check1;
      fieldPersonnelAuditMethods.value = data.radio;
      fieldPersonnelRemarks.value = data.check2;
      fieldPersonnelPhotos.value = data.check3;
      fieldPersonnelAddrs.value = data.check4;
      submitfieldPersonnels();
    }
    drawerVisible.value = false;
  } else if (drawerType.value == "restDay") {
    const data = restDayFormRef.value.getData();
    if (data != null && data != undefined) {
      submitRests(data);
    }
    drawerVisible.value = false;
  } else if (drawerType.value == "workoverTime") {
    const data = workoverTimeFormRef.value.getData();
    if (data != null && data != undefined) {
      submitWorkOverTimes(data);
    }
    drawerVisible.value = false;
  }
}
function getweek(day) {
  if (day == 1) {
    return "周一";
  } else if (day == 2) {
    return "周二";
  } else if (day == 3) {
    return "周三";
  } else if (day == 4) {
    return "周四";
  } else if (day == 5) {
    return "周五";
  } else if (day == 6) {
    return "周六";
  } else if (day == 7) {
    return "周日";
  } else {
    return "";
  }
}
//考勤人员
const addStaffDialogRef = ref(null);
const isHaveStaffs = ref(false);
const staffNames = ref("");
const staffIds = ref([]);
const staffCount = ref(0);
function handleStaff() {
  addStaffDialogRef.value.show(staffIds.value, staffNames.value);
}
//选择员工回调
function handleStaffCallBack(data) {
  staffNames.value = "";
  staffIds.value = [];
  staffCount.value = 0;
  console.log("选择的员工----->", data);
  if (data != null && data != undefined) {
    staffCount.value = data.length;
    data.forEach(item => {
      staffIds.value.push(item.staffId);
      if (staffNames.value == "") {
        staffNames.value = item.staffName;
      } else {
        staffNames.value = staffNames.value + "," + item.staffName;
      }
    });
  }
}
//工作时间
const timesFormRef = ref(null);
const workdays = ref(""); //工作日班次
// const day1s = ref(false); //周一
// const day1ps = ref(""); //周一时间段
// const day2s = ref(false); //周二时间段
// const day2ps = ref(""); //工作日班次
// const day3s = ref(false); //周三
// const day3ps = ref(""); //周三时间段
// const day4s = ref(false); //周四
// const day4ps = ref(""); //周四时间段
// const day5s = ref(false); //周五
// const day5ps = ref(""); //周五时间段
// const day6s = ref(false); //周六
// const day6ps = ref(""); //周六时间段
// const day7s = ref(false); //周日
// const day7ps = ref(""); //周日时间段
const isChecked1 = ref(false); //法定节假日自动排休
const isChecked2 = ref(false); //休息日打卡是否需审批
function handleDate() {
  checkStaffs();
  drawerTitle.value = "考勤时间";
  drawerType.value = "date";
  drawerVisible.value = true;
}
//控制打卡方式
const methodFormRef = ref(null);
const isChecked3 = ref(false); //地点打卡
const isChecked4 = ref(false); //wifi打卡
const isChecked5 = ref(false); //人脸识别打卡
const methods = ref("");
const methodAddrcontents = ref("");
const methodWificontents = ref("");
//显示打卡
function handleMethod() {
  checkStaffs();
  drawerTitle.value = "打卡方式";
  drawerType.value = "method";
  drawerVisible.value = true;
}
//加班规则
const workoverTimeFormRef = ref(null);
const weekdays = ref("");
const restdays = ref("");
const holidays = ref("");
function handleWorkoverTime() {
  checkStaffs();
  drawerTitle.value = "加班规则";
  drawerType.value = "workoverTime";
  drawerVisible.value = true;
}
//补卡
const updateClockDialogRef = ref(null);
const monthCount = ref("");
const lastDays = ref("");
const types = ref("");
function handleUpdateClock() {
  checkStaffs();
  updateClockDialogRef.value.show(did.value, "add");
}

//外勤打卡规则
const fieldPersonnelFormRef = ref(null);
const fieldPersonnels = ref(false);
const fieldPersonnelAudits = ref(null);
const fieldPersonnelAuditMethods = ref(null);
const fieldPersonnelRemarks = ref(null);
const fieldPersonnelPhotos = ref(null);
const fieldPersonnelAddrs = ref(null);
function handleFieldPersonnel() {
  checkStaffs();
  drawerTitle.value = "外勤打卡规则";
  drawerType.value = "fieldPersonnel";
  drawerVisible.value = true;
}
//休息日规则
const restDayFormRef = ref(null);
const restDayAudits = ref(null);
const restDaysTimes = ref("");
const restDaysWays = ref(0);
const restDayOnMins = ref(0);
const restDayOffMins = ref(0);
function handleRestDay() {
  checkStaffs();
  drawerTitle.value = "休息日规则";
  drawerType.value = "restDay";
  drawerVisible.value = true;
}

function checkStaffs() {
  if (!isHaveStaffs.value && staffCount.value > 0) {
    submitForm(ruleFormRef.value);
  }
}
//更新基本信息
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      requesting.value = true;
      const param = {
        name: formData.value.name,
        staffIds: staffIds.value,
        staffNames: staffNames.value,
        staffCount: staffCount.value
      };
      if (did.value != "") {
        param["id"] = did.value;
        const { code, message } = await updateAttendGroupBasic(param);
        if (code == 0) {
          ElMessage.success(message);
          getDetailData();
        }
      } else {
        const { code, message } = await createAttendGroupBasic(param);
        if (code == 0) {
          ElMessage.success(message);
          route.back();
        }
      }
      requesting.value = false;
    }
  });
}, 300);
//更新考勤时间
const submitTimes = async data => {
  const param = {
    id: did.value,
    items: data,
    dayFestFlag: isChecked1.value,
    dayRestFlag: isChecked2.value
  };
  const { code, message } = await updateAttendGroupWorkData(param);
  if (code == 0) {
    ElMessage.success(message);
    getDetailData();
  }
};
//更新打卡方式
const submitMethods = async (adata, wdata) => {
  const param = {
    id: did.value,
    addrItems: adata,
    wiFiItems: wdata,
    hitAddress: isChecked3.value,
    hitWiFi: isChecked4.value,
    hitFace: isChecked5.value
  };
  const { code, message } = await updateAttendGroupHitData(param);
  if (code == 0) {
    ElMessage.success(message);
    getDetailData();
  }
};
//更新外勤打卡
const submitfieldPersonnels = async () => {
  const param = {
    id: did.value,
    outFlag: fieldPersonnels.value,
    outAuditFlag: fieldPersonnelAudits.value,
    outAuditWay: fieldPersonnelAuditMethods.value,
    outCommentFlag: fieldPersonnelRemarks.value,
    outPhotoFlag: fieldPersonnelPhotos.value,
    outAddrFlag: fieldPersonnelAddrs.value
  };
  const { code, message } = await updateAttendGroupOutData(param);
  if (code == 0) {
    ElMessage.success(message);
    getDetailData();
  }
};
//更新休息日设置
const submitRests = async data => {
  const param = Object.assign({}, data);
  param.id = did.value;
  const { code, message } = await updateAttendGroupRestData(param);
  if (code == 0) {
    ElMessage.success(message);
    getDetailData();
  }
};
//更新加班设置
const submitWorkOverTimes = async data => {
  const param = Object.assign({}, data);
  param.id = did.value;
  const { code, message } = await updateAttendGroupExData(param);
  if (code == 0) {
    ElMessage.success(message);
    getDetailData();
  }
};
//关闭对话框
const cancelForm = () => {
  route.back();
  resetForm(ruleFormRef.value);
};
// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//获取详情信息
const getDetailData = async () => {
  const param = { id: did.value };
  const { data } = await getAttendGroupDetailBasic(param);
  console.log(data);
  formData.value = data;
  staffIds.value = data.staffIds;
  staffCount.value = data.staffCount;
  staffNames.value = data.staffNames;
  if (staffCount.value > 0) {
    isHaveStaffs.value = true;
  } else {
    isHaveStaffs.value = false;
  }
  // let times = "";
  // if (
  //   data.day1Period == data.day2Period &&
  //   data.day2Period == data.day3Period &&
  //   data.day3Period == data.day4Period &&
  //   data.day4Period == data.day5Period
  // ) {
  //   times = "周一、周二、周三、周四、周五：" + "默认班次：" + data.day1Period;
  // } else {
  //   if (data.day1Flag) {
  //     times = times + "周一" + data.day1Period;
  //   }
  //   if (data.day2Flag) {
  //     times = times + "周二" + data.day2Period;
  //   }
  //   if (data.day3Flag) {
  //     times = times + "周三" + data.day3Period;
  //   }
  //   if (data.day4Flag) {
  //     times = times + "周四" + data.day4Period;
  //   }
  //   if (data.day5Flag) {
  //     times = times + "周五" + data.day5Period;
  //   }
  //   if (data.day6Flag) {
  //     times =
  //       times + "周六" + (data.day6Period == "" ? "休息" : data.day6Period);
  //   }
  //   if (data.day7Flag) {
  //     times =
  //       times + "周日" + (data.day7Period == "" ? "休息" : data.day7Period);
  //   }
  // }
  // workdays.value = times;
  workdays.value = data.dayName;
  isChecked1.value = data.dayFestFlag;
  isChecked2.value = data.dayRestFlag;

  isChecked3.value = data.hitAddress;
  isChecked4.value = data.hitWiFi;
  isChecked5.value = data.hitFace;
  methods.value = "";
  methodAddrcontents.value = "";
  methodWificontents.value = "";
  if (data.hitAddress) {
    if (methods.value == "") {
      methods.value = "地点打卡";
    } else {
      methods.value = methods.value + "、" + "地点打卡";
    }
    methodAddrcontents.value = data.hitAddressName;
  }
  if (data.hitWiFi) {
    if (methods.value == "") {
      methods.value = "WiFi打卡";
    } else {
      methods.value = methods.value + "、" + "WiFi打卡";
    }
    methodWificontents.value = data.hitWiFiName;
  }
  if (data.hitFace) {
    if (methods.value == "") {
      methods.value = "人脸识别打卡";
    } else {
      methods.value = methods.value + "、" + "人脸识别打卡";
    }
  }
  fieldPersonnels.value = data.outFlag;
  fieldPersonnelAudits.value = data.outAuditFlag;
  fieldPersonnelAuditMethods.value = data.outAuditWay;
  fieldPersonnelRemarks.value = data.outCommentFlag;
  fieldPersonnelPhotos.value = data.outPhotoFlag;
  fieldPersonnelAddrs.value = data.outAddrFlag;

  monthCount.value = data.fixCount;
  lastDays.value = data.fixTime;
  types.value = data.fixType.join(",");

  restDayAudits.value = data.restAuditFlag;
  restDaysTimes.value = data.restStartTime;
  restDaysWays.value = data.restWay;
  restDayOnMins.value = data.restOnInterval;
  restDayOffMins.value = data.restOffInterval;

  if (data.exWorkFlag) {
    if (data.exWorkCalcWay == 1) {
      weekdays.value = "加班需要审核，按审批时长计算";
    } else if (data.exWorkCalcWay == 2) {
      weekdays.value = "加班需要审核，在审批的时段内，按打卡时长计算";
    } else if (data.exWorkCalcWay == 3) {
      weekdays.value = "加班不需要审核";
    } else {
      weekdays.value = "工作日允许加班";
    }
  } else {
    weekdays.value = "";
  }
  if (data.exFestFlag) {
    if (data.exFestCalcWay == 1) {
      holidays.value = "加班需要审核，按审批时长计算";
    } else if (data.exFestCalcWay == 2) {
      holidays.value = "加班需要审核，在审批的时段内，按打卡时长计算";
    } else if (data.exFestCalcWay == 3) {
      holidays.value = "加班不需要审核";
    } else {
      holidays.value = "节假日允许加班";
    }
  } else {
    holidays.value = "";
  }
  if (data.exRestFlag) {
    if (data.exRestCalcWay == 1) {
      restdays.value = "加班需要审核，按审批时长计算";
    } else if (data.exRestCalcWay == 2) {
      restdays.value = "加班需要审核，在审批的时段内，按打卡时长计算";
    } else if (data.exRestCalcWay == 3) {
      restdays.value = "加班不需要审核";
    } else {
      restdays.value = "休息日允许加班";
    }
  } else {
    restdays.value = "";
  }
  if (data.exFestFlag) {
    if (data.exFestCalcWay == 1) {
      holidays.value = "加班需要审核，按审批时长计算";
    } else if (data.exFestCalcWay == 2) {
      holidays.value = "加班需要审核，在审批的时段内，按打卡时长计算";
    } else if (data.exFestCalcWay == 3) {
      holidays.value = "加班不需要审核";
    } else {
      holidays.value = "";
    }
  }
};

//mounted周期函数
onMounted(async () => {
  console.log("id---->", router.query);
  did.value = router.query.id.toString();
  if (did.value != "") {
    getDetailData();
  }
});
</script>
<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>考勤设置</span>
      </div>
    </template>
    <div class="bodyView">
      <div class="form">
        <el-form
          ref="ruleFormRef"
          :model="formData"
          :rules="rules"
          label-width="92px"
          class="form"
        >
          <el-row :gutter="20">
            <el-col :span="24" :offset="0">
              <el-form-item label="考勤组名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入" />
              </el-form-item>
            </el-col>
            <el-col :span="24" :offset="0">
              <el-form-item label="考勤组人员">
                <el-button size="defalut" type="text" @click="handleStaff">
                  设置
                </el-button>
              </el-form-item>
            </el-col>
            <el-col v-show="staffNames != ''" :span="24" :offset="0">
              <el-form-item>
                <div>参与考勤人员：{{ staffNames }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="24" :offset="0">
              <el-form-item label="考勤时间">
                <el-button
                  :disabled="did == ''"
                  size="defalut"
                  type="text"
                  @click="handleDate"
                >
                  设置
                </el-button>
              </el-form-item>
            </el-col>
            <el-col
              v-show="workdays != '' || isChecked1 || isChecked2"
              :span="24"
              :offset="0"
            >
              <el-form-item>
                <div v-show="workdays != ''">工作日：{{ workdays }}</div>
                <div v-show="isChecked1">法定节假日自动排休</div>
                <div v-show="isChecked2">休息日打卡需审批</div>
              </el-form-item>
            </el-col>
            <el-col :span="24" :offset="0">
              <el-form-item label="打卡方式">
                <el-button
                  :disabled="did == ''"
                  size="defalut"
                  type="text"
                  @click="handleMethod"
                >
                  设置
                </el-button>
              </el-form-item>
            </el-col>
            <el-col
              v-show="
                methods != '' ||
                methodAddrcontents != '' ||
                methodWificontents != ''
              "
              :span="24"
              :offset="0"
            >
              <el-form-item>
                <div v-show="methods != ''">考勤方式：{{ methods }}</div>
                <div v-show="methodAddrcontents != ''">
                  地点打卡：{{ methodAddrcontents }}
                </div>
                <div v-show="methodWificontents != ''">
                  WiFi打卡：{{ methodWificontents }}
                </div>
                <div v-show="isChecked5">人脸识别打卡</div>
              </el-form-item>
            </el-col>
            <el-col :span="24" :offset="0">
              <el-form-item label="加班规则">
                <el-button
                  :disabled="did == ''"
                  size="defalut"
                  type="text"
                  @click="handleWorkoverTime"
                >
                  设置
                </el-button>
              </el-form-item>
            </el-col>
            <el-col
              v-show="weekdays != '' || restdays != '' || holidays != ''"
              :span="24"
              :offset="0"
            >
              <el-form-item>
                <div v-show="weekdays != ''">工作日: {{ weekdays }}</div>
                <div v-show="restdays != ''">休息日: {{ restdays }}</div>
                <div v-show="holidays != ''">节假日: {{ holidays }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="24" :offset="0">
              <el-form-item label="外勤规则">
                <el-button
                  :disabled="did == ''"
                  size="defalut"
                  type="text"
                  @click="handleFieldPersonnel"
                >
                  设置
                </el-button>
              </el-form-item>
            </el-col>
            <el-col
              v-show="
                fieldPersonnels &&
                (fieldPersonnelAudits != null ||
                  fieldPersonnelRemarks != null ||
                  fieldPersonnelPhotos != null ||
                  fieldPersonnelAddrs != null)
              "
              :span="24"
              :offset="0"
            >
              <el-form-item>
                <div v-show="fieldPersonnelAudits">
                  <span>外勤打卡需审批</span>
                  <span
                    v-show="fieldPersonnelAuditMethods != null"
                    style="font-size: 12px; color: #999"
                    >{{
                      fieldPersonnelAuditMethods == "1"
                        ? "（先审批，后打卡）"
                        : "（先打卡，后审批）"
                    }}</span
                  >
                </div>
                <div v-show="fieldPersonnelRemarks">外勤打卡需填写备注</div>
                <div v-show="fieldPersonnelPhotos">外勤打卡需拍照</div>
                <div v-show="fieldPersonnelAddrs">外勤打卡需详细地址</div>
              </el-form-item>
            </el-col>
            <el-col :span="24" :offset="0">
              <el-form-item label="休息日规则">
                <el-button
                  :disabled="did == ''"
                  size="defalut"
                  type="text"
                  @click="handleRestDay"
                >
                  设置
                </el-button>
              </el-form-item>
            </el-col>
            <el-col
              v-show="
                restDayAudits != null ||
                (restDaysTimes != '' && restDaysTimes != null) ||
                restDaysWays != 0 ||
                restDayOnMins != 0 ||
                restDayOffMins != 0
              "
              :span="24"
              :offset="0"
            >
              <el-form-item>
                <div v-show="restDayAudits != null">
                  {{
                    restDayAudits ? "休息日打卡需审批" : "休息日打卡无需审批"
                  }}
                </div>
                <div v-show="restDaysTimes != '' && restDaysTimes != null">
                  {{ restDaysTimes }}之后记为当天考勤
                </div>
                <div v-show="restDayOnMins != 0">
                  上班打卡{{ restDayOnMins }}分钟后可下班打卡
                </div>
                <div v-show="restDayOffMins != 0">
                  下班打卡{{ restDayOffMins }}分钟后可上班打卡
                </div>
                <div v-show="restDaysWays != 0">
                  <span v-show="restDaysWays == 1">标准打卡模式</span>
                  <span v-show="restDaysWays == 2">严格打卡模式</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="24" :offset="0">
              <el-form-item label="补卡规则">
                <el-button
                  :disabled="did == ''"
                  size="defalut"
                  type="text"
                  @click="handleUpdateClock"
                >
                  设置
                </el-button>
              </el-form-item>
            </el-col>
            <el-col
              v-show="monthCount != '' || lastDays != '' || types != ''"
              :span="24"
              :offset="0"
            >
              <el-form-item>
                <div v-show="monthCount != ''">
                  补卡次数：每个月可提交{{ monthCount }}次
                </div>
                <div v-show="lastDays != ''">
                  补卡时间：可申请最近{{ lastDays }}个自然日内的补卡
                </div>
                <div v-show="types != ''">补卡类型：{{ types }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <div class="buttons">
                <el-button @click="cancelForm">取消</el-button>
                <el-button
                  :loading="requesting"
                  type="primary"
                  @click="submitForm(ruleFormRef)"
                  >提交
                </el-button>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      direction="rtl"
      :before-close="handleClose"
    >
      <div v-if="drawerType == 'date'">
        <TimesForm ref="timesFormRef" :gid="did" />
      </div>
      <div v-if="drawerType == 'method'">
        <MethodForm
          ref="methodFormRef"
          :isAreaCheck="isChecked3"
          :isWiFiCheck="isChecked4"
          :isFaceCheck="isChecked5"
          :gid="did"
        />
      </div>
      <div v-if="drawerType == 'workoverTime'">
        <WorkoverTimeForm ref="workoverTimeFormRef" :gid="did" />
      </div>
      <div v-if="drawerType == 'fieldPersonnel'">
        <FieldPersonnelForm ref="fieldPersonnelFormRef" :gid="did" />
      </div>
      <div v-if="drawerType == 'restDay'">
        <RestDayForm ref="restDayFormRef" :gid="did" />
      </div>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="cancelClick">取消</el-button>
          <el-button type="primary" @click="confirmClick">确认</el-button>
        </div>
      </template>
    </el-drawer>
    <AddStaffDialog
      ref="addStaffDialogRef"
      @staffCallBack="handleStaffCallBack"
    />
    <TimesDialog ref="timesDialogRef" />
    <UpdateClockDialog
      ref="updateClockDialogRef"
      @updateClockCallBack="getDetailData"
    />
  </el-card>
</template>

<style scoped lang="scss">
.bodyView {
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  .form {
    width: 800px;

    .buttons {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
    }
  }
}
</style>
