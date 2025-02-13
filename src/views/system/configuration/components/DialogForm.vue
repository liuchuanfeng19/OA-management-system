<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { addConfig } from "@/api/config";
import { ElMessage, type FormInstance, CascaderOption } from "element-plus";

interface KVType {
  name: string | number;
  value: number;
}

// 表单模型
const INITIAL_DATA = {
  type: "", //add,addChild,addBrother,edit
  configId: undefined, // 新增初始值必须为undefind
  catalogId: "",
  valueType: "",
  configKey: "",
  configName: "",
  configValue: "",
  serialNumber: "",
  remark: ""
};

// 表单校验规则
const rules = {
  catalogId: [{ required: true, message: "请选择配置目录", trigger: "change" }],
  valueType: [{ required: true, message: "请输入配置键值", trigger: "blur" }],
  configKey: [{ required: true, message: "请输入配置键名", trigger: "blur" }],
  configName: [{ required: true, message: "请输入配置名称", trigger: "blur" }],
  configValue: [{ required: true, message: "请输入配置键值", trigger: "blur" }],
  serialNumber: [{ required: true, message: "请输入配置行号", trigger: "blur" }]
};

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "name",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 在 <script setup> 中使用 defineProps API 来声明 props
const props = defineProps({
  list: {
    type: Array,
    default: () => {
      return [];
    }
  },
  kvTypeList: {
    type: Array<KVType>,
    default: () => {
      return new Array<KVType>();
    }
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const cascaderOptions = ref<CascaderOption[]>([]);
const type = ref("add");

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加配置"
    : type.value == "edit"
      ? "编辑配置"
      : "";
});

// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => props.list,
  (val: CascaderOption[]) => {
    if (val) {
      cascaderOptions.value = val;
    }
  }
);

// 子组件暴露给父组件调用的方法
const show = async _formData => {
  cascaderOptions.value = JSON.parse(
    JSON.stringify(props.list)
  ) as CascaderOption[];
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

// “所属部门”改变事件
const handleDeptChange = val => {
  console.log(val);
};

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  const data = Object.assign({}, formData.value);
  delete data.type;
  delete data.allowTime;
  delete data.lockDate;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (type.value == "add") {
        const { code, message } = await addConfig(data);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (type.value == "edit") {
        const { code, message } = await addConfig(data);
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
  //姓名列表在对话框关闭前需要重置，否则下次打开对话框可以选择上次的用户列表
  formVisible.value = false;
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="580"
    draggable
    :before-close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="配置名称" prop="configName">
            <el-input v-model="formData.configName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="配置目录" prop="catalogId">
            <el-cascader
              v-model="formData.catalogId"
              style="width: 100%"
              :options="cascaderOptions"
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
          <el-form-item label="配置键名" prop="configKey">
            <el-input v-model="formData.configKey" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="配置键值" prop="configValue">
            <el-input v-model="formData.configValue" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="键值类型" prop="valueType">
            <el-select
              v-model="formData.valueType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in kvTypeList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="配置行号" prop="serialNumber">
            <el-input-number
              v-model="formData.serialNumber"
              placeholder="请输入"
              type="number"
              @input="
                val => {
                  formData.serialNumber = val ? parseInt(val) : 0;
                }
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="配置描述">
            <el-input
              v-model="formData.remark"
              placeholder="请输入"
              show-word-limit
              maxlength="255"
              type="textarea"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
