<script setup lang="ts">
import moment from "moment";
import { ref, watch, computed } from "vue";
import {
  ElMessage,
  UploadProps,
  FormInstance,
  UploadInstance,
  UploadUserFile
} from "element-plus";

import { uploadImg } from "@/api/common";
import {
  CreateEducationExperience,
  UpdateEducationExperience,
  getEducationLevelNV,
  getDegreeNV
} from "@/api/personnel";

// interface Education {
//   id: string;
//   staffId: string;
//   schoolName: string;
//   majorName: string;
//   educationLevel: string;
//   educationLevelName: string;
//   educationNature: string;
//   degree: string;
//   degreeName: string;
//   startDate: string;
//   endDate: string;
// }

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);
const validateEducationNature = (rule: any, value: any, callback: any) => {
  if (!value && parseInt(formData.value.educationLevel) > 30) {
    return callback(new Error("请选择学历性质"));
  } else {
    callback();
  }
};
// 表单校验规则
const rules = {
  schoolName: [{ required: true, message: "请输入学校名称", trigger: "blur" }],
  majorName: [{ required: true, message: "请输入专业名称", trigger: "blur" }],
  educationLevel: [{ required: true, message: "请输入学历", trigger: "blur" }],
  startDate: [{ required: true, message: "请输入开始日期", trigger: "blur" }],
  endDate: [{ required: true, message: "请输入结束日期", trigger: "blur" }],
  educationNature: [
    {
      message: "请选择学历性质",
      validator: validateEducationNature
    }
  ],
  img: [{ required: true, message: "请选择证书图片", trigger: "change" }]
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
const degreeList = ref([]);
const formVisible = ref(false);
const formLoading = ref(false);
const formData = ref(props.data);
const educationLevelList = ref([]);
const ruleFormRef = ref<FormInstance>();
const uploadRef1 = ref<UploadInstance>();
const fileList1 = ref<UploadUserFile[]>([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return props.data.type == "add"
    ? "添加教育经历"
    : props.data.type == "edit"
      ? "编辑教育经历"
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
    formData.value = val;
    if (formData.value.type == "add") {
      fileList1.value = [];
    } else {
      if (formData.value.img && formData.value.img.length > 0) {
        fileList1.value = formData.value.img.map(item => {
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

// 获取学历列表
async function getEducationLevelList() {
  //获取后台该数据全部信息接口
  const { data } = await getEducationLevelNV();
  educationLevelList.value = data || [];
}

// 获取学历列表
async function getDegreeList() {
  //获取后台该数据全部信息接口
  const { data } = await getDegreeNV({});
  degreeList.value = data || [];
}

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
        const { code, message } = await CreateEducationExperience(data);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (props.data.type == "edit") {
        const { code, message } = await UpdateEducationExperience(data);
        if (code == 0) {
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
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
};

//日期缺省
formData.value.startDate = new Date(+new Date() + 8 * 3600 * 1000)
  .toISOString()
  .replace(/T/g, " ")
  .replace(/\.[\d]{3}Z/, "");
formData.value.endDate = new Date(+new Date() + 8 * 3600 * 1000)
  .toISOString()
  .replace(/T/g, " ")
  .replace(/\.[\d]{3}Z/, "");

getEducationLevelList();
getDegreeList();
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="580"
    draggable
    :before-close="closeDialog"
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
          <el-form-item label="学校名称" prop="schoolName">
            <el-input v-model="formData.schoolName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="专业名称" prop="majorName">
            <el-input v-model="formData.majorName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="学历" prop="educationLevel">
            <el-select
              v-model="formData.educationLevel"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in educationLevelList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="学历性质" prop="educationNature">
            <el-select
              v-model="formData.educationNature"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option label="请选择" value="" />
              <el-option label="全日制" value="全日制" />
              <el-option label="非全日制" value="非全日制" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="学位" prop="degree">
            <el-select
              v-model="formData.degree"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in degreeList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="证书图片" prop="img">
            <el-upload
              ref="uploadRef1"
              v-model:file-list="fileList1"
              accept=".png,.jpg"
              action="img"
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
