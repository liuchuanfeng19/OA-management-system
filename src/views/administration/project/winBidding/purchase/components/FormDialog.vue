<script setup lang="ts">
import type {
  UploadInstance,
  UploadProps,
  UploadRawFile,
  FormInstance
} from "element-plus";
import { ref, computed, watch, type PropType } from "vue";

import { Project } from "../data";
import { saveRole } from "@/api/role";
import { uploadImg } from "@/api/common";
import { ElMessage, genFileId } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "", //项目Id
  projectName: "", //项目名称
  projectShortName: "", //项目立项简称
  file1: "", //下采单
  file2: "", //合同
  file3: "", //发票、入库单
  file4: "" //发货签收单
};

// 表单校验规则
const fromRules = {
  projectName: [{ required: true, message: "项目名称不能为空" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

const props = defineProps({
  projectOptions: {
    type: Array as PropType<Array<Project>>,
    default: () => []
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const formData = ref({ ...INITIAL_DATA });
const fileList1 = ref([]);
const fileList2 = ref([]);
const fileList3 = ref([]);
const fileList4 = ref([]);
const showType = ref("add");
const dialogVisible = ref(false);
const uploadRef1 = ref<UploadInstance>();
const uploadRef2 = ref<UploadInstance>();
const uploadRef3 = ref<UploadInstance>();
const uploadRef4 = ref<UploadInstance>();
const ruleFormRef = ref<FormInstance>();

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加投标项目信息表附件"
    : showType.value == "edit"
      ? "编辑投标项目信息表附件"
      : showType.value == "read"
        ? "查看投标项目信息表附件"
        : "";
});
watch(
  () => formData.value.projectName,
  newVal => {
    console.log("projectName", newVal);
    if (!newVal) {
      formData.value.projectShortName = "";
      return;
    }
    const projet = props.projectOptions.find(
      item => item.projectName == newVal
    );
    formData.value.projectShortName = projet.projectShortName;
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    formData.value = { ..._formData };
  }
};
defineExpose({ show });

//上传图片
async function handleUpLoadImg(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    switch (options.action) {
      case "upload1":
        formData.value.file1 = res["data"][0];
        fileList1.value = [{ name: options.file.name, url: res["data"][0] }];
        ruleFormRef.value.validateField("file1", () => null);
        break;
      case "upload2":
        formData.value.file2 = res["data"][0];
        fileList2.value = [{ name: options.file.name, url: res["data"][0] }];
        ruleFormRef.value.validateField("file2", () => null);
        break;
      case "upload3":
        formData.value.file3 = res["data"][0];
        fileList3.value = [{ name: options.file.name, url: res["data"][0] }];
        ruleFormRef.value.validateField("file3", () => null);
        break;
      case "upload4":
        formData.value.file4 = res["data"][0];
        fileList4.value = [{ name: options.file.name, url: res["data"][0] }];
        ruleFormRef.value.validateField("file4", () => null);
        break;
      default:
        break;
    }
  });
}
const handleExceed1: UploadProps["onExceed"] = files => {
  uploadRef1.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef1.value!.handleStart(file);
  uploadRef1.value!.submit();
};
const handleExceed2: UploadProps["onExceed"] = files => {
  uploadRef2.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef2.value!.handleStart(file);
  uploadRef2.value!.submit();
};
const handleExceed3: UploadProps["onExceed"] = files => {
  uploadRef3.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef3.value!.handleStart(file);
  uploadRef3.value!.submit();
};
const handleExceed4: UploadProps["onExceed"] = files => {
  uploadRef4.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef4.value!.handleStart(file);
  uploadRef4.value!.submit();
};

const handleError1 = () => {
  uploadRef1.value.clearFiles();
};
const handleError2 = () => {
  uploadRef2.value.clearFiles();
};
const handleError3 = () => {
  uploadRef3.value.clearFiles();
};
const handleError4 = () => {
  uploadRef4.value.clearFiles();
};

const handleSuccess1 = async response => {
  console.log("response", response);
  uploadRef1.value.clearFiles();
};
const handleSuccess2 = async response => {
  console.log("response", response);
  uploadRef2.value.clearFiles();
};
const handleSuccess3 = async response => {
  console.log("response", response);
  uploadRef3.value.clearFiles();
};
const handleSuccess4 = async response => {
  console.log("response", response);
  uploadRef4.value.clearFiles();
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await saveRole(formData.value);
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
    :width="740"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="150px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="项目名称" prop="projectName">
            <el-select
              v-model="formData.projectName"
              placeholder="请选择"
              clearable
              filterable
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in props.projectOptions"
                :key="item.projectId"
                :label="item.projectName"
                :value="item.projectName"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="项目立项简称" prop="projectShortName">
            <el-input v-model="formData.projectShortName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="下采单" prop="file1">
            <el-upload
              ref="uploadRef1"
              action="upload1"
              :auto-upload="true"
              :file-list="fileList1"
              :http-request="handleUpLoadImg"
              :limit="1"
              :on-exceed="handleExceed1"
              :on-error="handleError1"
              :on-success="handleSuccess1"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip text-red">
                  只能上传一个小于5M的PDF文件
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同" prop="file2">
            <el-upload
              ref="uploadRef2"
              action="upload2"
              :auto-upload="true"
              :file-list="fileList2"
              :http-request="handleUpLoadImg"
              :limit="1"
              :on-exceed="handleExceed2"
              :on-error="handleError2"
              :on-success="handleSuccess2"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip text-red">
                  只能上传一个小于5M的PDF文件
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="发票、入库单" prop="file3">
            <el-upload
              ref="uploadRef3"
              action="upload3"
              :auto-upload="true"
              :file-list="fileList3"
              :http-request="handleUpLoadImg"
              :limit="1"
              :on-exceed="handleExceed3"
              :on-error="handleError3"
              :on-success="handleSuccess3"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip text-red">
                  只能上传一个小于5M的PDF文件
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="发货签收单" prop="file4">
            <el-upload
              ref="uploadRef4"
              action="upload4"
              :auto-upload="true"
              :file-list="fileList4"
              :http-request="handleUpLoadImg"
              :limit="1"
              :on-exceed="handleExceed4"
              :on-error="handleError4"
              :on-success="handleSuccess4"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip text-red">
                  只能上传一个小于5M的PDF文件
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
