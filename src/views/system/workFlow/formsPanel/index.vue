<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { getToken } from "@/utils/auth";

const origin =
  import.meta.env.MODE == "development"
    ? "http://192.168.8.76:88/workFlow/"
    : window.location.origin + "/workFlow/";

const iframeRef = ref();
const containerHeight = ref(0);

// 设置表格组件高度
const setTableHeight = () => {
  nextTick(() => {
    containerHeight.value = window.innerHeight - 106;
  });
};

onMounted(() => {
  setTableHeight();
  const iframeContentWindow = iframeRef.value.contentWindow;
  const token = getToken();
  if (token) {
    const data = JSON.parse(token);
    iframeRef.value.addEventListener("load", () => {
      iframeContentWindow.postMessage(
        {
          type: "token",
          data: data.accessToken,
          parentPageName: "formsPanel"
        },
        origin
      );
    });
    window.addEventListener("message", e => {
      if (
        e.data.parentPageName == "formsPanel" &&
        e.origin != window.location.origin &&
        e.data.type != "webpackOk"
      ) {
        console.log("child message", e);
      }
    });
  }
});

// 窗口尺寸改变事件回调
window.onresize = function () {
  setTableHeight();
};
</script>

<template>
  <iframe
    id="myiframe"
    ref="iframeRef"
    name="myiframe"
    scrolling="no"
    :src="origin + '?t=' + Date.now()"
    class="main flex border-transparent"
    :style="{
      width: 'calc(100% - 20px)',
      height: containerHeight + 'px'
    }"
    frameborder="0"
  />
</template>
