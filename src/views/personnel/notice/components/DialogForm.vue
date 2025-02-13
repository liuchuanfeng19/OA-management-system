<script setup lang="ts">
import { ref, computed } from "vue";
import { getNoticeReceiver } from "@/api/noticeReceiver";
import { FormInstance } from "element-plus";
import { emitter } from "@/utils/mitt";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  noticeType: "",
  title1: "",
  content: "",
  isRead: false,
  attachment: "",
  createTime: ""
};

// 表单校验规则
const rules = {
  companyName: [{ required: true, message: "请输入公司名称", trigger: "blur" }]
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
      ? "修改"
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
    fileList.value = [];
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formVisible.value = true;
};
defineExpose({ show });

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getNoticeReceiver({ id });
  formData.value = data || {};
  imgUrl.value = data.certImages;
  fileList.value = [{ name: "", url: data.certImages }];
  formLoading.value = false;

  emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
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

const fileList = ref([]);
const imgUrl = ref("");
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="620"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="78px"
    >
      <el-row :gutter="20">
        <el-col :span="23" :offset="0">
          <el-form-item label="标题" prop="title1">
            <el-input
              v-model="formData.title1"
              :readonly="type == 'query'"
              :placeholder="type == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="23" :offset="0">
          <el-form-item label="内容" prop="content">
            <el-input
              v-model="formData.content"
              type="textarea"
              :readonly="type == 'query'"
              :placeholder="type == 'query' ? '' : '请输入'"
              :rows="10"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="23" :offset="0">
          <el-form-item label="创建时间" prop="createTime">
            <el-input v-model="formData.createTime" readonly />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button v-if="type == 'query'" @click="formVisible = false"
        >关闭</el-button
      >
    </template>
  </el-dialog>
</template>
