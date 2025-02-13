<script setup lang="ts">
import { ref, unref, watch, computed } from "vue";
import { ElMessage, ElLoading, genFileId } from "element-plus";
import type {
  UploadFile,
  UploadFiles,
  UploadRawFile,
  UploadInstance,
  UploadUserFile,
  FormInstance
} from "element-plus";

import { uploadImg } from "@/api/common";
import { saveAppFile } from "@/api/appFile";
import { isVersion } from "@/utils/validate";
import { getAppSystemListNv } from "@/api/nameValue";
import { useCopyToClipboard } from "@pureadmin/utils";

defineOptions({
  name: "AppForm"
});

const { clipboardValue, copied } = useCopyToClipboard();

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 在 <script setup> 中使用 defineProps API 来声明 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const appSystemList = ref([]);
const formVisible = ref(false);
const formData = ref(props.data);
const uploadRef = ref<UploadInstance>();
const ruleFormRef = ref<FormInstance>();
const fileList = ref<UploadUserFile[]>([]);
//const formLoading = ref(false);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return formData.value.id ? "编辑APP" : "添加APP";
});

// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => formVisible.value,
  val => {
    emit("update:visible", val);
  }
);
watch(
  () => props.visible,
  val => {
    formVisible.value = val;
    if (val) {
      getAppSystemList();
    }
  }
);
watch(
  () => props.data,
  val => {
    if (val.id) {
      // getDetail();
      formData.value = val;
      fileList.value = [
        {
          name: val.downloadUrl.substr(val.downloadUrl.lastIndexOf("/") + 1),
          url: val.downloadUrl
        }
      ];
    } else {
      formData.value = val;
    }
    formData.value = val;
  }
);
const packageNameRule = (rule: any, value: any, callback: any) => {
  if (!value && formData.value.appSys != 2) {
    return callback(new Error("请上传升级包"));
  } else {
    callback();
  }
};
const downloadUrlRule = (rule: any, value: any, callback: any) => {
  if (
    !value &&
    (formData.value.appSys != 2 ||
      (formData.value.appSys == 2 && formData.value.isEnterprise == false))
  ) {
    return callback(new Error("请输入下载地址"));
  } else {
    callback();
  }
};

// 表单校验规则;
const rules = {
  appSys: [{ required: true, message: "请选择系统平台", trigger: "change" }],
  appName: [{ required: true, message: "请输入软件名称", trigger: "blur" }],
  packageName: [
    {
      trigger: "change",
      validator: packageNameRule
    }
  ],
  downloadUrl: [
    {
      trigger: "blur",
      validator: downloadUrlRule
    }
  ],
  appVersionName: [
    {
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value) {
          if (!isVersion(value)) {
            callback(new Error("软件版本格式不正确"));
          } else {
            callback();
          }
        } else {
          callback(new Error("请输入软件版本"));
        }
      }
    }
  ],
  appVersion: [{ required: true, message: "请输入业务版本", trigger: "blur" }],
  description: [
    { required: true, message: "请输入升级描述", trigger: "change" }
  ]
};

function getAppSystemList() {
  getAppSystemListNv({ isSearch: 0 })
    .then(({ data }) => {
      appSystemList.value = data || [];
    })
    .catch(() => {
      appSystemList.value = [];
    });
}

function handleIsEnterpriseChange() {
  formData.value.downloadUrl = "";
}

function handleAppSysChange(val) {
  uploadRef.value && uploadRef.value.clearFiles();
  formData.value.packageName = "";
  if (val == 2) {
    //IOS
    formData.value.downloadUrl = "";
    formData.value.isEnterprise = false;
  } else {
    formData.value.downloadUrl = "";
    formData.value.isEnterprise = false;
  }
}
function handleCopy() {
  clipboardValue.value = unref(formData.value.downloadUrl);
  if (copied.value) {
    ElMessage.success("拷贝成功");
  }
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await saveAppFile(formData.value);
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
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
  uploadRef.value?.clearFiles();
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  fileList.value = [];
  resetForm(ruleFormRef.value);
};

