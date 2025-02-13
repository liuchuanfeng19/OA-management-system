<script setup lang="ts">
import { ref, computed } from "vue";
// import { saveRole } from "@/api/role";
import { getNoticeDetail } from "@/api/notice";
import { FormInstance } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  noticeType: "",
  title: "",
  content: "",
  isRead: false,
  attachment: "",
  createTime: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formLoading = ref(false);
const formVisible = ref(false);
const formData = ref(null);
const type = ref("add");

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加"
    : type.value == "edit"
      ? "编辑"
      : type.value == "query"
        ? "查看"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.noticeId);
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
  let { data } = await getNoticeDetail({ id });
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
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="720"
    draggable
    @close="closeDialog"
  >
    <div style="margin-bottom: 20px" v-html="formData.content" />
    <template #footer>
      <el-button v-if="type == 'query'" @click="formVisible = false"
        >关闭</el-button
      >
    </template>
  </el-dialog>
</template>
