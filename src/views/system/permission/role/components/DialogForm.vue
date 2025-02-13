<script setup lang="ts">
import { ref, unref, computed } from "vue";
import { useCopyToClipboard } from "@pureadmin/utils";
import { ElMessage, type FormInstance } from "element-plus";
import { saveRole } from "@/api/role";

const { clipboardValue, copied } = useCopyToClipboard();

// 表单模型
const INITIAL_DATA = {
  roleId: undefined,
  roleCode: "", //角色标识
  allowEdit: 1, //是否允许编辑
  allowDelete: 1, //是否允许删除
  isVisible: 1, //是否显示
  roleName: "", //角色名称
  isValid: true, //角色状态
  isEnable: 1, //是否启用
  isSelected: true,
  remarks: "" //角色描述
};

// 表单校验规则
const rules = {
  roleName: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  roleCode: [{ required: true, message: "请输入角色标识", trigger: "blur" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const type = ref("add");

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加角色"
    : type.value == "edit"
      ? "编辑角色-" + formData.value.roleName
      : "";
});

// 子组件暴露给父组件调用的方法
const show = async _formData => {
  if (_formData) {
    type.value = "edit";
    formData.value = { ..._formData };
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formVisible.value = true;
};
defineExpose({ show });

function handleCopy() {
  clipboardValue.value = unref(formData.value.roleCode);
  if (copied.value) {
    ElMessage.success("拷贝成功");
  }
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await saveRole(formData.value);
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
        resetForm(formEl);
        emit("search");
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
    :width="632"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="96px"
    >
      <el-row :gutter="40">
        <el-col :span="12" :offset="0">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="formData.roleName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="角色标识" prop="roleCode">
            <el-input v-model="formData.roleCode" placeholder="请输入">
              <template #append>
                <el-button type="primary" @click="handleCopy">复制</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="是否允许编辑" prop="allowEdit">
            <el-radio-group v-model="formData.allowEdit">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="是否允许删除" prop="allowDelete">
            <el-radio-group v-model="formData.allowDelete">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="角色状态" prop="isEnable">
            <el-radio-group v-model="formData.isEnable">
              <el-radio :label="0">已停用</el-radio>
              <el-radio :label="1">已启用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="是否显示" prop="isVisible">
            <el-radio-group v-model="formData.isVisible">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col> -->
        <el-col :span="24" :offset="0">
          <el-form-item label="角色描述" prop="remarks">
            <el-input
              v-model="formData.remarks"
              type="textarea"
              show-word-limit
              :maxlength="255"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="formVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
