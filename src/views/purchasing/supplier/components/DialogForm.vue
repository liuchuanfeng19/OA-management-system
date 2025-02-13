<script setup lang="ts">
import {
  ElMessage,
  UploadProps,
  FormInstance,
  UploadInstance,
  UploadUserFile
} from "element-plus";
import { ref, computed } from "vue";

import { uploadImg } from "@/api/common";
import { getConfigListByKey } from "@/api/config";
import { CreateSupplyApply, Get } from "@/api/purchasing";
import { DownloadButton } from "@/components/DownloadButton";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  // staffId: "",
  catId: [],
  catIds: "",
  catName: "",
  name: "",
  contact: "",
  phone: "",
  contact2: "",
  phone2: "",
  addDate: "",
  inCompany: "",
  inBank: "",
  inBankAccount: "",
  busiLicense: [], //供应商营业执照
  authLicense: [], //管理认证体系
  taxLicense: [], //一般纳税人证明
  creditLicense: [], //国家企业信用信息公示系统相关公示信息
  comment: "",
  applyType: 2,
  supplyId: "",
  level: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const formLoading = ref(false);
const allSpplierTypes = ref([]); //供应商类型
const type = ref("add");
const stauts = ref("");
const uploadRef1 = ref<UploadInstance>();
const uploadRef2 = ref<UploadInstance>();
const uploadRef3 = ref<UploadInstance>();
const uploadRef4 = ref<UploadInstance>();
const fileList1 = ref<UploadUserFile[]>([]); //营业执照
const fileList2 = ref<UploadUserFile[]>([]); //管理认证体系
const fileList3 = ref<UploadUserFile[]>([]); //一般纳税人证明
const fileList4 = ref<UploadUserFile[]>([]); //国家企业信用信息公示系统相关公示信息

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    type.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    type.value = "add";
  }
};
defineExpose({ show });

// 表单校验规则;
const rules = {};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
  return type.value == "add"
    ? "添加供应商"
    : type.value == "edit"
      ? "编辑供应商"
      : type.value == "query"
        ? "查看供应商"
        : "";
});

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  formData.value.supplyId = formData.value.id;
  formData.value.applyType = 2;
  formEl.validate(async valid => {
    if (valid) {
      const { message, data } = await CreateSupplyApply(formData.value);
      if (data) {
        ElMessage.success(message);
        emit("search");
        beforeClose();
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  ruleFormRef.value.resetFields();
  fileList1.value = [];
  fileList2.value = [];
  fileList3.value = [];
  fileList4.value = [];
};

//关闭对话框
const beforeClose = () => {
  resetForm();
  formVisible.value = false;
};

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await Get({ id });
  formData.value = data || {};
  if (formData.value.busiLicense && formData.value.busiLicense.length > 0) {
    fileList1.value = formData.value.busiLicense.map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
      };
    });
  }
  if (formData.value.authLicense && formData.value.authLicense.length > 0) {
    fileList2.value = formData.value.authLicense.map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
      };
    });
  }
  if (formData.value.taxLicense && formData.value.taxLicense.length > 0) {
    fileList3.value = formData.value.taxLicense.map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
      };
    });
  }
  if (formData.value.creditLicense && formData.value.creditLicense.length > 0) {
    fileList4.value = formData.value.creditLicense.map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
      };
    });
  }

  formLoading.value = false;
}

//获取所有供应商类型
async function getspplierTypes() {
  const { data } = await getConfigListByKey({
    catalogKey: "OASupplyCategory"
  });
  allSpplierTypes.value = data;
}

//营业执照----------------
const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
  if (rawFile.size / 1024 / 1024 > 5) {
    ElMessage.error("所选文件不能超过5Mb");
    return false;
  }
  return true;
};

const handleError1 = () => {
  uploadRef1.value.clearFiles();
};

