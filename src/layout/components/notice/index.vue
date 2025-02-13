<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, onMounted, unref, watch } from "vue";

import { TabItem } from "./data";
import { emitter } from "@/utils/mitt";
import NoticeList from "./noticeList.vue";
import staffNoticeHub from "@/utils/signalr";
import { useUserStoreHook } from "@/store/modules/user";
import { getUnReadNoticeViewReceiverList } from "@/api/noticeReceiver";

const popoverRef = ref();
const noticesNum = ref(0);
const activeName = ref("");
const notices = ref<TabItem[]>();
const time = ref(new Date().getTime());
const { staffId } = storeToRefs(useUserStoreHook());

watch(notices, () => {
  time.value = new Date().getTime();
});

async function loadNoticeData() {
  const { data } = await getUnReadNoticeViewReceiverList({ pageSize: 100 });
  notices.value = data || {};

  if (notices.value && notices.value.length) {
    activeName.value = notices.value[0].name;
    noticesNum.value = 0;
    notices.value.forEach(notice => {
      noticesNum.value += notice.list.length;
    });
  }
}

async function bindStaffNoticeHub() {
  // await staffNoticeHub.register(staffId.value);

  staffNoticeHub.signalr.off("RefreashUnReadMsg");
  staffNoticeHub.signalr.on(
    "RefreashUnReadMsg",
    function (_staffId: Array<string>, menuName: Array<string>) {
      console.log("刷新未读通知-菜单名称menuName：", menuName);
      console.log("刷新未读通知-当前登录staffId：", staffId.value);
      console.log(
        "刷新未读通知-接收SignalR RefreashUnReadMsg方法staffId：",
        _staffId
      );

      const self = _staffId.find(item => item == staffId.value);
      if (self) {
        emitter.emit("onNoticeDataEmitter");
        emitter.emit("reloadStaffNoticeData");
        emitter.emit("onAuditStatusEmitter", menuName);
      }
    }
  );

  staffNoticeHub.signalr.off("RefreashUnReadMsgExt");
  staffNoticeHub.signalr.on(
    "RefreashUnReadMsgExt",
    function (_staffId, menuName) {
      console.log(
        "RefreashUnReadMsgExt",
        `_staffId:${_staffId} menuName:${menuName}`
      );
      if (_staffId == staffId.value) {
        // loadNoticeData();
        // emitter.emit("onAuditStatusEmitter", menuName);
      }
    }
  );
}

function handleClose() {
  unref(popoverRef).popperRef?.delayHide?.();
}

emitter.on("reloadStaffNoticeData", () => {
  loadNoticeData();
});

onMounted(async () => {
  await staffNoticeHub.start();

  staffNoticeHub.signalr.onreconnected(async () => {
    await bindStaffNoticeHub();
  });

  await bindStaffNoticeHub();
});

loadNoticeData();
</script>

<template>
  <el-popover
    ref="popoverRef"
    placement="bottom-end"
    title=""
    width=""
    content=""
    trigger="click"
  >
    <template #reference>
      <span class="dropdown-badge navbar-bg-hover">
        <el-badge
          :value="noticesNum"
          :max="99"
          :hidden="noticesNum >= 1 ? false : true"
        >
          <span class="header-notice-icon">
            <IconifyIconOffline icon="bell" />
          </span>
        </el-badge>
      </span>
    </template>
    <el-tabs
      :key="time"
      v-model="activeName"
      :stretch="false"
      class="dropdown-tabs"
    >
      <el-tab-pane
        v-for="(item, index) in notices"
        :key="item.key"
        :label="item.name"
        :name="item.name"
      >
        <template #label>
          <el-badge
            :value="item.list.length"
            :max="99"
            :hidden="!item.list || item.list.length < 1 ? true : false"
          >
            <span>
              {{ item.name }}
            </span>
          </el-badge>
        </template>
        <el-scrollbar max-height="330px">
          <div class="noticeList-container">
            <NoticeList
              :list="item.list"
              :typeIndex="index"
              @close="handleClose"
            />
          </div>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </el-popover>
</template>

<style>
.ant-tabs-dropdown {
  z-index: 2900 !important;
}
</style>

<style lang="scss" scoped>
.dropdown-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 48px;
  cursor: pointer;

  .header-notice-icon {
    font-size: 18px;
  }
}

:deep(.el-tabs__item .el-badge__content.is-fixed) {
  position: absolute;
  top: 10px;
  right: calc(1px + var(--el-badge-size) / 2);
  transform: translateY(-50%) translateX(100%);
}

.dropdown-tabs {
  width: 336px;
  // box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  border-radius: 4px;

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-scroll) {
    display: flex;
    justify-content: center;
  }

  :deep(.el-tabs__nav-wrap)::after {
    height: 1px;
  }

  :deep(.noticeList-container) {
    padding: 15px 24px 0;
  }
}

:deep(.ant-tabs-nav) {
  margin-bottom: 0;
}
</style>
