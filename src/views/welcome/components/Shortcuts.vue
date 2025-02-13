<script setup lang="ts">
import { ref, computed, watch } from "vue";

import router from "@/router";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { usePermissionStoreHook } from "@/store/modules/permission";

const items = [
  {
    name: "AddressBook",
    path: "/personnel/addressBook",
    icon: "icon-tongxunlu1",
    title: "通讯录",
    bg: "bg-red-300"
  },
  {
    name: "LeaveManage",
    path: "/personnel/attendance/leave",
    icon: "icon-qingjia",
    title: "请假管理",
    bg: "bg-yellow-300"
  },
  {
    name: "BusinessTravel",
    path: "/personnel/attendance/businessTravel",
    icon: "icon-chucha",
    title: "外出管理",
    bg: "bg-orange-300"
  },
  {
    name: "WorkoverTime",
    path: "/personnel/attendance/workoverTime",
    icon: "icon-jiaban",
    title: "加班管理",
    bg: "bg-green-300"
  },
  {
    name: "AuditList",
    path: "/administration/vehicle/audit",
    icon: "icon-cheliang",
    title: "用车管理",
    bg: "bg-blue-300"
  },
  {
    name: "BorrowingManage",
    path: "/borrowing",
    icon: "icon-jieyue",
    title: "借阅管理",
    bg: "bg-indigo-300"
  },
  {
    name: "ReimbursementManage",
    path: "/reimbursement",
    icon: "icon-feiyongbaoxiao",
    title: "报销管理",
    bg: "bg-purple-300"
  }
];
const bg_color = [
  "bg-red-300",
  "bg-yellow-300",
  "bg-orange-300",
  "bg-green-300",
  "bg-blue-300",
  "bg-indigo-300",
  "bg-purple-300",
  "bg-purple-300"
];

const wholeMenus: any = computed(() => {
  const arr =
    usePermissionStoreHook().wholeMenus.filter(item => item.path != "/") || [];
  // console.log("arr", arr);
  return setTree(arr);
});
const permissionItems = ref([]);
const loading = ref(false);

watch(
  wholeMenus,
  newVal => {
    // console.log("newVal", newVal);
    if (newVal && newVal.length > 0) {
      permissionItems.value = newVal
        .filter(item => {
          return findByName(items, item.name);
        })
        .map((item, index) => {
          return { ...item, bg: bg_color[index] };
        });
    }
  },
  {
    immediate: true
  }
);

watch(
  permissionItems,
  _newVal => {
    // console.log("permissionItems", newVal);
  },
  {
    immediate: true
  }
);

function setTree(data, res = []) {
  data.forEach(item => {
    const { children, ..._item } = item;
    res.push(_item);
    if (children && children.length !== 0) {
      setTree(children, res);
    }
  });
  return res;
}

function findByName(items, name) {
  const item = items.find(item => item.name == name);
  // console.log(name, item);
  return item;
}

function handle() {}
</script>

<template>
  <el-card shadow="hover" style="height: 420px">
    <template #header>
      <div class="card-header">
        <span style="font-size: 16px; font-weight: 500"> 快捷工具 </span>
        <el-button v-if="false" type="primary" size="small" text @click="handle"
          >管理</el-button
        >
      </div>
    </template>
    <el-skeleton :animated="true" :rows="7" :loading="loading">
      <template #default>
        <el-scrollbar :always="false" height="320px" :min-size="0">
          <el-row :gutter="0" justify="start" style="width: 100%">
            <el-col
              v-for="(item, index) in permissionItems"
              :key="index"
              :span="6"
              :offset="0"
              style="margin-bottom: 20px"
            >
              <div class="item" @click="router.push(item.path)">
                <div
                  v-if="true"
                  class="flex justify-center items-center icon text rounded-md shadow-md"
                  :class="[item.bg]"
                >
                  <component
                    :is="useRenderIcon(item.icon)"
                    style="font-size: 24px; color: white"
                  />
                </div>
                <span class="mt-2 text-[13px] label text-dark-200">{{
                  item.title
                }}</span>
              </div>
            </el-col>
          </el-row>
        </el-scrollbar>
      </template>
    </el-skeleton>
  </el-card>
</template>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  .icon {
    width: 48px;
    height: 48px;
  }
}
</style>
