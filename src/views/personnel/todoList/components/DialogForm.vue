<script setup lang="ts">
import { FormInstance, ElMessage } from "element-plus";
import { ref, computed } from "vue";

import {
  getAuditNotice,
  addAuditNotice,
  editAuditNotice
} from "@/api/auditNotice";
import { emitter } from "@/utils/mitt";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  noticeType: "",
  title1: "",
  content: "",
  isRead: false,
  attachment: "",
  createTime: ""
};

// 表单校验规则
const rules = {
  companyName: [{ required: true, message: "请输入公司名称", trigger: "blur" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const formData = ref(null);
const showType = ref("add");
const formLoading = ref(false);
const formVisible = ref(false);
const ruleFormRef = ref<FormInstance>();

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加"
    : showType.value == "edit"
      ? "修改"
      : showType.value == "read"
        ? "查看"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (_formData) {
    showType.value = _type;
    await getDetail(_formData.id);
    emit("search");
  } else {
    fileList.value = [];
    showType.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formVisible.value = true;
};
defineExpose({ show });

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getAuditNotice({ id });
  formData.value = data || {};
  imgUrl.value = data.certImages;
  fileList.value = [{ name: "", url: data.certImages }];
  formLoading.value = false;
  emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "add") {
        const { code, message } = await addAuditNotice(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { code, message } = await editAuditNotice(formData.value);
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

const fileList = ref([]);
const imgUrl = ref("");
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="620"
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
        <el-col :span="23" :offset="0">
          <el-form-item label="标题" prop="title1">
            <el-input
              v-model="formData.title1"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="23" :offset="0">
          <el-form-item label="内容" prop="content">
            <el-input
              v-model="formData.content"
              type="textarea"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
              :rows="10"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="23" :offset="0">
          <el-form-item label="创建时间" prop="createTime">
            <el-input
              v-model="formData.createTime"
              :readonly="showType == 'read'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button
        v-if="showType == 'add' || showType == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
      <el-button @click="formVisible = false">{{
        showType != "read" ? "取消" : "关闭"
      }}</el-button>
    </template>
  </el-dialog>
</template>
