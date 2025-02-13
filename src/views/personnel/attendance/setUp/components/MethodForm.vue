<script setup lang="ts">
import { ElMessage } from "element-plus";
import _ from "lodash";
import { ref, onMounted } from "vue";
import AddAreaDialog from "./AddAreaDialog.vue";
import AddWiFiDialog from "./AddWiFiDialog.vue";
import {
  deleteAttendGroupHitAddr,
  deleteAttendGroupHitWiFi,
  getAttendGroupHitAddrList,
  getAttendGroupHitWiFiList
} from "@/api/attendance";
defineExpose({ getData });
function getData() {
  const param = {
    check1: formData.value.check1,
    check2: formData.value.check2,
    check3: formData.value.check3,
    areaData: tableAreaData.value,
    wifiData: tableWiFiData.value
  };
  return param;
}
const props = defineProps({
  isAreaCheck: {
    require: false,
    type: Boolean,
    default: () => false
  },
  isWiFiCheck: {
    require: false,
    type: Boolean,
    default: () => false
  },
  isFaceCheck: {
    require: false,
    type: Boolean,
    default: () => false
  },
  gid: {
    require: false,
    default: "",
    type: String
  }
});
function getAreaData(val) {
  if (val) {
    getAreas();
  }
}
function getWiFiData(val) {
  if (val) {
    getWifis();
  }
}

const formData = ref({
  id: undefined,
  check1: false,
  check2: false,
  check3: false
});
const addAreaDialogRef = ref(null);
const addWiFiDialogRef = ref(null);
const tableAreaData = ref([]);
const tableWiFiData = ref([]);
function handleAddArea() {
  addAreaDialogRef.value.show(null, "add");
}
async function handleAreaDelete(row, index) {
  console.log(row);
  if (row.id != null && row.id != undefined) {
    const { code, message } = await deleteAttendGroupHitAddr({ id: row.id });
    if (code == 0) {
      ElMessage.success(message);
      getAreas();
    }
  } else {
    tableAreaData.value.splice(index, 1);
  }
}
function handleAreaCallBack(item) {
  console.log(item);
  if (item != null && item != undefined) {
    tableAreaData.value.unshift(item);
  }
}
function handleAddWiFi() {
  addWiFiDialogRef.value.show(null, "add");
}
async function handleWiFiDelete(row, index) {
  console.log(row);
  if (row.id != null && row.id != undefined) {
    const { code, message } = await deleteAttendGroupHitWiFi({ id: row.id });
    if (code == 0) {
      ElMessage.success(message);
      getWifis();
    }
  } else {
    tableWiFiData.value.splice(index, 1);
  }
}
function handleWiFiCallBack(item) {
  if (item != null && item != undefined) {
    tableWiFiData.value.unshift(item);
  }
}
//获取地址
const getAreas = async () => {
  const { data } = await getAttendGroupHitAddrList({
    attendGroupId: formData.value.id
  });
  tableAreaData.value = data.data || [];
};
// 获取wifi
const getWifis = async () => {
  const { data } = await getAttendGroupHitWiFiList({
    attendGroupId: formData.value.id
  });
  tableWiFiData.value = data.data || [];
};
//mounted周期函数
onMounted(async () => {
  console.log("gid--->", props.gid);
  console.log("isAreaCheck--->", props.isAreaCheck);
  console.log("isWiFiCheck--->", props.isWiFiCheck);
  formData.value.check1 = props.isAreaCheck;
  formData.value.check2 = props.isWiFiCheck;
  formData.value.check3 = props.isFaceCheck;
  formData.value.id = props.gid;
  if (props.isAreaCheck) {
    getAreas();
  }
  if (props.isWiFiCheck) {
    getWifis();
  }
});
</script>

<template>
  <div class="mainView">
    <div>考勤方式</div>
    <div style="margin-top: 20px">
      <el-checkbox
        v-model="formData.check1"
        label="地点打卡"
        @change="getAreaData"
      />
      <el-checkbox
        v-model="formData.check2"
        label="WiFi打卡"
        @change="getWiFiData"
      />
      <el-checkbox v-model="formData.check3" label="人脸识别打卡" />
    </div>
    <div v-show="formData.check1" style="margin-top: 20px">
      <span style="margin-right: 20px">地点</span>
      <el-button size="defalut" @click="handleAddArea"> 添加 </el-button>
    </div>
    <div v-show="formData.check1" style="margin-top: 20px">
      <el-table
        border
        :data="tableAreaData"
        highlight-current-row
        :default-expand-all="false"
        row-key="path"
      >
        <el-table-column
          label="名称"
          min-width="200"
          align="left"
          prop="name"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div style="font-size: 16px; font-weight: 500">
              {{ row.name }}
            </div>
            <div>{{ row.address }}</div>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="80" align="center">
          <template #default="scope">
            <el-popconfirm
              title="是否确认删除?"
              @confirm="handleAreaDelete(scope.row, scope.$index)"
            >
              <template #reference>
                <el-button size="defalut" link type="primary"> 删除 </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-show="formData.check2" style="margin-top: 20px">
      <span style="margin-right: 20px">WiFi</span>
      <el-button size="defalut" @click="handleAddWiFi"> 添加 </el-button>
    </div>
    <div v-show="formData.check2" style="margin-top: 20px">
      <el-table
        border
        :data="tableWiFiData"
        highlight-current-row
        :default-expand-all="false"
        row-key="path"
      >
        <el-table-column
          label="名称"
          width="200"
          align="center"
          prop="name"
          show-overflow-tooltip
        />
        <el-table-column
          label="mac地址"
          min-width="160"
          align="center"
          prop="mac"
          show-overflow-tooltip
        />
        <el-table-column fixed="right" label="操作" width="80" align="center">
          <template #default="scope">
            <el-popconfirm
              title="是否确认删除?"
              @confirm="handleWiFiDelete(scope.row, scope.$index)"
            >
              <template #reference>
                <el-button size="defalut" link type="primary"> 删除 </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <AddAreaDialog ref="addAreaDialogRef" @areaCallBack="handleAreaCallBack" />
  <AddWiFiDialog ref="addWiFiDialogRef" @wifiCallBack="handleWiFiCallBack" />
</template>
