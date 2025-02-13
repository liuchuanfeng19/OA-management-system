<script setup lang="ts">
import {
  ElMessage,
  // genFileId,
  // type UploadInstance,
  type UploadProps,
  // type UploadRawFile,
  type FormInstance,
  ElLoading,
  UploadUserFile
} from "element-plus";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";

import {
  CreateQualificationCertificate,
  UpdateQualificationCertificate,
  GetStaffQualiTypes,
  GetQualificationCertificate
} from "@/api/personnel";
import { uploadImg } from "@/api/common";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  staffName: "",
  jobName: "",
  jobLevel: "",
  certNo: "",
  certificateName: "",
  issuingUnit: "",
  startDate: "",
  endDate: "",
  annualTime: "",
  certificateImg: [],
  certTypeExpr: "",
  qualiTypeName: "身份证",
  isExpired: "",
  jobStatusExpr: "",
  majorName: "",
  majorLevel: ""
};

// 表单校验规则
const rules = {
  staffId: [{ required: true, message: "请选择人员", trigger: "change" }],
  certificateName: [
    { required: true, message: "请输入证书名称", trigger: "blur" }
  ],
  // startDate: [{ required: true, message: "请选择颁发日期", trigger: "change" }],
  // endDate: [{ required: true, message: "请选择失效日期", trigger: "change" }],
  certificateImg: [
    { required: true, message: "请选择证书图片", trigger: "change" }
  ],
  // certNo: [{ required: true, message: "请输入证书编号", trigger: "blur" }],
  qualiTypeName: [
    { required: true, message: "请选择证书类别", trigger: "change" }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formLoading = ref(false);
const formVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const type = ref("add");
// const isShow = ref(true);
const certTypes = ref([]);
const fileList = ref<UploadUserFile[]>([]);
// const uploadRef = ref<UploadInstance>();
const { staffListNV } = storeToRefs(userStaffStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加个人资质"
    : type.value == "edit"
      ? "编辑个人资质"
      : type.value == "read"
        ? "查看个人资质"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  jobname();
  getStaffListNV();
  formVisible.value = true;
  INITIAL_DATA.certificateImg = [];
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
  } else {
    type.value = "add";
  }
};
defineExpose({ show });

// //禁止鼠标右击事件
// function handlePaste(event) {
//   event.preventDefault();
//   return false;
// }

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetQualificationCertificate({ id });
  formData.value = data || {};
  const certificateImg = data.certificateImg || [];
  fileList.value = certificateImg.map(item => {
    return { name: item.substring(item.lastIndexOf("/") + 1), url: item };
  });
  formLoading.value = false;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  ruleFormRef.value.validateField("certificateImg", () => null);
  formEl.validate(async valid => {
    if (valid) {
      if (fileList.value) {
        formData.value.certificateImg = fileList.value.map(item => {
          if (item.raw) {
            const temp1 = item.raw as any;
            return temp1.temp;
          } else {
            return item.url;
          }
        });
      }
      let certImagesType = "";
      formData.value.certificateImg.filter(item => {
        const index = item.lastIndexOf(".");
        certImagesType = item.substring(index, item.length).toLowerCase();
      });
      if (
        certImagesType != ".jpg" &&
        certImagesType != ".jpeg" &&
        certImagesType != ".png"
      ) {
        ElMessage.error("只能上传图片！");
      } else {
        if (type.value == "add") {
          const { code, message } = await CreateQualificationCertificate(
            formData.value
          );
          if (code == 0) {
            ElMessage.success(message);
            emit("search");
            beforeClose();
          }
        } else {
          const { code, message } = await UpdateQualificationCertificate(
            formData.value
          );
          if (code == 0) {
            ElMessage.success(message);
            emit("search");
            beforeClose();
          }
        }
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  fileList.value = [];
  ruleFormRef.value.resetFields();
};

//关闭对话框
const beforeClose = () => {
  resetForm();
  formVisible.value = false;
};

//员工证书类型接口
async function jobname() {
  const { data } = await GetStaffQualiTypes();
  certTypes.value = data || [];
}

const handleRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles);
  if (fileList.value.length < 1) {
    formData.value.certificateImg = [];
    ruleFormRef.value.validateField("certificateImg", () => null);
  }
};

const handlePreview: UploadProps["onPreview"] = file => {
  console.log(file);
};

//上传文件
async function fileUpload(options) {
  const loading = ElLoading.service({
    lock: true,
    text: "Loading",
    background: "rgba(0, 0, 0, 0.7)"
  });
  const path = "/tyOA/Qualification";
  uploadImg({ file: options.file, path: path }).then(res => {
    console.log("res", res);
    if (res["Success"]) {
      options.file.temp = res["data"][0];
      formData.value.certificateImg = res["data"][0];
      ruleFormRef.value.validateField("certificateImg", () => null);
    }
    loading.close();
  });
}
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="640"
    draggable
    :before-close="beforeClose"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="90px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <!-- <el-form-item label="姓名" prop="staffName">
            <el-input v-model="formData.staffName" placeholder="请输入姓名" />
          </el-form-item> -->
          <el-form-item label="姓名" prop="staffId">
            <el-select
              v-model="formData.staffId"
              filterable
              :disabled="type == 'read'"
              :placeholder="type == 'read' ? '' : '请选择'"
              :style="{ width: '100%' }"
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
          <el-form-item label="证书类别" prop="qualiTypeName">
            <el-select
              v-model="formData.qualiTypeName"
              :disabled="type == 'read'"
              :placeholder="type == 'read' ? '' : '请选择'"
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in certTypes"
                :key="item.value"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="证书名称" prop="certificateName">
            <el-input
              v-model="formData.certificateName"
              :readonly="type == 'read'"
              :placeholder="type == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="证书编号" prop="certNo">
            <el-input
              v-model="formData.certNo"
              :readonly="type == 'read'"
              :placeholder="type == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="专业名称" prop="majorName">
            <el-input
              v-model="formData.majorName"
              :readonly="type == 'read'"
              :placeholder="type == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="等级" prop="majorLevel">
            <el-input
              v-model="formData.majorLevel"
              :readonly="type == 'read'"
              :placeholder="type == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="颁发日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              :disabled="type == 'read'"
              :placeholder="type == 'read' ? '' : '请选择'"
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
              :disabled="type == 'read'"
              :placeholder="type == 'read' ? '' : '请选择'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="复审有效期" prop="annualTime">
            <el-date-picker
              v-model="formData.annualTime"
              :disabled="type == 'read'"
              :placeholder="type == 'read' ? '' : '请选择'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="发证机构" prop="issuingUnit">
            <el-input
              v-model="formData.issuingUnit"
              :readonly="type == 'read'"
              :placeholder="type == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="证书图片" prop="certificateImg">
            <el-upload
              v-model:file-list="fileList"
              :http-request="fileUpload"
              class="uploader"
              action="#"
              accept=".png,.jpg,.jpeg"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
            >
              <el-button
                v-if="type == 'add' || type == 'edit'"
                type="primary"
                text
                >选择文件</el-button
              >
              <template v-if="type == 'add' || type == 'edit'" #tip>
                <div class="el-upload__tip text-red">
                  仅支持jpg、jpeg、png图片文件
                </div>
              </template>
            </el-upload>

            <!-- <div v-else class="img-view">
              <el-image
                v-for="item in fileList"
                :key="item.url"
                :src="item.url"
                class="imgs"
                @contextmenu.prevent="handlePaste($event)"
                @keydown="handlePaste($event)"
              />
            </div> -->
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button v-if="type == 'add' || type == 'edit'" @click="beforeClose"
        >取消</el-button
      >
      <el-button
        v-if="type == 'add' || type == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
      <el-button v-if="type == 'read'" @click="beforeClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.img-view {
  display: flex;
  flex-flow: row wrap;

  .imgs {
    width: 100px;
    height: 100px;
    margin-right: 10px;
    margin-bottom: 10px;
    border: 1px #f1f2f3 solid;
  }
}
</style>
