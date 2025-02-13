<script setup lang="ts">
import _ from "lodash";
import { ref, computed, watch, type PropType } from "vue";
import type { FormInstance, UploadUserFile } from "element-plus";

import {
  getSellContractNV,
  getSellContractItemAttach,
  createSellContractItemAttach,
  updateSellContractItemAttach
} from "@/api/sellContractItemAttach";
import { Project } from "../data";
import { ElMessage } from "element-plus";
import FileUpload from "@/components/FileUpload";

// 表单模型
const INITIAL_DATA = {
  projectId: "", //项目Id
  sellContractId: "", //销售合同ID
  attachWzhtqd: [] //附件物资合同清单
};

// 表单校验规则
const fromRules = {
  projectId: [{ required: true, message: "请选择项目名称" }],
  // sellContractId: [{ required: true, message: "请选择合同编号" }],
  attachWzhtqd: [{ required: true, message: "请上传附件", trigger: "change" }]
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
const fileList = ref<UploadUserFile[]>([]); //物资合同
const showType = ref("add");
const fileUploading = ref(false);
const sellContractList = ref([]); //销售合同
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加物资合同清单"
    : showType.value == "edit"
      ? "编辑物资合同清单"
      : showType.value == "read"
        ? "查看物资合同清单"
        : "";
});
watch(
  () => formData.value.projectId,
  newValue => {
    if (newValue) {
      getSellContractList(newValue);
    } else {
      sellContractList.value = [];
    }
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.attachWzhtqd = [];
  if (_formData) {
    getDetail(_formData.id);
  }
};
defineExpose({ show });

// 根据Id获取销售列表详情
const getDetail = async id => {
  const { data = {} } = await getSellContractItemAttach({
    id
  });
  formData.value = data || {};
  fileList.value =
    formData.value.attachWzhtqd != null &&
    formData.value.attachWzhtqd.length > 0
      ? formData.value.attachWzhtqd.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
};

// 获取销售合同NV列表
function getSellContractList(projectId) {
  getSellContractNV({ projectId })
    .then(({ data }) => {
      sellContractList.value = data || [];
    })
    .catch(() => {
      sellContractList.value = [];
    });
}

function handleFileChange({ name }) {
  console.log("name", name);
  ruleFormRef.value.validateField(name, () => null);
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  // .join("~_~")
  formEl.validate(async valid => {
    if (valid) {
      const fileFormData = new FormData();
      fileFormData.append("projectId", formData.value.projectId);
      fileFormData.append("sellContractId", formData.value.sellContractId);
      fileFormData.append(
        "attachWzhtqd",
        JSON.stringify(formData.value.attachWzhtqd)
      );
      fileList.value.forEach((file, index) => {
        fileFormData.append("file" + index, file.raw);
      });
      if (showType.value == "add") {
        const { code, message } =
          await createSellContractItemAttach(fileFormData);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (showType.value == "edit") {
        const { code, message } = await updateSellContractItemAttach(
          formData.value
        );
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
  if (!formEl) return;
  formEl.resetFields();
  fileList.value = [];
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
    :width="370"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :disabled="showType == 'read'"
      :model="formData"
      :rules="fromRules"
      label-width="96px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              :disabled="showType != 'add'"
              :placeholder="showType != 'add' ? '' : '请选择'"
              clearable
              filterable
              :style="{ width: '100%' }"
              @change="
                () => {
                  formData.sellContractId = '';
                }
              "
            >
              <el-option
                v-for="item in props.projectList"
                :key="item.projectId"
                :label="item.projectFullName"
                :value="item.projectId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="合同编号" prop="sellContractId">
            <el-select
              v-model="formData.sellContractId"
              :disabled="showType != 'add' || formData.projectId == ''"
              :placeholder="
                formData.projectId == '' ? '请先选择项目名称' : '请选择'
              "
              clearable
              filterable
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in sellContractList"
                :key="item.sellContractId"
                :label="item.sellContractCode"
                :value="item.sellContractId"
                :disabled="item.isBind"
                :title="item.isBind ? '该合同编号已添加物资合同清单' : ''"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="附件" prop="attachWzhtqd">
            <FileUpload
              v-model="formData.attachWzhtqd"
              v-model:file-list="fileList"
              accept=".doc,.docx,.pdf,.xls,.xlsx"
              action="attachWzhtqd"
              :limit="0"
              :showType="showType"
              fieldName="attachWzhtqd"
              :disabled="fileUploading"
              :uploading="fileUploading"
              :show-file-list="showType != 'read'"
              @change="handleFileChange"
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
        :disabled="fileUploading"
        :title="fileUploading ? '文件上传中' : ''"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
