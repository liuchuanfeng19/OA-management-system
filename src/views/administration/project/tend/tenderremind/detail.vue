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
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "TenderJoinDetail"
});

const mode = "default";
const route = useRoute();
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 内容 HTML
const valueHtml = ref("<p>hello</p>");
const { openType, content } = storeToRefs(useEditorStoreHook());
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return openType.value == "add"
    ? "添加招标公告"
    : openType.value == "edit"
      ? "编辑招标公告"
      : openType.value == "read"
        ? "查看招标公告"
        : "";
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

const toolbarConfig: any = { excludeKeys: "fullScreen" };
const editorConfig = reactive({
  placeholder: openType.value == "read" ? "" : "请输入内容...",
  readOnly: openType.value == "read"
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
    targetPath: "/administration/project/tend/tenderremind"
  });
};
// initToDetail("params");
</script>

<template>
  <el-card>
    <template #header>
      <div class="card-header flex justify-between items-center">
        <span class="font-medium">
          <el-link
            target="_blank"
            type="default"
            :underline="false"
            :icon="useRenderIcon(openType == 'read' ? 'view' : 'edit')"
            style=" margin: 0 4px 5px;font-size: 16px"
          >
            {{ dialogTitle }}
          </el-link>
        </span>
        <el-button
          type="primary"
          :icon="useRenderIcon(openType == 'read' ? 'close' : 'save')"
          @click="handleBack()"
        >
          {{ openType == "read" ? "关闭" : "保存" }}
        </el-button>
      </div>
    </template>
    <div class="wangeditor">
      <Toolbar
        v-show="openType != 'read'"
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
      />
      <Editor
        v-model="valueHtml"
        style="width: 100%; overflow-y: hidden"
        :style="{
          height:
            openType == 'read' ? 'calc(100vh - 220px)' : 'calc(100vh - 260px)'
        }"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
      />
    </div>
  </el-card>
</template>
