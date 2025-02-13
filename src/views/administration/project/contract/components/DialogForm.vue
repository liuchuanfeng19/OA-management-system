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

import {
  GetListNV,
  GetProjContractTypeNV,
  CreatePrimary,
  GetPrimary,
  UpdatePrimary,
  GetListPrimaryNV,
  CreateSecondary,
  UpdateSecondary
} from "@/api/project";
import { uploadImg } from "@/api/common";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  name: "",
  code: "",
  type: "",
  typeExpr: "",
  parentProjContractId: "",
  projId: "",
  projName: "",
  contractAmount: 0,
  contractQty: 0,
  contractTime: "",
  contractAttch: "",
  contractAttchTime: "",
  contractBusi: "",
  contractBusiAttch: "",
  contractTech: "",
  contractTechAttch: "",
  bidTime: "",
  bidStaffId: "",
  bidStaffName: "",
  bidQty: 0,
  bidAmount: "",
  bidNoticeAttach: "",
  bidKeepStaffId: "",
  bidKeepStaffName: "",
  invoiceAmount: 0,
  receiveAmount: 0,
  leftContractAmout: 0,
  projAmount: 0,
  htStartTime: "",
  htEndTime: ""
};
// 表单校验规则;
const rules = {
  // projId: [{ required: true, message: "请选择项目名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入合同编号", trigger: "blur" }],
  name: [{ required: true, message: "请输入合同名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择合同类型", trigger: "blur" }],
  contractAmount: [
    { required: true, message: "请输入合同金额", trigger: "blur" }
  ],
  projAmount: [{ required: true, message: "请输入工程造价", trigger: "blur" }],
  contractTime: [
    { required: true, message: "请选择合同签订日期", trigger: "blur" }
  ],
  htStartTime: [
    { required: true, message: "请选择合同开工日期", trigger: "blur" }
  ],
  htEndTime: [
    { required: true, message: "请选择合同竣工日期", trigger: "blur" }
  ],
  contractAttch: [
    { required: true, message: "请选择合同附件", trigger: "blur" }
  ],
  contractBusi: [
    { required: true, message: "请输入合同商务要约", trigger: "blur" }
  ],
  contractBusiAttch: [
    { required: true, message: "请选择合同商务要约附件", trigger: "blur" }
  ],
  contractTech: [
    { required: true, message: "请输入合同技术要约", trigger: "blur" }
  ],
  contractTechAttch: [
    { required: true, message: "请选择合同技术要约附件", trigger: "blur" }
  ],
  bidStaffId: [{ required: true, message: "请选择总监", trigger: "blur" }],
  bidAmount: [{ required: true, message: "请输入中标价", trigger: "blur" }],
  bidNoticeAttach: [
    { required: true, message: "请选择中标通知书扫描件", trigger: "blur" }
  ],
  bidKeepStaffId: [
    { required: true, message: "请选择原件保管人", trigger: "blur" }
  ]
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const isShow = ref(true);
const formVisible = ref(false);
const formLoading = ref(false);
const formData = ref({ ...INITIAL_DATA });
const ProData = ref([]); //项目列表
const fileList = ref([]); //contractAttch
const fileList1 = ref([]); //contractBusiAttch
const fileList2 = ref([]); //contractTechAttch
const fileList3 = ref([]); //bidNoticeAttach
const PrimaryList = ref([]); //主合同列表
const ContractType = ref([]); //项目预算月度
const type = ref("add");
const uploadRef = ref<UploadInstance>(); //contractAttch
const uploadRef1 = ref<UploadInstance>(); //contractBusiAttch
const uploadRef2 = ref<UploadInstance>(); //contractTechAttch
const uploadRef3 = ref<UploadInstance>(); //bidNoticeAttach
const { staffListNV } = storeToRefs(userStaffStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加合同"
    : type.value == "edit"
      ? "编辑合同"
      : type.value == "query"
        ? "查看合同"
        : type.value == "create"
          ? "添加补充合同"
          : type.value == "querySecond"
            ? "查看补充合同"
            : type.value == "editSecond"
              ? "编辑补充合同"
              : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  GetPrimaryList();
  GetContractType();
  GetProStatus();
  getStaffListNV();
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_type != "add" && _type !== "create" && _formData) {
    type.value = _type;
    await getDetail(_formData.id);
  } else if (_type == "add") {
    fileList.value = []; //contractAttch
    fileList1.value = []; //contractBusiAttch
    fileList2.value = []; //contractTechAttch
    fileList3.value = []; //bidNoticeAttach
    type.value = "add";
  } else if (_type == "create") {
    fileList1.value = []; //contractBusiAttch
    fileList2.value = []; //contractTechAttch
    type.value = "create";
  }
};
defineExpose({ show });

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetPrimary({ id });
  formData.value = data || {};
  formLoading.value = false;
  fileList.value = [{ name: "", url: data.contractAttch }]; //contractAttch
  fileList1.value = [{ name: "", url: data.contractBusiAttch }]; //contractBusiAttch
  fileList2.value = [{ name: "", url: data.contractTechAttch }]; //contractTechAttch
  fileList3.value = [{ name: "", url: data.bidNoticeAttach }]; //bidNoticeAttach
}

