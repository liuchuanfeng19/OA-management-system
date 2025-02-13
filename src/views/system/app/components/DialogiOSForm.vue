<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { saveAppleAppStore } from "@/api/appFile";

defineOptions({
  name: "AppForm"
});

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  appName: "",
  downloadCode: "",
  downloadUrl: "",
  isUsed: false,
  remark: "",
  modifyTime: ""
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const formVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const showType = ref("add");
const ruleFormRef = ref<FormInstance>();
const formLoading = ref(false);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_formData != null) {
    formData.value = _formData;
  }
  showType.value = _type;
};
defineExpose({ show });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "edit" ? "编辑iOS下载链接" : "添加iOS下载链接";
});

// 表单校验规则;
const rules = {
  appName: [{ required: true, message: "请输入软件名称", trigger: "blur" }],
  downloadCode: [
    { required: true, message: "请输入升级包的代码", trigger: "blur" }
  ],
  downloadUrl: [
    { required: true, message: "请输入升级包的路径", trigger: "blur" }
  ]
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      formLoading.value = true;
      const { code, message } = await saveAppleAppStore(formData.value);
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
        resetForm(formEl);
        emit("search");
      }
      formLoading.value = false;
    }
  });
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="760"
    draggable
    :before-close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="软件名称" prop="appName">
            <el-input v-model="formData.appName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="升级包的代码" prop="downloadCode">
            <el-input
              v-model.trim="formData.downloadCode"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="升级包的路径" prop="downloadUrl">
            <el-input
              v-model.trim="formData.downloadUrl"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否使用">
            <el-switch v-model="formData.isUsed" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          placeholder="请输入"
          type="textarea"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button
        :loading="formLoading"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
    </template>
  </el-dialog>
</template>
