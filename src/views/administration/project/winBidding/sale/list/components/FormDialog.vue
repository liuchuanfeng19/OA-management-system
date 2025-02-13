<script setup lang="ts">
import _ from "lodash";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";
import { ref, computed, watch, type PropType } from "vue";

import {
  getProjectExt,
  createProjectExt,
  updateProjectExt
} from "@/api/projectExt";
import { Project } from "../data";
import FileUpload from "@/components/FileUpload";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "", //项目Id
  projectFullName: "", //项目名称
  projectShortName: "", //项目立项简称
  attachCustomer: [], //甲方信息
  attachZbtzs: [], //中标通知书
  attachLybh: [], //履约保函
  attachWzht: [], //合同
  attachInvoice: [], //发票
  attachKgbgwj: [], //开工报告文件
  attachSjbgwj: [], //设计变更文件
  attachXmbywj: [], //项目报验文件
  attachYgjj: [], //验工计价
  attachJgyswj: [], //竣工验收文件
  attachDagyjwj: [], //档案管移交文件
  attachGchthj: [] //过程红头函件
};

// 表单校验规则
const fromRules = {
  projectId: [{ required: true, message: "项目名称不能为空" }]
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
const fileList = ref([]); //甲方信息
const fileList1 = ref([]); //中标通知书
const fileList2 = ref([]); //履约保函
const fileList3 = ref([]); //开工报告文件
const fileList4 = ref([]); //设计变更文件
const fileList5 = ref([]); //项目报验文件
const fileList6 = ref([]); //验工计价
const fileList7 = ref([]); //竣工验收文件
const fileList8 = ref([]); //档案管移交文件
const fileList9 = ref([]); //过程红头函件
const fileList10 = ref([]); //物资合同
const fileList11 = ref([]); //发票
const showType = ref("add");
const wzhtUploading = ref(false);
const gchthjUploading = ref(false);
const dagyjwjUploading = ref(false);
const jgyswjUploading = ref(false);
const ygjjUploading = ref(false);
const xmbywjUploading = ref(false);
const sjbgwjUploading = ref(false);
const kgbgwjUploading = ref(false);
const lybhUploading = ref(false);
const zbtzsUploading = ref(false);
const customerUploading = ref(false);
const attachInvoiceUploading = ref(false);
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加销售"
    : showType.value == "edit"
      ? "编辑销售"
      : showType.value == "read"
        ? "查看销售"
        : "";
});
const sureDisabled = computed(() => {
  return wzhtUploading.value ||
    gchthjUploading.value ||
    dagyjwjUploading.value ||
    jgyswjUploading.value ||
    ygjjUploading.value ||
    xmbywjUploading.value ||
    sjbgwjUploading.value ||
    kgbgwjUploading.value ||
    lybhUploading.value ||
    zbtzsUploading.value ||
    customerUploading.value ||
    attachInvoiceUploading.value
    ? true
    : false;
});
watch(
  () => formData.value.projectId,
  newVal => {
    if (!newVal) {
      formData.value.projectShortName = "";
      return;
    }
    const projet = props.projectList.find(item => item.projectId == newVal);
    formData.value.projectShortName = projet.projectShortName;
    formData.value.projectFullName = projet.projectFullName;
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    getDetail(_formData.id);
  }
};
defineExpose({ show });

// 根据Id获取销售列表详情
const getDetail = async id => {
  const { data = {} } = await getProjectExt({
    id
  });
  formData.value = data || {};
  fileList.value =
    formData.value.attachCustomer != null &&
    formData.value.attachCustomer.length > 0
      ? formData.value.attachCustomer.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList1.value =
    formData.value.attachZbtzs != null && formData.value.attachZbtzs.length > 0
      ? formData.value.attachZbtzs.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList2.value =
    formData.value.attachLybh != null && formData.value.attachLybh.length > 0
      ? formData.value.attachLybh.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList3.value =
    formData.value.attachKgbgwj != null &&
    formData.value.attachKgbgwj.length > 0
      ? formData.value.attachKgbgwj.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList4.value =
    formData.value.attachSjbgwj != null &&
    formData.value.attachSjbgwj.length > 0
      ? formData.value.attachSjbgwj.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];

  fileList5.value =
    formData.value.attachXmbywj != null &&
    formData.value.attachXmbywj.length > 0
      ? formData.value.attachXmbywj.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList6.value =
    formData.value.attachYgjj != null && formData.value.attachYgjj.length > 0
      ? formData.value.attachYgjj.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList7.value =
    formData.value.attachJgyswj != null &&
    formData.value.attachJgyswj.length > 0
      ? formData.value.attachJgyswj.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList8.value =
    formData.value.attachDagyjwj != null &&
    formData.value.attachDagyjwj.length > 0
      ? formData.value.attachDagyjwj.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList9.value =
    formData.value.attachGchthj != null &&
    formData.value.attachGchthj.length > 0
      ? formData.value.attachGchthj.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList10.value =
    formData.value.attachWzht != null && formData.value.attachWzht.length > 0
      ? formData.value.attachWzht.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList11.value =
    formData.value.attachInvoice != null &&
    formData.value.attachInvoice.length > 0
      ? formData.value.attachInvoice.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
};

