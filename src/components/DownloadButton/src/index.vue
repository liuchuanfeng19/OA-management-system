<script setup lang="ts">
import { ref, watch } from "vue";
import { downloadFile } from "@/api/common";

const props = defineProps({
  showFileName: {
    require: false,
    type: Boolean,
    default: false
  },
  srcList: {
    require: true,
    type: Array,
    default: () => []
  },
  size: {
    require: true,
    default: "default ",
    type: String
  }
});
const emit = defineEmits(["download"]);

const fileList = ref([]);

watch(
  () => props.srcList,
  newVal => {
    if (newVal) {
      fileList.value = newVal.map((item: string) => {
        return { url: item, name: item.substring(item.lastIndexOf("/") + 1) };
      });
    }
  },
  {
    immediate: true
  }
);

function handleDownload(file) {
  emit("download");
  downloadFile({
    url: file.url
  });
}
</script>

<template>
  <div v-if="showFileName">
    <div
      v-for="(item, index) in fileList"
      :key="index"
      class="file-download flex flex-wrap justify-start items-center"
      @click="handleDownload(item)"
    >
      <IconifyIconOffline icon="document" class="mr-[6px]" />
      <div
        class="text-ellipsis overflow-hidden whitespace-nowrap"
        style="max-width: calc(100% - 62px)"
      >
        {{ item.name }}
      </div>
      <el-button link type="primary" :size="size" class="ml-2">
        下载
      </el-button>
    </div>
  </div>
  <template v-else>
    <el-dropdown trigger="click" :size="size" type="primary">
      <el-button
        link
        type="primary"
        :size="size"
        @click="
          () => {
            fileList.length == 1 && handleDownload(fileList[0]);
          }
        "
      >
        下载
      </el-button>
      <template v-if="fileList.length > 1" #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="(item, index) in fileList" :key="index">
            <el-button
              link
              type="info"
              :size="size"
              @click="handleDownload(item)"
            >
              <IconifyIconOffline icon="download" class="mr-[6px]" />{{
                item.name
              }}
            </el-button>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </template>
</template>

<style lang="scss" scoped>
.file-download {
  width: 100%;
}
</style>
