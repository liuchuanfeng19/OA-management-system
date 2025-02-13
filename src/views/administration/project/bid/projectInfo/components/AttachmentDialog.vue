<script setup lang="ts">
import type { FormInstance } from "element-plus";
import _ from "lodash";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";

import { updateProjectItem, getAttach } from "@/api/projectItem";
import FileUpload from "@/components/FileUpload";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectFullName: "", //项目名称
  bidCompanyName: "", //投标单位
  bidAttachZbgg: [], //招标公告
  bidAttachBmzl: [], //报名资料
  bidAttachBmfp: [], //报名发票
  bidAttachZbwj: [], //招标文件
  bidAttachBywj: [], //补遗文件
  bidAttachDywj: [], //答疑文件
  bidAttachTbbzj: [], //投标保证金/投标保函
  bidAttachCost: [], //成本
  bidAttachCjsqzl: [], //厂家授权资料
  bidAttachTbwj: [], //投标文件
  bidAttachKbylb: [], //开标一览表
  bidAttachZbtzs: [], //中标通知书/中标公示
  bidAttachZbfwf: [] //中标服务费及发票
};

// 表单校验规则
const fromRules = {};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法

const formData = ref(null);
const fileList1 = ref([]);
const fileList2 = ref([]);
const fileList3 = ref([]);
const fileList4 = ref([]);
const fileList5 = ref([]);
const fileList6 = ref([]);
const fileList7 = ref([]);
const fileList8 = ref([]);
const fileList9 = ref([]);
const fileList10 = ref([]);
const fileList11 = ref([]);
const fileList12 = ref([]);
const fileList13 = ref([]);
const showType = ref("add");
const uploading = ref(false);
const requesting = ref(false);
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加投标项目信息表附件"
    : showType.value == "edit"
      ? "编辑投标项目信息表附件"
      : showType.value == "read"
        ? "查看投标项目信息表附件"
        : showType.value == "manage"
          ? "管理投标项目信息表附件"
          : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = JSON.parse(JSON.stringify(INITIAL_DATA));
  if (_formData) {
    getDetail(_formData.bidCompanyId);
  }
};
defineExpose({ show });