//获取项目列表
async function GetProStatus() {
  const { data } = await GetListNV();
  ProData.value = data || {};
}

//获取合同类型
async function GetContractType() {
  const { data } = await GetProjContractTypeNV();
  ContractType.value = data || {};
}

//获取主合同列表
async function GetPrimaryList() {
  const { data } = await GetListPrimaryNV();
  PrimaryList.value = data || {};
}

//上传合同附件
async function handleUpLoadImg(options) {
  const path = "/tyOA/Project";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value.contractAttch = res["data"][0];
    fileList.value = [{ name: options.file.name, url: res["data"][0] }];
    ruleFormRef.value.validateField("contractAttch", () => null);
  });
}

const handleExceed: UploadProps["onExceed"] = files => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  uploadRef.value!.submit();
};

const handleError = () => {
  uploadRef.value.clearFiles();
};

const handleSuccess = async response => {
  console.log("response", response);
  uploadRef.value.clearFiles();
};

//上传合同商务要约附件
async function handleUpLoadImg1(options) {
  const path = "/tyOA/Project";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value.contractBusiAttch = res["data"][0];
    fileList1.value = [{ name: options.file.name, url: res["data"][0] }];
    ruleFormRef.value.validateField("contractBusiAttch", () => null);
  });
}
const handleExceed1: UploadProps["onExceed"] = files => {
  uploadRef1.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef1.value!.handleStart(file);
  uploadRef1.value!.submit();
};
const handleError1 = () => {
  uploadRef1.value.clearFiles();
};
const handleSuccess1 = async response => {
  console.log("response", response);
  uploadRef1.value.clearFiles();
};

//合同技术要约附件
async function handleUpLoadImg2(options) {
  const path = "/tyOA/Project";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value.contractTechAttch = res["data"][0];
    fileList2.value = [{ name: options.file.name, url: res["data"][0] }];
    ruleFormRef.value.validateField("contractTechAttch", () => null);
  });
}
const handleExceed2: UploadProps["onExceed"] = files => {
  uploadRef2.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef2.value!.handleStart(file);
  uploadRef2.value!.submit();
};
const handleError2 = () => {
  uploadRef2.value.clearFiles();
};
const handleSuccess2 = async response => {
  console.log("response", response);
  uploadRef2.value.clearFiles();
};

//中标通知书扫描件
async function handleUpLoadImg3(options) {
  const path = "/tyOA/Project";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value.bidNoticeAttach = res["data"][0];
    fileList3.value = [{ name: options.file.name, url: res["data"][0] }];
    ruleFormRef.value.validateField("bidNoticeAttach", () => null);
  });
}
const handleExceed3: UploadProps["onExceed"] = files => {
  uploadRef3.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef3.value!.handleStart(file);
  uploadRef3.value!.submit();
};
const handleError3 = () => {
  uploadRef3.value.clearFiles();
};
const handleSuccess3 = async response => {
  console.log("response", response);
  uploadRef3.value.clearFiles();
};

