<script setup lang="ts">
// import { ref } from "vue";
// const lists = ref([
//   { type: "", label: "善良" },
//   { type: "success", label: "好学" },
//   { type: "info", label: "幽默" },
//   { type: "danger", label: "旅游" },
//   { type: "warning", label: "追剧" }
// ]);
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useUserStoreHook } from "@/store/modules/user";
import router from "@/router";
import { getUserInfo } from "@/api/user";
import { getStaff } from "@/api/staff";

const { staffName, departmentName } = storeToRefs(useUserStoreHook());
const personalForm = ref({
  staffId: "",
  staffCode: "",
  staffName: "",
  sex: "",
  healthInfo: "",
  nativePlace: "",
  nationality: "",
  birthday: "",
  shortNumber: "",
  idCard: "",
  jobStatus: 0,
  officePhone: "",
  homeAddress: "",
  mobile: "",
  jobCall: "",
  jobLevel: "",
  deptName: "",
  remarks: ""
});

//通讯录
function handleContact() {
  router.push("/personnel/addressBook");
}
//请假
function handleLeave() {
  router.push("/personnel/attendance/leave");
}
//出差
function handleBusinessTravel() {
  router.push("/personnel/attendance/businessTravel");
}
//车辆申请
function handleDrive() {
  router.push("/administration/vehicle/audit");
}

const getUser = async () => {
  const { data } = await getUserInfo();
  const res = await getStaff(data.staffId);
  personalForm.value = Object.assign(personalForm.value, res.data);
};
getUser();
</script>

<template>
  <el-descriptions class="margin-top" direction="vertical" :column="3" border>
    <el-descriptions-item>
      <template #label>
        <el-icon>
          <IconifyIconOffline icon="user" />
        </el-icon>
        用户名
      </template>
      <p v-if="staffName">{{ staffName }}</p>
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <el-icon>
          <IconifyIconOffline icon="iphone" />
        </el-icon>
        手机号
      </template>
      {{ personalForm.mobile }}
      <!-- 18125694028 -->
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <el-icon>
          <IconifyIconOffline icon="location" />
        </el-icon>
        部门
      </template>
      <p v-if="departmentName">{{ departmentName }}</p>
    </el-descriptions-item>
  </el-descriptions>
  <el-descriptions class="margin-top" direction="vertical" :column="2" border>
    <el-descriptions-item>
      <template #label>
        <el-icon>
          <IconifyIconOffline icon="tickets" />
        </el-icon>
        年假剩余天数
      </template>
      <!-- <el-tag
        v-for="item in lists"
        :key="item.label"
        :type="item.type"
        size="small"
        effect="dark"
      >
        {{ item.label }}
      </el-tag> -->
      10天
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <el-icon>
          <IconifyIconOffline icon="tickets" />
        </el-icon>
        已请事假天数
      </template>
      5天
    </el-descriptions-item>
  </el-descriptions>
  <el-descriptions
    v-if="false"
    class="margin-top"
    direction="vertical"
    :column="1"
    border
  >
    <el-descriptions-item>
      <template #label>
        <el-icon>
          <IconifyIconOffline icon="notebook" />
        </el-icon>
        快捷入口
      </template>
      <el-button link type="primary" @click="handleContact()">
        通讯录
      </el-button>
      <el-button link type="primary" @click="handleLeave()">
        请假管理
      </el-button>
      <el-button link type="primary" @click="handleBusinessTravel()">
        出差管理
      </el-button>
      <el-button link type="primary" @click="handleDrive()">
        车辆管理
      </el-button>
    </el-descriptions-item>
  </el-descriptions>
</template>

<style scoped>
.el-tag {
  margin-right: 10px !important;
}
</style>
