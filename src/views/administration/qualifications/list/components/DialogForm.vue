<script setup lang="ts">
import {
  ElMessage,
  type UploadProps,
  type FormInstance,
  ElLoading,
  UploadUserFile
} from "element-plus";
// import moment from "moment";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";

import {
  Create,
  GetCompanyQualiTypes,
  GetInfo,
  Update
} from "@/api/qualification";
import { uploadImg } from "@/api/common";
import { userDepartmentStoreHook } from "@/store/modules/department";

const { getRootDeptList } = userDepartmentStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  certType: 1,
  companyName: "",
  companyDeptId: "",
  certName: "",
  certNo: "",
  startTime: "",
  endTime: "",
  issuingUnit: "",
  certImages: [],
  qualiTypeName: "",
  isExpired: "",
  annualTime: ""
};

// 表单校验规则
const rules = {
  companyDeptId: [{ required: true, message: "请选择公司", trigger: "change" }],
  certName: [{ required: true, message: "请输入证书名称", trigger: "blur" }],
  // startTime: [{ required: true, message: "请选择颁发日期", trigger: "change" }],
  // endTime: [{ required: true, message: "请选择失效日期", trigger: "change" }],
  certImages: [
    { required: true, message: "请选择证书图片", trigger: "change" }
  ],
  qualiTypeName: [
    { required: true, message: "请选择证书类别", trigger: "change" }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formLoading = ref(false);
const fileList = ref<UploadUserFile[]>([]);
const formVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const type = ref("add");
// const isShow = ref(true);
const certTypes = ref([]);
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());

//el-cascader props属性值
// const selProps = {
//   children: "children",
//   label: "fullName",
//   multiple: true,
//   emitPath: false,
//   value: "id",
//   checkStrictly: true
// };
// const typeSelProps = {
//   children: "children",
//   label: "name",
//   multiple: true,
//   emitPath: false,
//   value: "value",
//   checkStrictly: true
// };

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加企业资质"
    : type.value == "edit"
      ? "编辑企业资质"
      : type.value == "read"
        ? "查看企业资质"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  certname();
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
  } else {
    fileList.value = [];
    type.value = "add";

    // formData.value.startTime = moment().format("YYYY/MM/DD");
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
  const { data } = await GetInfo({ id });
  formData.value = data || {};
  const certImages = data.certImages || [];
  fileList.value = certImages.map(item => {
    return { name: item.substring(item.lastIndexOf("/") + 1), url: item };
  });
  formLoading.value = false;
}

//证书类型
async function certname() {
  const { data } = await GetCompanyQualiTypes();
  certTypes.value = data || [];
}

const handleRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles);
  if (fileList.value.length < 1) {
    formData.value.certImages = [];
    ruleFormRef.value.validateField("certImages", () => null);
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
    if (res["Success"]) {
      options.file.temp = res["data"][0];
      formData.value.certImages = res["data"][0];
      ruleFormRef.value.validateField("certImages", () => null);
    }
    loading.close();
  });
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  ruleFormRef.value.validateField("certImages", () => null);
  formEl.validate(async valid => {
    if (valid) {
      if (fileList.value) {
        formData.value.certImages = fileList.value.map(item => {
          if (item.raw) {
            const temp1 = item.raw as any;
            return temp1.temp;
          } else {
            return item.url;
          }
        });
      }
      let certImagesType = "";
      formData.value.certImages.filter(item => {
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
          const { code, message } = await Create(formData.value);
          if (code == 0) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        } else {
          const { code, message } = await Update(formData.value);
          if (code == 0) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
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
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="576"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="78px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="公司名称" prop="companyDeptId">
            <el-select
              v-model="formData.companyDeptId"
              :disabled="type == 'read'"
              clearable
              :placeholder="type == 'read' ? '' : '请选择'"
              ><el-option
                v-for="item in rootDepartment"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
            /></el-select>
            <!-- <el-cascader
              :disabled="type == 'read'"
              v-model="formData.companyDeptId"
              :options="unitData"
              :placeholder="type == 'read' ? '' : '请选择'"
              class="w-100/100"
              :props="selProps"
              collapse-tags
              collapse-tags-tooltip
              :show-all-levels="false"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader> -->
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <!-- <el-form-item label="证书类别" prop="qualiTypeId">
            <el-cascader
              :disabled="type == 'read'"
              v-model="formData.qualiTypeId"
              :options="certTypes"
              :placeholder="type == 'read' ? '' : '请选择'"
              class="w-100/100"
              :props="typeSelProps"
              collapse-tags
              collapse-tags-tooltip
              :show-all-levels="false"
            >
              <template #default="{ data }">
                <span>{{ data.name }}</span>
              </template>
            </el-cascader>
          </el-form-item> -->
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
          <el-form-item label="证书名称" prop="certName">
            <el-input
              v-model="formData.certName"
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
          <el-form-item label="颁发日期" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
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
          <el-form-item label="有效日期" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
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
          <el-form-item label="年检日期" prop="annualTime">
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
          <el-form-item label="证书图片" prop="certImages">
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
      <el-button
        v-if="type == 'add' || type == 'edit'"
        @click="formVisible = false"
        >取消</el-button
      >
      <el-button
        v-if="type == 'add' || type == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
      <el-button v-if="type == 'read'" @click="formVisible = false"
        >关闭</el-button
      >
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