// 主合同提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  ruleFormRef.value.validateField("bidNoticeAttach", () => null);
  ruleFormRef.value.validateField("contractTechAttch", () => null);
  ruleFormRef.value.validateField("contractBusiAttch", () => null);
  ruleFormRef.value.validateField("contractAttch", () => null);
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdatePrimary(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await CreatePrimary(formData.value);
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

//补充合同表单
const submitSecondForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateSecondary(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await CreateSecondary(formData.value);
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
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="700"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="140px"
    >
      <div>
        <el-row :gutter="20">
          <el-col
            v-if="
              type == 'create' || type == 'querySecond' || type == 'editSecond'
            "
            :span="12"
            :offset="0"
          >
            <el-form-item label="主合同" prop="parentProjContractId">
              <el-select
                v-model="formData.parentProjContractId"
                :disabled="type == 'querySecond'"
                style="width: 100%"
                :placeholder="type == 'querySecond' ? '' : '请选择'"
              >
                <el-option
                  v-for="item in PrimaryList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同名称" prop="name">
              <el-input
                v-model="formData.name"
                :placeholder="
                  type == 'query' || type == 'querySecond' ? '' : '请输入'
                "
                :disabled="type == 'query' || type == 'querySecond'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同编号" prop="code">
              <el-input
                v-model="formData.code"
                :placeholder="
                  type == 'query' || type == 'querySecond' ? '' : '请输入'
                "
                :disabled="type == 'query' || type == 'querySecond'"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="
              type == 'edit' ||
              type == 'query' ||
              type == 'querySecond' ||
              type == 'editSecond'
            "
            :span="12"
            :offset="0"
          >
            <el-form-item label="合同类型" prop="type">
              <el-select
                v-model="formData.type"
                disabled
                style="width: 100%"
                :placeholder="
                  type == 'query' || type == 'querySecond' ? '' : '请选择'
                "
              >
                <el-option
                  v-for="item in ContractType"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="项目名称" prop="projId">
              <el-select
                v-model="formData.projId"
                :disabled="type == 'query' || type == 'querySecond'"
                style="width: 100%"
                :placeholder="
                  type == 'query' || type == 'querySecond' ? '' : '请选择'
                "
              >
                <el-option
                  v-for="item in ProData"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="工程造价(万元)" prop="projAmount">
              <el-input
                disabled
                type="number"
                placeholder="请输入工程造价"
                v-model="formData.projAmount"
              />
            </el-form-item>
          </el-col> -->
          <el-col
            v-if="type == 'edit' || type == 'query' || type == 'add'"
            :span="12"
            :offset="0"
          >
            <el-form-item label="合同金额(万元)" prop="contractAmount">
              <el-input
                v-model="formData.contractAmount"
                type="number"
                :placeholder="type == 'query' ? '' : '请输入'"
                :disabled="type == 'query'"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="type == 'edit' || type == 'query' || type == 'add'"
            :span="12"
            :offset="0"
          >
            <el-form-item label="合同份数" prop="contractQty">
              <el-input
                v-model="formData.contractQty"
                :placeholder="type == 'query' ? '' : '请输入'"
                :disabled="type == 'query'"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="type == 'edit' || type == 'query' || type == 'add'"
            :span="12"
            :offset="0"
          >
            <el-form-item label="合同签订日期" prop="contractTime">
              <el-date-picker
                v-model="formData.contractTime"
                :disabled="type == 'query'"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="开工日期" prop="htStartTime">
              <el-date-picker
                v-model="formData.htStartTime"
                :disabled="
                  type == 'query' ||
                  type == 'querySecond' ||
                  type == 'editSecond'
                "
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="竣工日期" prop="htEndTime">
              <el-date-picker
                v-model="formData.htEndTime"
                :disabled="
                  type == 'query' ||
                  type == 'querySecond' ||
                  type == 'editSecond'
                "
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同商务要约" prop="contractBusi">
              <el-input
                v-model="formData.contractBusi"
                :placeholder="
                  type == 'query' || type == 'querySecond' ? '' : '请输入'
                "
                :disabled="type == 'query' || type == 'querySecond'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同技术要约" prop="contractTech">
              <el-input
                v-model="formData.contractTech"
                :placeholder="
                  type == 'query' || type == 'querySecond' ? '' : '请输入'
                "
                :disabled="type == 'query' || type == 'querySecond'"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="合同商务要约附件" prop="contractBusiAttch">
              <el-upload
                ref="uploadRef1"
                :disabled="type == 'query' || type == 'querySecond'"
                action="#"
                :auto-upload="true"
                :file-list="fileList1"
                :http-request="handleUpLoadImg1"
                :limit="1"
                list-type="picture"
                :on-exceed="handleExceed1"
                :on-error="handleError1"
                :on-success="handleSuccess1"
              >
                <el-button
                  v-if="isShow"
                  :disabled="type == 'query'"
                  type="primary"
                  >请上传附件</el-button
                >
              </el-upload>
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="合同技术要约附件" prop="contractTechAttch">
              <el-upload
                ref="uploadRef2"
                :disabled="type == 'query' || type == 'querySecond'"
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
                  >请上传附件</el-button
                >
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col
            v-if="type == 'edit' || type == 'query' || type == 'add'"
            :span="12"
            :offset="0"
          >
            <el-form-item label="合同附件" prop="contractAttch">
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
                  >请上传附件</el-button
                >
              </el-upload>
            </el-form-item>
          </el-col>

          <el-col
            v-if="type == 'edit' || type == 'query' || type == 'add'"
            :span="24"
            :offset="0"
          >
            <el-form-item label="中标通知书记录:" />
          </el-col>
          <el-col
            v-if="type == 'edit' || type == 'query' || type == 'add'"
            :span="12"
            :offset="0"
          >
            <el-form-item label="领取时间" prop="bidTime">
              <el-date-picker
                v-model="formData.bidTime"
                :disabled="type == 'query'"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="type == 'edit' || type == 'query' || type == 'add'"
            :span="12"
            :offset="0"
          >
            <el-form-item label="拟派总监" prop="bidStaffId">
              <el-select
                v-model="formData.bidStaffId"
                :disabled="type == 'query'"
                :placeholder="type == 'query' ? '' : '请选择'"
                style="width: 100%"
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

          <el-col
            v-if="type == 'edit' || type == 'query' || type == 'add'"
            :span="12"
            :offset="0"
          >
            <el-form-item label="中标份数" prop="bidQty">
              <el-input
                v-model="formData.bidQty"
                :placeholder="type == 'query' ? '' : '请输入'"
                :disabled="type == 'query'"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="type == 'edit' || type == 'query' || type == 'add'"
            :span="12"
            :offset="0"
          >
            <el-form-item label="中标价" prop="bidAmount">
              <el-input
                v-model="formData.bidAmount"
                :placeholder="type == 'query' ? '' : '请输入'"
                :disabled="type == 'query'"
              />
            </el-form-item>
          </el-col>

          <el-col
            v-if="type == 'edit' || type == 'query' || type == 'add'"
            :span="12"
            :offset="0"
          >
            <el-form-item label="原件保管人" prop="bidKeepStaffId">
              <el-select
                v-model="formData.bidKeepStaffId"
                :disabled="type == 'query'"
                :placeholder="type == 'query' ? '' : '请选择'"
                style="width: 100%"
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
          <el-col
            v-if="type == 'edit' || type == 'query' || type == 'add'"
            :span="12"
            :offset="0"
          >
            <el-form-item label="中标通知书" prop="bidNoticeAttach">
              <el-upload
                ref="uploadRef3"
                :disabled="type == 'query'"
                action="#"
                :auto-upload="true"
                :file-list="fileList3"
                :http-request="handleUpLoadImg3"
                :limit="1"
                list-type="picture"
                :on-exceed="handleExceed3"
                :on-error="handleError3"
                :on-success="handleSuccess3"
              >
                <el-button
                  v-if="isShow"
                  :disabled="type == 'query'"
                  type="primary"
                  >请上传扫描件</el-button
                >
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <template #footer>
      <el-button
        v-if="
          type == 'add' ||
          type == 'edit' ||
          type == 'create' ||
          type == 'editSecond'
        "
        @click="formVisible = false"
        >取消</el-button
      >
      <el-button
        v-if="type == 'add' || type == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
      <el-button
        v-if="type == 'create' || type == 'editSecond'"
        type="primary"
        @click="submitSecondForm(ruleFormRef)"
        >确定
      </el-button>

      <el-button
        v-if="type == 'query' || type == 'querySecond'"
        @click="formVisible = false"
        >关闭</el-button
      >
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
:deep(.el-upload-list .el-icon) {
  display: none !important;
}
</style>