// const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
//   if (rawFile.size / 1024 / 1024 > 5) {
//     ElMessage.error("所选文件不能超过5Mb");
//     return false;
//   }
//   return true;
// };

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "add") {
        const { code, message } = await createProjectExt(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (showType.value == "edit") {
        const { code, message } = await updateProjectExt(formData.value);
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

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  fileList.value = [];
  fileList1.value = [];
  fileList2.value = [];
  fileList3.value = [];
  fileList4.value = [];
  fileList5.value = [];
  fileList6.value = [];
  fileList7.value = [];
  fileList8.value = [];
  fileList9.value = [];
  fileList10.value = [];
  fileList11.value = [];
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
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              :disabled="showType != 'add'"
              :placeholder="showType != 'apply' ? '' : '请选择'"
              clearable
              filterable
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in props.projectList"
                :key="item.projectId"
                :label="item.projectFullName"
                :value="item.projectId"
                :disabled="item.isBind"
                :title="item.isBind ? '该项目已添加销售信息' : ''"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="项目立项简称" prop="projectShortName">
            <el-input v-model="formData.projectShortName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="甲方信息" prop="attachCustomer">
            <FileUpload
              v-model="formData.attachCustomer"
              v-model:file-list="fileList"
              :limit="0"
              :showType="showType"
              :disabled="customerUploading || showType == 'read'"
              :uploading="customerUploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="中标通知书" prop="attachZbtzs">
            <FileUpload
              v-model="formData.attachZbtzs"
              v-model:file-list="fileList1"
              :limit="0"
              :showType="showType"
              :disabled="zbtzsUploading || showType == 'read'"
              :uploading="zbtzsUploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="履约保函" prop="attachLybh">
            <FileUpload
              v-model="formData.attachLybh"
              v-model:file-list="fileList2"
              :limit="0"
              :showType="showType"
              :disabled="lybhUploading || showType == 'read'"
              :uploading="lybhUploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同" prop="attachWzht">
            <FileUpload
              v-model="formData.attachWzht"
              v-model:file-list="fileList10"
              :limit="0"
              :showType="showType"
              :disabled="wzhtUploading || showType == 'read'"
              :uploading="wzhtUploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="发票" prop="attachInvoice">
            <FileUpload
              v-model="formData.attachInvoice"
              v-model:file-list="fileList11"
              :limit="0"
              :showType="showType"
              :disabled="attachInvoiceUploading || showType == 'read'"
              :uploading="attachInvoiceUploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="开工报告文件" prop="attachKgbgwj">
            <FileUpload
              v-model="formData.attachKgbgwj"
              v-model:file-list="fileList3"
              :limit="0"
              :showType="showType"
              :disabled="kgbgwjUploading || showType == 'read'"
              :uploading="kgbgwjUploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="设计变更文件" prop="attachSjbgwj">
            <FileUpload
              v-model="formData.attachSjbgwj"
              v-model:file-list="fileList4"
              :limit="0"
              :showType="showType"
              :disabled="sjbgwjUploading || showType == 'read'"
              :uploading="sjbgwjUploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="项目报验文件" prop="attachXmbywj">
            <FileUpload
              v-model="formData.attachXmbywj"
              v-model:file-list="fileList5"
              :limit="0"
              :showType="showType"
              :disabled="xmbywjUploading || showType == 'read'"
              :uploading="xmbywjUploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="验工计价" prop="attachYgjj">
            <FileUpload
              v-model="formData.attachYgjj"
              v-model:file-list="fileList6"
              :limit="0"
              :showType="showType"
              :disabled="ygjjUploading || showType == 'read'"
              :uploading="ygjjUploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="竣工验收文件" prop="attachJgyswj">
            <FileUpload
              v-model="formData.attachJgyswj"
              v-model:file-list="fileList7"
              :limit="0"
              :showType="showType"
              :disabled="jgyswjUploading || showType == 'read'"
              :uploading="jgyswjUploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="档案管移交文件" prop="attachDagyjwj">
            <FileUpload
              v-model="formData.attachDagyjwj"
              v-model:file-list="fileList8"
              :limit="0"
              :showType="showType"
              :disabled="dagyjwjUploading || showType == 'read'"
              :uploading="dagyjwjUploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="过程红头函件" prop="attachGchthj">
            <FileUpload
              v-model="formData.attachGchthj"
              v-model:file-list="fileList9"
              :limit="0"
              :showType="showType"
              :disabled="gchthjUploading || showType == 'read'"
              :uploading="gchthjUploading"
              :show-file-list="showType != 'read'"
            />
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
        :disabled="sureDisabled"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
