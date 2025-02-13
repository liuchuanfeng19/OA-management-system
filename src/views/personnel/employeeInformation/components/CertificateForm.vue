<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import {
  CreateQualificationCertificate,
  UpdateQualificationCertificate,
  GetStaffQualiTypes
} from "@/api/personnel";
import {
  ElMessage,
  UploadProps,
  FormInstance,
  UploadInstance,
  UploadUserFile
} from "element-plus";

import { uploadImg } from "@/api/common";
import moment from "moment";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);
// 表单校验规则
const rules = {
  certificateName: [
    { required: true, message: "请输入证书名称", trigger: "blur" }
  ],
  startDate: [{ required: true, message: "请选择颁发日期", trigger: "change" }],
  certificateImg: [
    { required: true, message: "请选择资质图片", trigger: "change" }
  ]
};

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
const certTypes = ref([]);
const formVisible = ref(false);
const formLoading = ref(false);
const formData = ref({ ...props.data });
const ruleFormRef = ref<FormInstance>();
const uploadRef1 = ref<UploadInstance>();
const fileList1 = ref<UploadUserFile[]>([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return props.data.type == "add"
    ? "添加资质证书"
    : props.data.type == "edit"
      ? "编辑资质证书"
      : "";
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
  }
);
watch(
  () => props.data,
  val => {
    formData.value = { ...val };
    if (formData.value.type == "add") {
      fileList1.value = [];
    } else {
      if (
        formData.value.certificateImg &&
        formData.value.certificateImg.length > 0
      ) {
        fileList1.value = formData.value.certificateImg.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        });
      }
    }
    if (!formData.value.startDate && !formData.value.endDate) {
      formData.value.startDate = moment().format("YYYY/MM/DD");
      formData.value.endDate = moment().format("YYYY/MM/DD");
    }
  }
);

//员工资质选项接口
async function jobname() {
  const { data } = await GetStaffQualiTypes();
  certTypes.value = data || [];
}

//上传文件
// const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
//   if (rawFile.size / 1024 / 1024 > 5) {
//     ElMessage.error("所选文件不能超过5Mb");
//     return false;
//   }
//   return true;
// };

const handleError1 = () => {
  uploadRef1.value.clearFiles();
};

//上传文件
async function fileUpload1(options) {
  const path = "/tyOA/attendance";
  uploadImg({ file: options.file, path: path }).then(res => {
    options.file.temp = res["data"][0];
    formData.value[options.action] = fileList1.value.map((item: any) =>
      item.url ? item.url : item.raw.temp
    );
    ruleFormRef.value.validateField(options.action, () => null);
    console.log("fileList", fileList1.value);
    console.log(
      `${formData.value[options.action]}`,
      formData.value[options.action]
    );
  });
}

function handleRemove1(action: string) {
  formData.value[action] = fileList1.value.map((item: any) =>
    item.url ? item.url : item.raw.temp
  );
  ruleFormRef.value.validateField(action, () => null);
}

const handleSuccess1 = async _response => {};

const handleExceed1: UploadProps["onExceed"] = _files => {};

const submitForm = (formEl: FormInstance | undefined) => {
  const data = Object.assign({}, formData.value);
  delete data.type;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (props.data.type == "add") {
        const { code, message } = await CreateQualificationCertificate(data);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          emit("search");
          closeDialog();
        }
      } else if (props.data.type == "edit") {
        const { code, message } = await UpdateQualificationCertificate(data);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;

          emit("search");
          closeDialog();
        }
      }
    }
  });
};

// 重置表单

const resetForm = () => {
  ruleFormRef.value.resetFields();
  fileList1.value = [];
};

//关闭对话框
const closeDialog = () => {
  resetForm();
  formVisible.value = false;
};

// mounted周期函数
onMounted(async () => {
  jobname();
});
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="650"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="证书名称" prop="certificateName">
            <el-input v-model="formData.certificateName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="证书编号" prop="certNo">
            <el-input v-model="formData.certNo" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="证书类型" prop="qualiTypeId">
            <el-select
              v-model="formData.qualiTypeId"
              placeholder="请选择"
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in certTypes"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="版发单位" prop="issuingUnit">
            <el-input v-model="formData.issuingUnit" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="颁发日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="有效日期" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="证书图片" prop="certificateImg">
            <el-upload
              ref="uploadRef1"
              v-model:file-list="fileList1"
              accept=".png,.jpg"
              action="certificateImg"
              :auto-upload="true"
              :show-file-list="
                props.data.type == 'add' || props.data.type == 'edit'
              "
              :http-request="fileUpload1"
              :on-exceed="handleExceed1"
              :on-error="handleError1"
              :on-remove="
                () => {
                  handleRemove1('img');
                }
              "
              :on-success="handleSuccess1"
            >
              <el-button
                v-if="props.data.type == 'add' || props.data.type == 'edit'"
                type="primary"
                text
              >
                选择图片
              </el-button>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
