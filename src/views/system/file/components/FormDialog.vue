<script setup lang="ts">
import { ref, computed } from "vue";

import { saveFile } from "@/api/files";
import { filesUpload } from "@/api/common";
import { ElMessage, genFileId } from "element-plus";
import type {
  UploadFile,
  UploadFiles,
  UploadProps,
  UploadRawFile,
  UploadInstance,
  UploadUserFile,
  FormInstance
} from "element-plus";
import { getBaseUrl } from "@/utils/http";

// 表单模型
const INITIAL_DATA = {
  fileId: undefined,
  fileType: 1,
  fileName: "",
  fileVersion: "",
  downloadUrl: "",
  fileSize: 0,
  description: "",
  isPublished: true
  // isValid: true
  // creator: "",
  // modifyTime: ""
};

// 表单校验规则
const fromRules = {
  downloadUrl: [{ required: true, message: "请上传文件", trigger: "blur" }],
  fileVersion: [
    { required: true, message: "请输入文件版本", trigger: "change" }
  ],
  fileName: [{ required: true, message: "请输入文件名称", trigger: "change" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);
const props = defineProps({
  fileTypeOptions: {
    type: [],
    default: () => []
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const fileList = ref<UploadUserFile[]>([]);
const showType = ref("add");
const uploadRef = ref<UploadInstance>();
const dialogVisible = ref(false);
const fileUploading = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加文件"
    : showType.value == "edit"
      ? "编辑文件"
      : showType.value == "read"
        ? "查看文件"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    formData.value = { ..._formData };
    fileList.value = [
      {
        name: _formData.downloadUrl.substr(
          _formData.downloadUrl.lastIndexOf("/") + 1
        ),
        url: getBaseUrl("DOMAIN_FILE") + _formData.downloadUrl
      }
    ];
  }
};
defineExpose({ show });

const handleBeforeUpload: UploadProps["beforeUpload"] = _rawFile => {
  // if (_rawFile.size / 1024 / 1024 > 50) {
  //   ElMessage.error("所选文件不能超过5Mb");
  //   return false;
  // }
  return true;
};

function handleRemove(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = "";
  formData.value.fileName = "";
}
function handleExceed(files: File[], _uploadFiles: UploadFiles) {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  uploadRef.value!.submit();
}
function handleUpload() {
  uploadRef.value!.submit();
}
const handleError = () => {
  uploadRef.value.clearFiles();
};
const handleSuccess = async _response => {
  uploadRef.value.clearFiles();
};
//上传文件
async function handleUpLoad(options) {
  const path = "/tyOA/FileManage";
  const param = { path: path, file: options.file };
  fileUploading.value = true;
  filesUpload(param, 0)
    .then(res => {
      console.log("options", options);
      formData.value[options.action] = res["data"][0];
      formData.value.fileName = options.file.name;
      formData.value.fileSize = parseInt(options.file.size / 1024);
      fileList.value = [
        {
          name: options.file.name,
          url: getBaseUrl("DOMAIN_FILE") + res["data"][0]
        }
      ];
      ruleFormRef.value.validateField(options.action, () => null);
    })
    .finally(() => {
      fileUploading.value = false;
    });
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await saveFile(formData.value);
      if (code == 0) {
        ElMessage.success(message);
        dialogVisible.value = false;
        resetForm(formEl);
        emit("search");
      }
    }
  });
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  fileList.value = [];
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
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="632"
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
      <el-row :gutter="40">
        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="文件名称" prop="fileName">
            <el-input
              v-model.trim="formData.fileName"
              :readonly="true"
              placeholder="请输入文件名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="文件大小" prop="fileSize">
            <el-input
              v-model="formData.fileSize"
              type="number"
              :readonly="true"
              placeholder=""
            >
              <template #suffix> KB </template>
            </el-input>
          </el-form-item>
        </el-col>
         -->
        <el-col v-if="showType != 'read'" :span="24" :offset="0">
          <el-form-item label="文件上传" prop="downloadUrl">
            <el-upload
              ref="uploadRef"
              v-model:file-list="fileList"
              action="downloadUrl"
              :disabled="showType == 'read' || fileUploading"
              :auto-upload="true"
              multiple
              :limit="1"
              :http-request="handleUpLoad"
              :before-upload="handleBeforeUpload"
              :on-error="handleError"
              :on-success="handleSuccess"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove(uploadFile, uploadFiles, 'downloadUrl');
                }
              "
              :on-exceed="handleExceed"
            >
              <template #trigger>
                <el-button
                  :loading="fileUploading"
                  size="small"
                  type="primary"
                  :disabled="showType == 'read'"
                  >选择文件</el-button
                >
                <!-- <div class="el-upload__tip ml-2">（注：大小不能超过50M）</div> -->
              </template>
              <el-button
                v-if="false"
                style="margin-left: 10px"
                size="small"
                type="success"
                @click="handleUpload"
                >上传至服务器</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="文件名称" prop="fileName">
            <el-input
              v-model.trim="formData.fileName"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="文件类型" prop="fileType">
            <el-select v-model="formData.fileType" placeholder="请选择">
              <el-option
                v-for="item in props.fileTypeOptions"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="文件版本" prop="fileVersion">
            <el-input
              v-model.trim="formData.fileVersion"
              :placeholder="showType == 'read' ? '' : '请输入'"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col v-if="showType == 'read'" :span="24" :offset="0">
          <el-form-item label="下载路径" prop="downloadUrl">
            <el-input
              v-model.trim="formData.downloadUrl"
              :readonly="true"
              :placeholder="showType == 'read' ? '' : '请输入'"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发布情况">
            <el-switch
              v-model="formData.isPublished"
              active-text="已发布"
              inactive-text="未发布"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="文件描述" prop="description">
            <el-input
              v-model.trim="formData.description"
              :readonly="showType == 'read'"
              type="textarea"
              show-word-limit
              :maxlength="255"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'read'"
        :disabled="fileUploading"
        :title="fileUploading ? '文件上传中' : ''"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
