<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import {
  onBeforeUnmount,
  ref,
  watch,
  shallowRef,
  computed,
  reactive
} from "vue";

import { emitter } from "@/utils/mitt";
import { useEditorStoreHook } from "@/store/modules/editor";
import { Editor } from "@wangeditor/editor-for-vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "NoticeDetail"
});

const mode = "default";
const route = useRoute();
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 内容 HTML
const valueHtml = ref("<p>hello</p>");
const { openType, content, title } = storeToRefs(useEditorStoreHook());
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return openType.value == "query" ? title.value : "";
});
const { setContent } = useEditorStoreHook();

watch(
  content,
  newVal => {
    valueHtml.value = newVal;
  },
  {
    immediate: true
  }
);

const editorConfig = reactive({
  placeholder: openType.value == "query" ? "" : "请输入内容...",
  readOnly: openType.value == "query"
});

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = editor => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};

const handleBack = () => {
  setContent(valueHtml.value);
  emitter.emit("closeTag", {
    routeName: route.name as string,
    query: route.query,
    targetPath: "/personnel/notice"
  });
};
// initToDetail("params");
</script>

<template>
  <div style="margin: 0 28%">
    <el-card
      :body-style="{
        height: 'calc(100vh - 75px)',
        padding: '10px',
        zIndex: 999
      }"
    >
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span class="font-medium">
            <el-link
              target="_blank"
              type="default"
              :underline="false"
              style=" margin: 0 4px 5px;font-size: 24px; font-weight: bold"
            >
              {{ dialogTitle }}
            </el-link>
          </span>
          <el-button
            type="primary"
            :icon="useRenderIcon(openType == 'query' ? 'back' : 'save')"
            @click="handleBack()"
          >
            {{ openType == "query" ? "返回" : "保存" }}
          </el-button>
        </div>
      </template>
      <div class="wangeditor">
        <Editor
          v-model="valueHtml"
          style="width: 80%; margin: 30px; overflow-y: hidden"
          :style="{
            height:
              openType == 'query'
                ? 'calc(100vh - 220px)'
                : 'calc(100vh - 260px)'
          }"
          :defaultConfig="editorConfig"
          :mode="mode"
          @onCreated="handleCreated"
        />
      </div>
    </el-card>
  </div>
</template>
