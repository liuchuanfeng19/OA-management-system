<script setup lang="ts">
import { ref, computed, shallowRef } from "vue";
import { FormInstance } from "element-plus";
import { getNoticeSender } from "@/api/noticeSender";

import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { Editor } from "@wangeditor/editor-for-vue";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  sendStaffId: "", //发送人id
  sendStaffName: "", //发送人
  sendCompanyId: "", //发送公司id
  sendCompanyName: "",
  sendDeptId: "", //发送部门id
  sendDeptName: "",
  title1: "", //标题
  content: "", //内容
  recvDeptIds: "", //接受部门id（逗号分隔）
  recvDeptNames: "", //接收部门名称
  attachment: "", //附件
  isSend: true, //是否发送
  isSendName: "", //是否发送描述
  publishTime: "", //发布时间（只读）
  createTime: "", //创建时间
  canEdit: "" //能否编辑
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formLoading = ref(false);
const formVisible = ref(false);
const formData = ref(null);
const type = ref("add");

const mode = "default";
const editorConfig = { placeholder: "请输入内容..." };
// const toolbarConfig: any = {
//   excludeKeys:
//     "todo,emotion,insertLink,insertTable,insertVideo,codeBlock,group-image,group-video,divider"
// };
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
const editorShow = ref(true);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "query" ? formData.value.title1 : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
    emit("search");
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formVisible.value = true;
};
defineExpose({ show });

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  let { data } = await getNoticeSender({ id });
  formData.value = data || {};
  formLoading.value = false;
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value);
};

// function handleEditor() {
//   editorShow.value = true;
//   editorRef.value.fullScreen();
// }

const handleCreated = editor => {
  editorRef.value = editor; // 记录 editor 实例，重要！
  editorRef.value.on("unFullScreen", () => {
    console.log("unFullScreen");
    editorShow.value = false;
  });
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    fullscreen="fullscreen"
    :title="dialogTitle"
    draggable
    center
    @close="closeDialog"
  >
    <div style="margin: 0 28%">
      <el-card
        shadow="always"
        :body-style="{
          height: 'calc(100vh - 75px)',
          padding: '10px',
          zIndex: 999
        }"
      >
        <Editor
          v-model="formData.content"
          style="
            width: 80%;
            margin: 30px;
            overflow-y: hidden;
          "
          :defaultConfig="editorConfig"
          :mode="mode"
          @onCreated="handleCreated"
        />
      </el-card>
    </div>
    <!-- <div
      style="margin-bottom: 20px; margin-left: 10px; margin-right: 10px"
      v-html="formData.content"
    />
    <template #footer>
      <el-button v-if="type == 'query'" @click="formVisible = false"
        >关闭</el-button
      >
    </template> -->
  </el-dialog>
</template>
<style lang="scss" scoped>
:deep(.el-dialog--center .el-dialog__body) {
  height: 100% !important;
}
</style>
