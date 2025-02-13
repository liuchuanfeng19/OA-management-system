<script setup lang="ts">
import _ from "lodash";
import {
  ElMessage,
  UploadFile,
  UploadFiles,
  FormInstance,
  UploadUserFile,
  UploadInstance
} from "element-plus";
import { ref, computed, watch, type PropType } from "vue";

import {
  getBuyAttach,
  createBuyAttach,
  updateBuyAttach
} from "@/api/buyAttach";
import { Project } from "../data";
import { uploadImg } from "@/api/common";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  joinSignId: "", //会签合同ID
  sellContractCode: "", //买方合同编号(只读)
  customer: "", //甲方单位(只读)
  supplyName: "", //乙方单位/供应商(只读)
  attachContract: [], //附件合同
  attachInvoice: [], //附件发票
  attachPay: [], //附件付款单
  attachRecvSign: [], //附件到货签收单
  attachCheck: [], //附件验收单
  attachOther: [] //附件其他
};

// 表单校验规则
const fromRules = {
  joinSignId: [{ required: true, message: "会签采购合同不能为空" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

const props = defineProps({
  projectList: {
    type: Array as PropType<Array<Project>>,
    default: () => []
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const formData = ref({ ...INITIAL_DATA });
const fileList1 = ref<UploadUserFile[]>([]); //附件合同
const fileList2 = ref<UploadUserFile[]>([]); //附件发票
const fileList3 = ref<UploadUserFile[]>([]); //附件付款单
const fileList4 = ref<UploadUserFile[]>([]); //附件到货签收单
const fileList5 = ref<UploadUserFile[]>([]); //附件验收单
const fileList6 = ref<UploadUserFile[]>([]); //附件其他

const showType = ref("add");
const dialogVisible = ref(false);
const uploadRef1 = ref<UploadInstance>();
const uploadRef2 = ref<UploadInstance>();
const uploadRef3 = ref<UploadInstance>();
const uploadRef4 = ref<UploadInstance>();
const uploadRef5 = ref<UploadInstance>();
const uploadRef6 = ref<UploadInstance>();
const ruleFormRef = ref<FormInstance>();

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加采购附件"
    : showType.value == "edit"
      ? "编辑采购附件"
      : showType.value == "read"
        ? "查看采购附件"
        : "";
});
watch(
  () => formData.value.joinSignId,
  newVal => {
    if (!newVal) {
      formData.value.sellContractCode = "";
      formData.value.customer = "";
      formData.value.supplyName = "";
      return;
    }
    const projet = props.projectList.find(item => item.joinSignId == newVal);
    formData.value.sellContractCode = projet.sellContractCode;
    formData.value.customer = projet.customer;
    formData.value.supplyName = projet.supplyName;
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.attachContract = [];
  INITIAL_DATA.attachInvoice = [];
  INITIAL_DATA.attachPay = [];
  INITIAL_DATA.attachRecvSign = [];
  INITIAL_DATA.attachCheck = [];
  INITIAL_DATA.attachOther = [];
  if (_formData) {
    getDetail(_formData.id);
  }
};
defineExpose({ show });

// 根据Id获取销售列表详情
const getDetail = async id => {
  const { data = {} } = await getBuyAttach({
    id
  });
  formData.value = data || {};
  fileList1.value =
    formData.value.attachContract != null &&
    formData.value.attachContract.length > 0
      ? formData.value.attachContract.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList2.value =
    formData.value.attachInvoice != null &&
    formData.value.attachInvoice.length > 0
      ? formData.value.attachInvoice.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList3.value =
    formData.value.attachPay != null && formData.value.attachPay.length > 0
      ? formData.value.attachPay.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList4.value =
    formData.value.attachRecvSign != null &&
    formData.value.attachRecvSign.length > 0
      ? formData.value.attachRecvSign.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList5.value =
    formData.value.attachCheck != null && formData.value.attachCheck.length > 0
      ? formData.value.attachCheck.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList6.value =
    formData.value.attachOther != null && formData.value.attachOther.length > 0
      ? formData.value.attachOther.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
};

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "add") {
        const { code, message } = await createBuyAttach(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (showType.value == "edit") {
        const { code, message } = await updateBuyAttach(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      }
    }
  });
}, 300);

//附件合同----------------
async function fileUpload1(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList1.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError1 = () => {
  uploadRef1.value.clearFiles();
};

const handleSuccess1 = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove1(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}

//附件发票----------------
async function fileUpload2(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList2.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError2 = () => {
  uploadRef2.value.clearFiles();
};

const handleSuccess2 = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove2(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}

//附件付款单----------------
async function fileUpload3(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList3.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError3 = () => {
  uploadRef3.value.clearFiles();
};

const handleSuccess3 = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove3(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}
//附件到货签收单----------------
async function fileUpload4(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList4.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError4 = () => {
  uploadRef3.value.clearFiles();
};

const handleSuccess4 = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove4(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}

//附件验收单----------------
async function fileUpload5(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList5.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError5 = () => {
  uploadRef3.value.clearFiles();
};

const handleSuccess5 = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove5(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}

//附件其他----------------
async function fileUpload6(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList6.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError6 = () => {
  uploadRef3.value.clearFiles();
};

const handleSuccess6 = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove6(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  fileList1.value = [];
  fileList2.value = [];
  fileList3.value = [];
  fileList4.value = [];
  fileList5.value = [];
  fileList6.value = [];
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
    :width="780"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="会签采购合同" prop="joinSignId">
            <el-select
              v-model="formData.joinSignId"
              :disabled="showType != 'add'"
              :placeholder="showType != 'add' ? '' : '请选择'"
              clearable
              filterable
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in props.projectList"
                :key="item.joinSignId"
                :label="item.sellContractCode"
                :value="item.joinSignId"
                :disabled="item.isBind"
                :title="item.isBind ? '该合同已添加采购附件' : ''"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="甲方单位" prop="customer">
            <el-input v-model="formData.customer" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="乙方单位" prop="supplyName">
            <el-input v-model="formData.supplyName" readonly />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="合同附件" prop="attachContract">
            <el-upload
              ref="uploadRef1"
              :disabled="showType == 'read'"
              accept="*"
              action="attachContract"
              :auto-upload="true"
              :file-list="fileList1"
              :http-request="fileUpload1"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove1(uploadFile, uploadFiles, 'attachContract');
                }
              "
              :on-error="handleError1"
              :on-success="handleSuccess1"
            >
              <el-button type="primary" text :loading="attachContractUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="发票" prop="attachInvoice">
            <el-upload
              ref="uploadRef2"
              :disabled="showType == 'read'"
              accept="*"
              action="attachInvoice"
              :auto-upload="true"
              :file-list="fileList2"
              :http-request="fileUpload2"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove2(uploadFile, uploadFiles, 'attachInvoice');
                }
              "
              :on-error="handleError2"
              :on-success="handleSuccess2"
            >
              <el-button type="primary" text :loading="attachContractUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="付款单" prop="attachPay">
            <el-upload
              ref="uploadRef3"
              :disabled="showType == 'read'"
              accept="*"
              action="attachPay"
              :auto-upload="true"
              :file-list="fileList3"
              :http-request="fileUpload3"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove3(uploadFile, uploadFiles, 'attachPay');
                }
              "
              :on-error="handleError3"
              :on-success="handleSuccess3"
            >
              <el-button type="primary" text :loading="attachContractUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="到货签收单" prop="attachRecvSign">
            <el-upload
              ref="uploadRef4"
              :disabled="showType == 'read'"
              accept="*"
              action="attachRecvSign"
              :auto-upload="true"
              :file-list="fileList4"
              :http-request="fileUpload4"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove4(uploadFile, uploadFiles, 'attachRecvSign');
                }
              "
              :on-error="handleError4"
              :on-success="handleSuccess4"
            >
              <el-button type="primary" text :loading="attachContractUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="验收单" prop="attachCheck">
            <el-upload
              ref="uploadRef5"
              :disabled="showType == 'read'"
              accept="*"
              action="attachCheck"
              :auto-upload="true"
              :file-list="fileList5"
              :http-request="fileUpload5"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove5(uploadFile, uploadFiles, 'attachCheck');
                }
              "
              :on-error="handleError5"
              :on-success="handleSuccess5"
            >
              <el-button type="primary" text :loading="attachContractUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="其他" prop="attachOther">
            <el-upload
              ref="uploadRef6"
              :disabled="showType == 'read'"
              accept="*"
              action="attachOther"
              :auto-upload="true"
              :file-list="fileList6"
              :http-request="fileUpload6"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove6(uploadFile, uploadFiles, 'attachOther');
                }
              "
              :on-error="handleError6"
              :on-success="handleSuccess6"
            >
              <el-button type="primary" text :loading="attachContractUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'read'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
