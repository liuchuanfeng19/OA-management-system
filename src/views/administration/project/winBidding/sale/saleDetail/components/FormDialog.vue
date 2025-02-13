<script setup lang="ts">
import _ from "lodash";
import type {
  UploadProps,
  FormInstance,
  UploadRawFile,
  UploadInstance,
  UploadUserFile
} from "element-plus";
import { ref, computed } from "vue";

import { getSellContractNV } from "@/api/sellContractItemAttach";
import { importSellContractItem } from "@/api/sellContractItem";
import { ElMessage, genFileId } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "", //项目Id
  sellContractId: "", //销售合同ID
  attachXshtmx: "" //附件物资合同清单
};

// 表单校验规则
const fromRules = {
  projectId: [{ required: true, message: "请选择项目名称" }],
  sellContractId: [{ required: true, message: "请选择合同编号" }],
  attachXshtmx: [{ required: true, message: "请上传附件" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const formData = ref({ ...INITIAL_DATA });
const fileList = ref<UploadUserFile[]>([]); //物资合同
const showType = ref("add");
const projectList = ref([]);
const sellContractList = ref([]); //销售合同
const dialogVisible = ref(false);
const uploadRef = ref<UploadInstance>();
const fileData = ref<FormData>();
const ruleFormRef = ref<FormInstance>();

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "导入销售合同明细"
    : showType.value == "edit"
      ? "编辑销售合同明细"
      : showType.value == "read"
        ? "查看销售合同明细"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_showType, projectData, projectId) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  projectList.value = projectData;
  formData.value.projectId = projectId;
  getSellContractList(projectId);
};
defineExpose({ show });

// 获取销售合同NV列表
function getSellContractList(projectId) {
  sellContractList.value = [];
  getSellContractNV({ projectId })
    .then(({ data }) => {
      sellContractList.value = data || [];
    })
    .catch(() => {
      sellContractList.value = [];
    });
}

const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
  if (
    rawFile.type != "application/vnd.ms-excel" &&
    rawFile.type !=
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    ElMessage.error("不支持的文件类型");
    return false;
  }
  return true;
};

//上传附件
async function handleUpLoad(options) {
  const data = new FormData();
  data.append("file", options.file);
  fileData.value = data;
  formData.value.attachXshtmx = options.file.name;
  fileList.value = [options.file];
}
const handleExceed: UploadProps["onExceed"] = files => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  uploadRef.value!.submit();
};
// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "add") {
        const { code, message } = await importSellContractItem(
          formData.value,
          fileData.value
        );
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (showType.value == "edit") {
        emit("search");
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
              filterable
              :style="{ width: '100%' }"
              @change="
                () => {
                  formData.sellContractId = '';
                  getSellContractList(formData.projectId);
                }
              "
            >
              <el-option
                v-for="item in projectList"
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
              :placeholder="
                formData.projectId == '' ? '请先选择项目名称' : '请选择'
              "
              filterable
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in sellContractList"
                :key="item.sellContractId"
                :label="item.sellContractCode"
                :value="item.sellContractId"
                :title="item.isBind ? '该合同编号已添加物资合同清单' : ''"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="附件" prop="attachXshtmx">
            <el-upload
              v-if="showType == 'add'"
              action="attachXshtmx"
              :file-list="fileList"
              :http-request="handleUpLoad"
              class="uploader"
              :limit="1"
              :before-upload="handleBeforeUpload"
              :on-exceed="handleExceed"
              style="width: 100%"
            >
              <el-button type="primary" text>选择文件</el-button>
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
