<script setup lang="ts">
import qs from "qs";
import { ref, watch } from "vue";
import { Base64 } from "js-base64";
import { getBaseUrl } from "@/utils/http";

const props = defineProps({
  srcList: {
    require: true,
    type: Array,
    default: () => []
  },
  title: {
    require: false,
    default: "预览",
    type: String
  },
  size: {
    require: true,
    default: "default ",
    type: String
  },
  watermark: {
    require: false,
    default: "",
    type: String
  }
});
const emit = defineEmits(["preview"]);

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

function handlePreView(file) {
  emit("preview");
  const params = {
    url: Base64.encode(decodeURI(file.url)),
    watermarkTxt: props.watermark
  };
  const paramsStr = qs.stringify(params, { addQueryPrefix: true });
  const officeUrl = `${getBaseUrl("DOMAIN_PREVIEW")}/onlinePreview${paramsStr}`;
  window.open(officeUrl, "_target");
}
</script>

<template>
  <el-dropdown trigger="click" :size="size" type="primary">
    <el-button
      link
      type="primary"
      :size="size"
      @click="
        () => {
          fileList.length == 1 && handlePreView(fileList[0]);
        }
      "
    >
      {{ title }}
    </el-button>
    <template v-if="fileList.length > 1" #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="(item, index) in fileList" :key="index">
          <el-button link type="info" :size="size" @click="handlePreView(item)">
            <IconifyIconOffline icon="view" class="mr-[6px]" />{{ item.name }}
          </el-button>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
