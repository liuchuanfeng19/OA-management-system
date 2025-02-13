<script setup lang="ts">
import type {
  UploadInstance,
  UploadUserFile,
  UploadFile,
  UploadFiles,
  UploadProps,
  UploadRequestOptions,
  UploadRawFile
} from "element-plus";
import { genFileId } from "element-plus";
import { ref, PropType, toRef, watch } from "vue";

import { uploadImg } from "@/api/common";
import { DownloadButton } from "@/components/DownloadButton";

const props = defineProps({
  modelValue: {
    require: true,
    type: [Array<String>, String],
    default: ""
  },
  fileList: {
    require: true,
    type: Array as PropType<UploadUserFile[]>,
    default: () => []
  },
  uploading: {
    require: true,
    type: Boolean,
    default: false
  },
  drag: {
    require: false,
    type: Boolean,
    default: false
  },
  autoUpload: {
    require: false,
    type: Boolean,
    default: true
  },
  multiple: {
    require: false,
    type: Boolean,
    default: true
  },
  disabled: {
    require: true,
    type: Boolean,
    default: false
  },
  accept: {
    require: false,
    type: String,
    default: "*"
  },
  path: {
    require: true,
    type: String,
    default: "/tyOA"
  },
  fieldName: {
    require: true,
    type: String,
    default: ""
  },
  action: {
    require: true,
    type: String,
    default: "#"
  },
  showType: {
    require: true,
    type: String,
    default: "add"
  },
  limit: {
    require: false,
    type: Number,
    default: 1
  },
  showFileList: {
    require: false,
    type: Boolean,
    default: true
  }
});
const emit = defineEmits([
  "update:fileList",
  "update:uploading",
  "update:modelValue",
  "change"
]);

const files = toRef(props, "fileList");
const uploadRef = ref<UploadInstance>();

watch(files, newVal => {
  console.log("watch files", newVal);
  emit("update:fileList", newVal);
});

//上传图片
async function handleHttpRequest(options: UploadRequestOptions) {
  const param = { path: props.path, file: options.file };
  emit("update:uploading", true);
  uploadImg(param)
    .then(res => {
      console.log("handleHttpRequest options", options);
      console.log("handleHttpRequest res", res);
      const currentFile = files.value.find(
        item => item.uid == options.file.uid
      );
      currentFile.url = res["data"][0];
      let resultValue;
      if (props.limit == 1) {
        resultValue = res["data"][0];
      } else {
        resultValue = files.value.map(item => item.url);
      }
      emit("update:modelValue", resultValue);
      emit("change", { name: props.fieldName, value: resultValue });
    })
    .finally(() => {
      emit("update:uploading", false);
    });
}

function handleRemove(uploadFile: UploadFile, uploadFiles: UploadFiles) {
  console.log("handleRemove uploadFile", uploadFile);
  console.log("handleRemove uploadFiles", uploadFiles);
  emit(
    "update:modelValue",
    uploadFiles.map(item => item.url)
  );
}

const handleExceed: UploadProps["onExceed"] = (
  files: File[],
  uploadFiles: UploadUserFile[]
) => {
  console.log("handleExceed files", files);
  console.log("handleExceed uploadFiles", uploadFiles);
  if (props.limit == 1) {
    uploadRef.value!.clearFiles();
    const file = files[0] as UploadRawFile;
    file.uid = genFileId();
    uploadRef.value!.handleStart(file);
    uploadRef.value!.submit();
  }
};

const handleError = (
  error: Error,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  console.log("handleError error", error);
  console.log("handleError uploadFile", uploadFile);
  console.log("handleError uploadFiles", uploadFiles);
  emit(
    "update:modelValue",
    uploadFiles.map(item => item.url)
  );
  // uploadRef.value!.clearFiles();
};

const handleSuccess = async (
  response: any,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  console.log("handleSuccess response", response);
  console.log("handleSuccess uploadFile", uploadFile);
  console.log("handleSuccess uploadFiles", uploadFiles);
  if (props.limit == 1) {
    uploadRef.value!.clearFiles();
  }
};
</script>

<template>
  <el-upload
    ref="uploadRef"
    v-model:file-list="files"
    :drag="drag"
    :limit="limit"
    :accept="accept"
    :action="action"
    :disabled="disabled"
    :multiple="multiple"
    :auto-upload="autoUpload"
    :show-file-list="showFileList"
    :http-request="handleHttpRequest"
    :on-remove="handleRemove"
    :on-exceed="handleExceed"
    :on-error="handleError"
    :on-success="handleSuccess"
  >
    <el-button
      v-if="showType != 'read'"
      type="primary"
      :loading="uploading"
      text
    >
      选择文件
    </el-button>
    <DownloadButton
      v-else-if="files.length > 0"
      :showFileName="true"
      :srcList="files.map(item => item.url)"
    />
    <span v-else> 未上传 </span>
    <template v-if="false" #tip>
      <div class="el-upload__tip text-red">
        仅支持小于5M的word、PDF、excel、jpg文件
      </div>
    </template>
  </el-upload>
</template>