// // 修改表单时根据id获取详情数据
// async function getDetail() {
//   formLoading.value = true;
//   let { data } = await getBusinessTravel({ id: props.data.id });
//   formData.value = data || {};
//   formLoading.value = false;
// }

//上传文件
async function fileUpload(options) {
  const loading = ElLoading.service({
    lock: true,
    text: "Loading",
    background: "rgba(0, 0, 0, 0.7)"
  });
  const path = "/systemMgr/AppFile/AndroidApk";
  uploadImg({ file: options.file, path: path })
    .then(res => {
      formData.value.downloadUrl = res["data"][0];
      if (formData.value.downloadUrl) {
        const url = formData.value.downloadUrl;
        const index = url.lastIndexOf("/");
        const str = url.substring(index + 1, url.length);
        formData.value.packageName = str;
      }
      fileList.value = [
        {
          name: options.file.name,
          url: res["data"][0]
        }
      ];
    })
    .finally(() => {
      loading.close();
      ruleFormRef.value.validateField("packageName", () => null);
      ruleFormRef.value.validateField("downloadUrl", () => null);
    });
}
const handleError = () => {
  uploadRef.value.clearFiles();
};
const handleSuccess = async _response => {
  uploadRef.value.clearFiles();
};

function onChange(options) {
  console.log(options);
}
function handleRemove(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  this.file = [];
  this.apkFileName = "";
  formData.value.downloadUrl = "";
  formData.value[action] = "";
}
function handleExceed(files: File[], _uploadFiles: UploadFiles) {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  uploadRef.value!.submit();
}
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
          <el-form-item label="系统平台" prop="appSys">
            <el-select
              v-model="formData.appSys"
              :disabled="formData.id"
              placeholder="请选择"
              @change="handleAppSysChange"
            >
              <el-option
                v-for="item in appSystemList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="软件名称" prop="appName">
            <el-input v-model="formData.appName" placeholder="请输入" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="软件版本" prop="appVersionName">
            <el-input
              v-model.trim="formData.appVersionName"
              placeholder="格式：1.0.0.0"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="业务版本" prop="appVersion">
            <el-input-number
              v-model="formData.appVersion"
              :controls="false"
              :step="1"
              :min="1"
              :precision="0"
              step-strictly
              value-on-clear="min"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="强制升级">
            <el-switch v-model="formData.isMust" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发布">
            <el-switch v-model="formData.isPublished" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        v-if="formData.appSys != 2"
        label="升级包"
        prop="packageName"
      >
        <el-upload
          ref="uploadRef"
          v-model:file-list="fileList"
          accept="*"
          action="packageName"
          :auto-upload="true"
          multiple
          :limit="1"
          list-type="text"
          :http-request="fileUpload"
          :on-error="handleError"
          :on-success="handleSuccess"
          :on-remove="
            (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
              handleRemove(uploadFile, uploadFiles, 'downloadUrl');
            }
          "
          :on-exceed="handleExceed"
          :on-change="onChange"
        >
          <template #default>
            <el-button type="primary">选择文件</el-button>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item v-if="formData.appSys == 2" label="企业版">
        <el-switch
          v-model="formData.isEnterprise"
          active-text="是"
          inactive-text="否"
          :active-value="true"
          :inactive-value="false"
          @change="handleIsEnterpriseChange"
        />
      </el-form-item>
      <el-form-item
        v-if="formData.isEnterprise == false"
        label="下载地址"
        prop="downloadUrl"
      >
        <el-input
          v-model="formData.downloadUrl"
          :disabled="formData.appSys != 2"
        >
          <template #append>
            <el-button type="primary" @click="handleCopy">复制</el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="升级描述" prop="description">
        <el-input
          v-model="formData.description"
          placeholder="请输入"
          type="textarea"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
:deep(.el-input-number .el-input__inner) {
  line-height: 1;
  text-align: left;
  appearance: none;
  appearance: textfield;
}
</style>