// 根据部门Id获取员工列表
const getDetail = async id => {
  const { data = {} } = await getAttach({
    id
  });
  formData.value = data || {};
  fileList1.value =
    formData.value.bidAttachZbgg != null &&
    formData.value.bidAttachZbgg.length > 0
      ? formData.value.bidAttachZbgg.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList2.value =
    formData.value.bidAttachBmzl != null &&
    formData.value.bidAttachBmzl.length > 0
      ? formData.value.bidAttachBmzl.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList3.value =
    formData.value.bidAttachBmfp != null &&
    formData.value.bidAttachBmfp.length > 0
      ? formData.value.bidAttachBmfp.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList4.value =
    formData.value.bidAttachBywj != null &&
    formData.value.bidAttachBywj.length > 0
      ? formData.value.bidAttachBywj.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList5.value =
    formData.value.bidAttachDywj != null &&
    formData.value.bidAttachDywj.length > 0
      ? formData.value.bidAttachDywj.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList6.value =
    formData.value.bidAttachTbbzj != null &&
    formData.value.bidAttachTbbzj.length > 0
      ? formData.value.bidAttachTbbzj.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList7.value =
    formData.value.bidAttachTbwj != null &&
    formData.value.bidAttachTbwj.length > 0
      ? formData.value.bidAttachTbwj.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList8.value =
    formData.value.bidAttachZbtzs != null &&
    formData.value.bidAttachZbtzs.length > 0
      ? formData.value.bidAttachZbtzs.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList9.value =
    formData.value.bidAttachZbfwf != null &&
    formData.value.bidAttachZbfwf.length > 0
      ? formData.value.bidAttachZbfwf.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList10.value =
    formData.value.bidAttachZbwj != null &&
    formData.value.bidAttachZbwj.length > 0
      ? formData.value.bidAttachZbwj.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList11.value =
    formData.value.bidAttachCost != null &&
    formData.value.bidAttachCost.length > 0
      ? formData.value.bidAttachCost.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList12.value =
    formData.value.bidAttachCjsqzl != null &&
    formData.value.bidAttachCjsqzl.length > 0
      ? formData.value.bidAttachCjsqzl.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList13.value =
    formData.value.bidAttachKbylb != null &&
    formData.value.bidAttachKbylb.length > 0
      ? formData.value.bidAttachKbylb.map(item => {
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
  requesting.value = true;
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      updateProjectItem(formData.value)
        .then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            dialogVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        })
        .finally(() => {
          requesting.value = false;
        });
    } else {
      requesting.value = false;
    }
  });
}, 300);

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value!);
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="860"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="150px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="项目名称" prop="projectFullName">
            <el-input v-model="formData.projectFullName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="投标单位" prop="bidCompanyName">
            <el-input v-model="formData.bidCompanyName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="招标公告" prop="bidAttachZbgg">
            <FileUpload
              v-model="formData.bidAttachZbgg"
              v-model:file-list="fileList1"
              :limit="0"
              :showType="showType"
              :disabled="uploading"
              :uploading="uploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="报名资料" prop="bidAttachBmzl">
            <FileUpload
              v-model="formData.bidAttachBmzl"
              v-model:file-list="fileList2"
              :limit="0"
              :showType="showType"
              :disabled="uploading"
              :uploading="uploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="报名发票" prop="bidAttachBmfp">
            <FileUpload
              v-model="formData.bidAttachBmfp"
              v-model:file-list="fileList3"
              :limit="0"
              :showType="showType"
              :disabled="uploading"
              :uploading="uploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="招标文件(含图纸)" prop="bidAttachZbwj">
            <FileUpload
              v-model="formData.bidAttachZbwj"
              v-model:file-list="fileList10"
              :limit="0"
              :showType="showType"
              :disabled="uploading"
              :uploading="uploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="补遗文件" prop="bidAttachBywj">
            <FileUpload
              v-model="formData.bidAttachBywj"
              v-model:file-list="fileList4"
              :limit="0"
              :showType="showType"
              :disabled="uploading"
              :uploading="uploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="答疑文件" prop="bidAttachDywj">
            <FileUpload
              v-model="formData.bidAttachDywj"
              v-model:file-list="fileList5"
              :limit="0"
              :showType="showType"
              :disabled="uploading"
              :uploading="uploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="投标保证金/投标保函" prop="bidAttachTbbzj">
            <FileUpload
              v-model="formData.bidAttachTbbzj"
              v-model:file-list="fileList6"
              :limit="0"
              :showType="showType"
              :disabled="uploading"
              :uploading="uploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="成本" prop="bidAttachCost">
            <FileUpload
              v-model="formData.bidAttachCost"
              v-model:file-list="fileList11"
              :limit="0"
              :showType="showType"
              :disabled="uploading"
              :uploading="uploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="厂家授权资料" prop="bidAttachCjsqzl">
            <FileUpload
              v-model="formData.bidAttachCjsqzl"
              v-model:file-list="fileList12"
              :limit="0"
              :showType="showType"
              :disabled="uploading"
              :uploading="uploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="投标文件" prop="bidAttachTbwj">
            <FileUpload
              v-model="formData.bidAttachTbwj"
              v-model:file-list="fileList7"
              :limit="0"
              :showType="showType"
              :disabled="uploading"
              :uploading="uploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="开标一览表" prop="bidAttachKbylb">
            <FileUpload
              v-model="formData.bidAttachKbylb"
              v-model:file-list="fileList13"
              :limit="0"
              :showType="showType"
              :disabled="uploading"
              :uploading="uploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="中标通知书/中标公示" prop="bidAttachZbtzs">
            <FileUpload
              v-model="formData.bidAttachZbtzs"
              v-model:file-list="fileList8"
              :limit="0"
              :showType="showType"
              :disabled="uploading"
              :uploading="uploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="中标服务费及发票" prop="bidAttachZbfwf">
            <FileUpload
              v-model="formData.bidAttachZbfwf"
              v-model:file-list="fileList9"
              :limit="0"
              :showType="showType"
              :disabled="uploading"
              :uploading="uploading"
              :show-file-list="showType != 'read'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        :loading="requesting"
        :disabled="uploading"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
