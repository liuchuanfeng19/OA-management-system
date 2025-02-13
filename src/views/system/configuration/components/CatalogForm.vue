<script setup lang="ts">
import { useCopyToClipboard } from "@pureadmin/utils";
import { ref, unref, watch, computed } from "vue";
import { ElMessage, type FormInstance, CascaderOption } from "element-plus";

import { addCatalog, getCatalogDetail } from "@/api/catalog";

const { clipboardValue, copied } = useCopyToClipboard();

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// 表单模型
const INITIAL_DATA = {
  type: "", //add,addChild,addBrother,edit
  catalogId: undefined, // 新增初始值必须为undefind
  catalogKey: "",
  catalogName: "",
  catalogType: "",
  parentId: "",
  remark: ""
};

// 表单校验规则
const rules = {
  catalogKey: [
    { required: true, message: "请输入目录键名", trigger: "change" }
  ],
  catalogName: [{ required: true, message: "请输入目录名称", trigger: "blur" }],
  catalogType: [
    { required: true, message: "请选择目录类别", trigger: "change" }
  ],
  parentId: [{ required: true, message: "请选择上级目录", trigger: "change" }]
};

// vue3 在 <script setup> 中使用 defineProps API 来声明 props
const props = defineProps({
  list: {
    type: Array,
    default: () => {
      return [];
    }
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(INITIAL_DATA);
let departmentList: CascaderOption[] = [];
const departmentTree = ref([]);
const type = ref("add");

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加类别"
    : type.value == "edit"
      ? "编辑类别"
      : "";
});

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "name",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => props.list,
  (val: CascaderOption[]) => {
    if (val) {
      departmentList = val;
      departmentTree.value = departmentList;
    }
  }
);

const getData = async id => {
  const { data } = await getCatalogDetail({ id });
  formData.value = data || {};
};

const show = _formData => {
  formVisible.value = true;
  if (_formData) {
    //编辑
    type.value = "edit";
    getData(_formData.id);
  } else {
    type.value = "add";
  }
};
defineExpose({ show });

// “所属部门”改变事件
const handleDeptChange = val => {
  console.log(val);
};

function handleCopy() {
  clipboardValue.value = unref(formData.value.catalogKey);
  if (copied.value) {
    ElMessage.success("拷贝成功");
  }
}

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  const data = Object.assign({}, formData.value);
  delete data.type;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await addCatalog(data);
      if (code == 0) {
        ElMessage.success(message);
        resetForm(formEl);
        emit("search");
        formVisible.value = false;
      }
    }
  });
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  formData.value = { ...INITIAL_DATA };
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  //姓名列表在对话框关闭前需要重置，否则下次打开对话框可以选择上次的用户列表
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="660"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="上级目录" prop="parentId">
            <el-cascader
              v-model="formData.parentId"
              :options="departmentTree"
              placeholder="请选择"
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
              @change="handleDeptChange"
            >
              <template #default="{ data }">
                <span>{{ data.name }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="目录键名" prop="catalogKey">
            <el-input v-model="formData.catalogKey" placeholder="请输入">
              <template #append>
                <el-button type="primary" @click="handleCopy">复制</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="目录名称" prop="catalogName">
            <el-input v-model="formData.catalogName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="目录类别" prop="catalogType">
            <el-select
              v-model="formData.catalogType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option label="平台系统" :value="0" />
              <el-option label="业务系统" :value="1" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="类别描述" prop="remark">
            <el-input
              v-model="formData.remark"
              placeholder="请输入"
              type="textarea"
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
