<script setup lang="ts">
import _ from "lodash";
import { ref, onMounted, nextTick } from "vue";
import TimesDialog from "./TimesDialog.vue";
import { getWorkDay } from "@/api/attendance";
defineExpose({ getData });
const props = defineProps({
  gid: {
    require: false,
    default: "",
    type: String
  }
});
function getData() {
  // if (multipleSelection.value.length > 0) {
  //   let param = {
  //     check1: formData.value.check1,
  //     check2: formData.value.check2,
  //     weekData: dataList
  //   };
  //   return param;
  // } else {
  //   return workData;
  // }
  const param = {
    check1: formData.value.check1,
    check2: formData.value.check2,
    weekData: dataList.value
  };
  return param;
}

const formData = ref({
  id: undefined,
  ids: [],
  check1: false,
  check2: false
});
const timesDialogRef = ref(null);
const multipleTableRef = ref(null);
const dataList = ref([
  {
    day: 1,
    flag: false,
    period: "09:00-18:00"
  },
  {
    day: 2,
    flag: false,
    period: "09:00-18:00"
  },
  {
    day: 3,
    flag: false,
    period: "09:00-18:00"
  },
  {
    day: 4,
    flag: false,
    period: "09:00-18:00"
  },
  {
    day: 5,
    flag: false,
    period: "09:00-18:00"
  },
  {
    day: 6,
    flag: false,
    period: ""
  },
  {
    day: 7,
    flag: false,
    period: ""
  }
]);
const multipleSelection = ref([]);
//编辑
const editIdx = ref(0);
function handleEdit(row, index) {
  console.log(row, index);
  editIdx.value = index;
  timesDialogRef.value.show(row);
}
function handleTimeSetCallBack(times) {
  console.log("times---->", times);
  const item = dataList.value[editIdx.value];
  item.period = times;
  if (times != "" && item != null) {
    item.flag = true;
    multipleTableRef.value.toggleRowSelection(item, true);
  }
}
// 表格行选中回调
// function handleSelectionChange(val) {
//   multipleSelection.value = val;

//   formData.value.ids = multipleSelection.value.map(item => {
//     return item.id;
//   });
// }
function handleSingleRow(selection, row) {
  console.log(selection, row);
  multipleSelection.value = [];
  dataList.value.forEach(item => {
    if (item.day == row.day) {
      item.flag = !item.flag;
      if (item.flag && (item.period == "" || item.period == null)) {
        item.period = "09:00-18:00";
      }
    }
    if (item.flag) {
      multipleSelection.value.push(item);
    }
  });
}
function handleAllSelection(selection) {
  console.log(selection);

  if (selection == 0) {
    dataList.value.forEach(item => {
      item.flag = false;
    });
  } else {
    dataList.value.forEach(item => {
      item.flag = true;
      if (item.period == "" || item.period == null) {
        item.period = "09:00-18:00";
      }
    });
  }
  multipleSelection.value = [];
  dataList.value.forEach(item => {
    if (item.flag) {
      multipleSelection.value.push(item);
    }
  });
}
async function getDetail() {
  const { data } = await getWorkDay({ id: formData.value.id });
  console.log("data---->", data);
  formData.value.check1 = data.dayFestFlag;
  formData.value.check2 = data.dayRestFlag;
  const items = data.items || [];
  dataList.value = items;
  dataList.value.forEach(item => {
    if (item.flag) {
      nextTick(() => {
        multipleTableRef.value.toggleRowSelection(item, true);
      });
    } else {
      nextTick(() => {
        multipleTableRef.value.toggleRowSelection(item, false);
      });
    }
  });
}

//mounted周期函数
onMounted(async () => {
  formData.value.id = props.gid;
  if (formData.value.id != null && formData.value.id != "") {
    getDetail();
  }
});
</script>

<template>
  <div class="mainView">
    <div>工作日设置</div>
    <div style="margin-top: 20px">
      <el-table
        ref="multipleTableRef"
        border
        :data="dataList"
        highlight-current-row
        :default-expand-all="false"
        row-key="path"
        @select="handleSingleRow"
        @select-all="handleAllSelection"
      >
        <el-table-column type="selection" align="center" width="60" />
        <el-table-column
          label="工作日"
          width="100"
          align="center"
          prop="day"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.day == 1">周一</span>
            <span v-if="row.day == 2">周二</span>
            <span v-if="row.day == 3">周三</span>
            <span v-if="row.day == 4">周四</span>
            <span v-if="row.day == 5">周五</span>
            <span v-if="row.day == 6">周六</span>
            <span v-if="row.day == 7">周日</span>
            <span v-else />
          </template>
        </el-table-column>
        <el-table-column
          label="班次时间段"
          min-width="160"
          align="center"
          prop="period"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.period != ''">{{ row.period }}</span>
            <span v-else>休息</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="80" align="center">
          <template #default="scope">
            <el-button
              link
              type="primary"
              @click="handleEdit(scope.row, scope.$index)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div style="margin-top: 20px">
      <el-checkbox v-model="formData.check1" label="法定节假日自动排休" />
      <el-checkbox v-model="formData.check2" label="休息日打卡需审批" />
    </div>
  </div>
  <TimesDialog ref="timesDialogRef" @timeSetCallBack="handleTimeSetCallBack" />
</template>
