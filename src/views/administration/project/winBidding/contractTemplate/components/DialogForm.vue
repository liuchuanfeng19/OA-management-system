<script setup lang="ts">
import { ref, computed } from "vue";
import {
  ElMessage,
  FormInstance,
  genFileId,
  UploadInstance,
  UploadProps,
  UploadRawFile
} from "element-plus";
import {
  addSellContractTemplate,
  updateSellContractTemplate,
  getSellContractTemplateDetail
} from "@/api/contractTemplate";
import { uploadImg } from "@/api/common";
import { PreviewButton } from "@/components/PreviewButton";
import { DownloadButton } from "@/components/DownloadButton";
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  templateName: "", //模板名称
  templateAttach: "", //模板附件
  templateVersion: "", //模板版本
  customerName: "", //供应商
  remark: "" //备注
};

// 表单校验规则
const rules = {
  templateName: [
    { required: true, message: "请输入模板名称", trigger: "blur" }
  ],
  customerName: [
    { required: true, message: "请输入客户/供应商", trigger: "blur" }
  ],
  templateAttach: [{ required: true, message: "请上传模板附件" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formLoading = ref(false);
const formVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const type = ref("add");
const uploadRef1 = ref<UploadInstance>();
const fileList1 = ref([]);
const fileName1 = ref("");
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加合同模板"
    : type.value == "edit"
      ? "编辑合同模板"
      : type.value == "query"
        ? "查看合同模板"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  type.value = _type;
  fileList1.value = [];
  fileName1.value = "";
  if (_formData) {
    await getDetail(_formData.id);
  }
};
defineExpose({ show });

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getSellContractTemplateDetail({ id });
  formData.value = data || {};

  if (
    formData.value.templateAttach != "" &&
    formData.value.templateAttach != null
  ) {
    const url = formData.value.templateAttach;
    const index = url.lastIndexOf("/");
    fileName1.value = url.substring(index + 1, url.length);
    fileList1.value =
      formData.value.templateAttach != ""
        ? [
            {
              name: fileName1.value,
              url: formData.value.templateAttach
            }
          ]
        : [];
  }
  formLoading.value = false;
}
//上传图片
async function handleUpLoadImg(options) {
  const path = "/tyOA/contractTemplate";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value.templateAttach = res["data"][0];
    fileList1.value = [{ name: options.file.name, url: res["data"][0] }];
    ruleFormRef.value.validateField("img", () => null);
  });
}
// const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
//   if (rawFile.size / 1024 / 1024 > 5) {
//     ElMessage.error("所选文件不能超过5Mb");
//     return false;
//   }
//   return true;
// };
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
function handleRemove1(action: string) {
  // formData.value[action] = "";
  console.log("fileList", fileList1.value);
  formData.value[action] = fileList1.value.map((item: any) =>
    item.url ? item.url : item.raw.temp
  );
  ruleFormRef.value.validateField(action, () => null);
  console.log("fileList", fileList1.value);
  console.log(`${formData.value[action]}`, formData.value[action]);
  ruleFormRef.value.validateField(action, () => null);
}
// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (type.value == "add") {
        const { code, message } = await addSellContractTemplate(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
        formVisible.value = false;
        resetForm(formEl);
        emit("search");
      } else {
        const { code, message } = await updateSellContractTemplate(
          formData.value
        );
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
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="540"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="客户/供应商" prop="customerName">
            <el-input
              v-model="formData.customerName"
              :readonly="type == 'query'"
              :placeholder="type == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="模板名称" prop="templateName">
            <el-input
              v-model="formData.templateName"
              :readonly="type == 'query'"
              :placeholder="type == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="模板版本" prop="templateVersion">
            <el-input
              v-model="formData.templateVersion"
              :readonly="type == 'query'"
              :placeholder="type == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="areatext"
              :readonly="type == 'query'"
              :placeholder="type == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="模板附件" prop="templateAttach">
            <el-upload
              v-if="type == 'add' || type == 'edit'"
              ref="uploadRef1"
              action="templateAttach"
              :auto-upload="true"
              :file-list="fileList1"
              :http-request="handleUpLoadImg"
              :limit="1"
              :on-exceed="handleExceed1"
              :on-error="handleError1"
              :on-remove="
                () => {
                  handleRemove1('templateAttach');
                }
              "
              :on-success="handleSuccess1"
            >
              <el-button type="primary">选择文件</el-button>
            </el-upload>
            <div
              v-else
              style="display: flex; flex-direction: row; width: 390px"
            >
              <span style="margin-right: 10px">{{ fileName1 }}</span>
              <PreviewButton
                :src-list="[formData.templateAttach]"
                size="default"
              />
              <DownloadButton
                :src-list="[formData.templateAttach]"
                size="default"
              />
            </div>
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
      <el-button v-if="type == 'query'" @click="formVisible = false"
        >关闭</el-button
      >
    </template>
  </el-dialog>
</template>
