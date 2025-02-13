<script setup lang="ts">
import moment from "moment";
import { ref, reactive, computed, watch, nextTick } from "vue";

import { emitter } from "@/utils/mitt";
import { getFileList } from "@/api/files";
import { DownloadButton } from "@/components/DownloadButton";
import { getUnReadNoticeReceiverList } from "@/api/noticeReceiver";

const props = defineProps({
  listType: {
    require: true,
    type: String,
    default: "notice" //notice、rules、knowledge、to-do、done、personneWarning、financeWarning、projectWarning
  }
});
import { getBaseUrl } from "@/utils/http";

const listData = ref([]);
const params = reactive({
  pageIndex: 1,
  pageSize: 20
});
const textData = computed(() => {
  switch (props.listType) {
    case "notice":
      return {
        name: "通知公告",
        bgColor: "bg-green-300",
        icon: "icon-tongzhigonggao",
        func: getNoticeList
      };
    case "rules":
      return {
        name: "规章制度",
        bgColor: "bg-blue-300",
        icon: "icon-guizhangzhidu",
        func: getRulesList
      };
    case "knowledge":
      return {
        name: "知识库",
        bgColor: "bg-indigo-300",
        icon: "icon-zhishiku",
        func: getKnowledgeList
      };
    default:
      return {};
  }
});

watch(
  () => props.listType,
  () => {
    nextTick(() => {
      textData.value?.func();
    });
  },
  { immediate: true }
);

function getNoticeList() {
  const _params = { ...params };
  getUnReadNoticeReceiverList(_params)
    .then(({ data }) => {
      const _data =
        data.data ||
        [
          // { title: "采购合同付款审批即将到期", busiType: "公司发文" }
        ];
      listData.value = _data.map(item => {
        return {
          title: item.title1,
          deptName: item.sendDeptName,
          staffName: item.sendStaffName,
          category: item.busiType,
          createTime: item.createTime
        };
      });
    })
    .catch(() => {
      listData.value = [];
    });
}
function getRulesList() {
  const _params = { ...params, fileType: 5 };
  getFileList(_params)
    .then(({ data }) => {
      const _data = data.data || [];
      listData.value = _data.map(item => {
        return {
          title: item.fileName,
          deptName: item.creator,
          staffName: item.creator,
          category: item.fileTypeDesc,
          createTime: item.createTime,
          url: item.downloadUrl
        };
      });
    })
    .catch(() => {
      listData.value = [];
    });
}
function getKnowledgeList() {
  const _params = { ...params, fileType: 6 };
  getFileList(_params)
    .then(({ data }) => {
      const _data = data.data || [];
      listData.value = _data.map(item => {
        return {
          title: item.fileName,
          deptName: item.creator,
          staffName: item.creator,
          category: item.fileTypeDesc,
          createTime: item.createTime,
          url: item.downloadUrl
        };
      });
    })
    .catch(() => {
      listData.value = [];
    });
}

emitter.on("onNoticeDataEmitter", () => {
  textData.value?.func();
});
</script>

<template>
  <el-scrollbar height="326px" :min-size="0">
    <template v-if="listData.length > 0">
      <div
        v-for="(item, index) in listData"
        :key="index"
        class="item flex flex-wrap items-center text-sm"
      >
        <div class="icon-name flex flex-wrap flex-1 items-center">
          <!-- <IconifyIconOffline
          :icon="icon"
          class="icon mr-4 text-white"
          :class="bgColor"
        /> -->
          <div
            class="icon mr-4 text-white flex justify-center items-center"
            :class="textData.bgColor"
          >
            <FontIcon svg :icon="textData.icon" />
          </div>
          <div
            class="name flex-1 w-[0px] text-ellipsis overflow-hidden whitespace-nowrap"
          >
            {{ item.title }}
          </div>
        </div>
        <div class="item-right flex flex-wrap justify-end">
          <div class="user text-gray-400 ml-5 text-right">
            {{ item.deptName }}
          </div>
          <div class="time text-gray-400 ml-5 mr-4 w-[70px] text-right">
            {{ moment(item.createTime).fromNow() }}
          </div>
          <DownloadButton
            v-if="item.url"
            :srcList="[getBaseUrl('DOMAIN_FILE') + item.url]"
          />
        </div>
      </div>
    </template>
    <el-empty v-else :image-size="64">
      <el-button v-if="false" type="primary" @click="textData?.func()"
        >刷新</el-button
      >
    </el-empty>
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.item {
  position: relative;
  height: 34px;
  margin-bottom: 12px;

  // &::before {
  //   position: absolute;
  //   bottom: 0;
  //   width: 100%;
  //   height: 1px;
  //   background-color: var(--el-border-color-light);
  //   content: "";
  // }

  .icon-name {
    flex: 1;
  }
}

.icon {
  width: 34px;
  height: 34px;
  padding: 8px;
  font-weight: bolder;
  color: red;
  cursor: pointer;
  border-radius: 17px;
  -webkit-text-fill-color: white;
}
</style>
