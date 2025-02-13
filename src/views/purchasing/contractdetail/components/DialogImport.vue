<script setup lang="ts">
import _ from "lodash";
import type {
  UploadProps,
  FormInstance,
  UploadRawFile,
  UploadInstance,
  UploadUserFile
} from "element-plus";
import { ref, computed } from "vue";
import { importCollectItem } from "@/api/reqOrderItem";
import { ElMessage, genFileId } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  projectId: "", //项目Id
  attach: "" //附件物资合同清单
};

// 表单校验规则
const fromRules = {
  projectId: [{ required: true, message: "请选择项目名称" }],
  attach: [{ required: true, message: "请上传附件" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const formData = ref({ ...INITIAL_DATA });
const fileList = ref<UploadUserFile[]>([]); //物资合同
const showType = ref("add");
const projectList = ref([]);
const dialogVisible = ref(false);
const uploadRef = ref<UploadInstance>();
const fileData = ref<FormData>();
const ruleFormRef = ref<FormInstance>();
const importLoading = ref(false);
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "导入待采单";
});

// 子组件暴露给父组件调用的方法
const show = async (projectData, projectId) => {
  dialogVisible.value = true;
  importLoading.value = false;
  formData.value = { ...INITIAL_DATA };
  projectList.value = projectData;
  formData.value.projectId = projectId;
};
defineExpose({ show });

const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
  if (
    rawFile.type != "application/vnd.ms-excel" &&
    rawFile.type !=
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    ElMessage.error("不支持的文件类型");
    return false;
  }
  return true;
};

//上传附件
async function handleUpLoad(options) {
  const data = new FormData();
  data.append("file", options.file);
  fileData.value = data;
  formData.value.attach = options.file.name;
  fileList.value = [options.file];
}
const handleExceed: UploadProps["onExceed"] = files => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  uploadRef.value!.submit();
};
// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      importLoading.value = true;
      const { code, message } = await importCollectItem(
        formData.value,
        fileData.value
      );
      if (code == 0) {
        ElMessage.success(message);
        dialogVisible.value = false;
        resetForm(formEl);
        emit("search");
      }
      importLoading.value = false;
    }
  });
}, 300);

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  fileList.value = [];
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="370"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :disabled="showType == 'read'"
      :model="formData"
      :rules="fromRules"
      label-width="96px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              placeholder="请选择"
              filterable
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in projectList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="附件" prop="attachXshtmx">
            <el-upload
              ref="uploadRef"
              action="attachXshtmx"
              :file-list="fileList"
              :http-request="handleUpLoad"
              class="uploader"
              :limit="1"
              :before-upload="handleBeforeUpload"
              :on-exceed="handleExceed"
              style="width: 100%"
            >
              <el-button type="primary" text>选择文件</el-button>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false"> 取消 </el-button>
      <el-button
        v-if="showType != 'read'"
        :loading="importLoading"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