//上传文件
async function fileUpload1(options) {
  const path = "/tyOA/attendance";
  uploadImg({ file: options.file, path: path }).then(res => {
    options.file.temp = res["data"][0];
    formData.value[options.action] = fileList1.value.map(
      (item: any) => item.raw.temp
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

//管理认证体系----------------
const handleError2 = () => {
  uploadRef2.value.clearFiles();
};

//上传文件
async function fileUpload2(options) {
  const path = "/tyOA/attendance";
  uploadImg({ file: options.file, path: path }).then(res => {
    options.file.temp = res["data"][0];
    formData.value[options.action] = fileList2.value.map(
      (item: any) => item.raw.temp
    );
    ruleFormRef.value.validateField(options.action, () => null);
    console.log("fileList", fileList2.value);
    console.log(
      `${formData.value[options.action]}`,
      formData.value[options.action]
    );
  });
}

function handleRemove2(action: string) {
  formData.value[action] = fileList2.value.map((item: any) =>
    item.url ? item.url : item.raw.temp
  );
  ruleFormRef.value.validateField(action, () => null);
}

const handleSuccess2 = async _response => {};

const handleExceed2: UploadProps["onExceed"] = _files => {};

//一般纳税人证明-----------------
const handleError3 = () => {
  uploadRef3.value.clearFiles();
};

//上传文件
async function fileUpload3(options) {
  const path = "/tyOA/attendance";
  uploadImg({ file: options.file, path: path }).then(res => {
    options.file.temp = res["data"][0];
    formData.value[options.action] = fileList3.value.map(
      (item: any) => item.raw.temp
    );
    ruleFormRef.value.validateField(options.action, () => null);
    console.log("fileList", fileList3.value);
    console.log(
      `${formData.value[options.action]}`,
      formData.value[options.action]
    );
  });
}

function handleRemove3(action: string) {
  formData.value[action] = fileList3.value.map((item: any) =>
    item.url ? item.url : item.raw.temp
  );
  ruleFormRef.value.validateField(action, () => null);
}

const handleSuccess3 = async _response => {};

const handleExceed3: UploadProps["onExceed"] = _files => {};

//国家企业信用信息公示系统相关公示信息-------------------------
const handleError4 = () => {
  uploadRef4.value.clearFiles();
};

//上传文件
async function fileUpload4(options) {
  const path = "/tyOA/attendance";
  uploadImg({ file: options.file, path: path }).then(res => {
    options.file.temp = res["data"][0];
    formData.value[options.action] = fileList4.value.map(
      (item: any) => item.raw.temp
    );
    ruleFormRef.value.validateField(options.action, () => null);
    console.log("fileList", fileList4.value);
    console.log(
      `${formData.value[options.action]}`,
      formData.value[options.action]
    );
  });
}

function handleRemove4(action: string) {
  formData.value[action] = fileList3.value.map((item: any) =>
    item.url ? item.url : item.raw.temp
  );
  ruleFormRef.value.validateField(action, () => null);
}

const handleSuccess4 = async _response => {};

const handleExceed4: UploadProps["onExceed"] = _files => {};

//获取所有供应商类型
getspplierTypes();
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="620"
    draggable
    @close="beforeClose"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <div>
        <el-row :gutter="20">
          <el-col :span="12" :offset="0">
            <el-form-item label="供应商类别" prop="catName">
              <el-input
                v-model="formData.catName"
                :readonly="type == 'query'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="供应商名称" prop="name">
              <el-input v-model="formData.name" :readonly="type == 'query'" />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="供应商级别" prop="level">
              <el-input v-model="formData.level" :readonly="type == 'query'" />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="供应销售员" prop="contact">
              <el-input
                v-model="formData.contact"
                :readonly="type == 'query'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="销售员电话" prop="phone">
              <el-input
                v-model.trim="formData.phone"
                type="number"
                :readonly="type == 'query'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="销售员领导" prop="contact2">
              <el-input
                v-model="formData.contact2"
                :readonly="type == 'query'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="领导电话" prop="phone2">
              <el-input
                v-model.trim="formData.phone2"
                type="number"
                :readonly="type == 'query'"
              />
            </el-form-item>
          </el-col>

          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="收款单位" prop="inCompany">
              <el-input
                v-model.trim="formData.inCompany"
                :readonly="type == 'query'"

              />
            </el-form-item>
          </el-col> -->
          <el-col :span="12" :offset="0">
            <el-form-item label="收款开户行" prop="inBank">
              <el-input v-model="formData.inBank" :readonly="type == 'query'" />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="开户行账号" prop="inBankAccount">
              <el-input
                v-model.trim="formData.inBankAccount"
                :readonly="type == 'query'"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24" :offset="0">
            <el-form-item label="备注" prop="comment">
              <el-input
                v-model="formData.comment"
                type="textarea"
                :readonly="type == 'query'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-form-item label="管理体系认证" prop="authLicense">
              <el-upload
                ref="uploadRef2"
                v-model:file-list="fileList2"
                :disabled="type == 'query'"
                accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg"
                action="authLicense"
                :auto-upload="true"
                :show-file-list="type == 'add'"
                :before-upload="handleBeforeUpload"
                :http-request="fileUpload2"
                :on-exceed="handleExceed2"
                :on-error="handleError2"
                :on-remove="
                  () => {
                    handleRemove2('authLicense');
                  }
                "
                :on-success="handleSuccess2"
              >
                <DownloadButton
                  v-if="fileList2.length > 0 && type == 'query'"
                  :showFileName="true"
                  :srcList="fileList2.map(item => item.url)"
                />
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-form-item label="营业执照" prop="busiLicense">
              <el-upload
                ref="uploadRef1"
                v-model:file-list="fileList1"
                :disabled="type == 'query'"
                accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg"
                action="busiLicense"
                :show-file-list="type == 'add'"
                :auto-upload="true"
                :before-upload="handleBeforeUpload"
                :http-request="fileUpload1"
                :on-exceed="handleExceed1"
                :on-error="handleError1"
                :on-remove="
                  () => {
                    handleRemove1('busiLicense');
                  }
                "
                :on-success="handleSuccess1"
              >
                <DownloadButton
                  v-if="fileList1.length > 0 && type == 'query'"
                  :showFileName="true"
                  :srcList="fileList1.map(item => item.url)"
                />
              </el-upload>
            </el-form-item>
          </el-col>

          <el-col :span="24" :offset="0">
            <el-form-item label="纳税人证明" prop="taxLicense">
              <el-upload
                ref="uploadRef3"
                v-model:file-list="fileList3"
                :disabled="type == 'query'"
                accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg"
                action="taxLicense"
                :auto-upload="true"
                :show-file-list="type == 'add'"
                :before-upload="handleBeforeUpload"
                :http-request="fileUpload3"
                :on-exceed="handleExceed3"
                :on-error="handleError3"
                :on-remove="
                  () => {
                    handleRemove3('taxLicense');
                  }
                "
                :on-success="handleSuccess3"
              >
                <DownloadButton
                  v-if="fileList3.length > 0 && type == 'query'"
                  :showFileName="true"
                  :srcList="fileList3.map(item => item.url)"
                />
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-form-item label="企业信用公示" prop="creditLicense">
              <el-upload
                ref="uploadRef4"
                v-model:file-list="fileList4"
                :disabled="type == 'query'"
                accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg"
                action="creditLicense"
                :show-file-list="type == 'add'"
                :auto-upload="true"
                :before-upload="handleBeforeUpload"
                :http-request="fileUpload4"
                :on-exceed="handleExceed4"
                :on-error="handleError4"
                :on-remove="
                  () => {
                    handleRemove4('creditLicense');
                  }
                "
                :on-success="handleSuccess4"
              >
                <DownloadButton
                  v-if="fileList4.length > 0 && type == 'query'"
                  :showFileName="true"
                  :srcList="fileList4.map(item => item.url)"
                />
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <template #footer>
      <el-button v-if="type == 'edit' || type == 'add'" @click="beforeClose"
        >取消</el-button
      >
      <el-button
        v-if="type == 'edit' || type == 'add'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
      <el-button v-if="type == 'query'" @click="beforeClose">关闭</el-button>
    </template>
  </el-dialog>
</template>
