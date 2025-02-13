<script setup lang="ts">
import {
  ElMessage,
  genFileId,
  type UploadInstance,
  type UploadProps,
  type UploadRawFile,
  type FormInstance
} from "element-plus";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";

import { uploadImg } from "@/api/common";
import { userStaffStoreHook } from "@/store/modules/staff";
import { CreateLessee, UpdateLessee, GetLessee } from "@/api/builds";

const { getStaffListNV } = userStaffStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  name: "",
  idCard: "",
  mobile: "",
  idCardFront: "",
  idCardBack: ""
};
// 表单校验规则;
const rules = {
  staffId: [{ required: true, message: "请选择租赁人", trigger: "change" }],
  idCard: [{ required: true, message: "请输入身份证号", trigger: "blur" }],
  mobile: [{ required: true, message: "请输入手机号", trigger: "blur" }],
  idCardFront: [
    { required: true, message: "请上传身份证正面", trigger: "change" }
  ],
  idCardBack: [
    { required: true, message: "请上传身份证反面", trigger: "change" }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const fileList = ref([]);
const fileList2 = ref([]);
const type = ref("add");
const stauts = ref("");
const uploadRef = ref<UploadInstance>();
const uploadRef2 = ref<UploadInstance>();
const isShow = ref(true);
const { staffListNV } = storeToRefs(userStaffStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
  return type.value == "add"
    ? "添加租赁人"
    : type.value == "edit"
      ? "编辑租赁人"
      : type.value == "query"
        ? "查看租赁人"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  getStaffListNV();
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  fileList.value = [];
  fileList2.value = [];
  if (_formData) {
    type.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    type.value = "add";
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetLessee({ id });
  formData.value = data || {};
  if (data) {
    // timeRange.value = [data.startTime, data.endTime];
  }
  fileList.value = [{ name: "", url: data.idCardFront }];
  fileList2.value = [{ name: "", url: data.idCardBack }];
  formLoading.value = false;
}

// //文件删除
// function handleRemove() {
//   formData.value.certImages = "";
//   fileList.value = [];
// }
//上传图片
async function handleUpLoadImg(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value.idCardFront = res["data"][0];
    fileList.value = [{ name: options.file.name, url: res["data"][0] }];
    ruleFormRef.value.validateField("idCardFront", () => null);
  });
}
async function handleUpLoadImg2(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value.idCardBack = res["data"][0];
    fileList2.value = [{ name: options.file.name, url: res["data"][0] }];
    ruleFormRef.value.validateField("idCardBack", () => null);
  });
}
const handleExceed: UploadProps["onExceed"] = files => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  uploadRef.value!.submit();
};

const handleExceed2: UploadProps["onExceed"] = files => {
  uploadRef2.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef2.value!.handleStart(file);
  uploadRef2.value!.submit();
};

const handleError = () => {
  uploadRef.value.clearFiles();
};
const handleError2 = () => {
  uploadRef2.value.clearFiles();
};
const handleSuccess = async response => {
  console.log("response", response);
  uploadRef.value.clearFiles();
};
const handleSuccess2 = async response => {
  console.log("response", response);
  uploadRef2.value.clearFiles();
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  ruleFormRef.value.validateField("idCardFront", () => null);
  ruleFormRef.value.validateField("idCardBack", () => null);
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateLessee(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await CreateLessee(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      }
    }
  });
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  // timeRange.value = [];
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
  // reloadTimeRange();
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="610"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="95px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="租赁人" prop="staffId">
            <el-select
              v-model="formData.staffId"
              :placeholder="type == 'query' ? '' : '请选择'"
              :style="{ width: '100%' }"
              :disabled="type == 'query'"
            >
              <el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="身份证号" prop="idCard">
            <el-input
              v-model="formData.idCard"
              :placeholder="type == 'query' ? '' : '请输入'"
              :disabled="type == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="手机号" prop="mobile">
            <el-input
              v-model="formData.mobile"
              :placeholder="type == 'query' ? '' : '请输入'"
              :disabled="type == 'query'"
              type="number"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="身份证正面" prop="idCardFront">
            <el-upload
              ref="uploadRef"
              :disabled="type == 'query'"
              action="#"
              :auto-upload="true"
              :file-list="fileList"
              :http-request="handleUpLoadImg"
              :limit="1"
              list-type="picture"
              :on-exceed="handleExceed"
              :on-error="handleError"
              :on-success="handleSuccess"
            >
              <el-button
                v-if="isShow"
                :disabled="type == 'query'"
                type="primary"
                >请上传正面照片</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="身份证反面" prop="idCardBack">
            <el-upload
              ref="uploadRef2"
              :disabled="type == 'query'"
              action="#"
              :auto-upload="true"
              :file-list="fileList2"
              :http-request="handleUpLoadImg2"
              :limit="1"
              list-type="picture"
              :on-exceed="handleExceed2"
              :on-error="handleError2"
              :on-success="handleSuccess2"
            >
              <el-button
                v-if="isShow"
                :disabled="type == 'query'"
                type="primary"
                >请上传反面照片</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button v-if="type == 'query'" @click="formVisible = false"
        >关闭</el-button
      >
      <el-button
        v-if="type == 'edit' || type == 'add'"
        @click="formVisible = false"
        >取消</el-button
      >
      <el-button
        v-if="type == 'edit' || type == 'add'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
    </template>
  </el-dialog>
</template>
