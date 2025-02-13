<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Get, Create, Update } from "@/api/asset";
import { ElMessage, type FormInstance, CascaderOption } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  type: "", //add,addChild,addBrother,edit
  id: "",
  parentId: "", //00000000-0000-0000-0000-000000000000
  name: "",
  catType: "",
  path: "",
  seqId: ""
};

// 表单校验规则
const rules = {
  name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }]
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
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const cascaderOptions = ref<CascaderOption[]>([]);
const type = ref("add");

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加菜单"
    : type.value == "addChild"
      ? "添加子级菜单"
      : // : type.value == "addBrother"
        // ? "添加同级菜单"
        type.value == "edit"
        ? "编辑菜单"
        : "";
});

// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => props.list,
  (val: CascaderOption[]) => {
    if (val) {
      cascaderOptions.value = val; // 修改时父节点不能修改为当前节点
    }
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  cascaderOptions.value = JSON.parse(
    JSON.stringify(props.list)
  ) as CascaderOption[];
  if (_formData) {
    console.log(_formData, "_formData");
    console.log(_type, "_type");
    type.value = _type;
    await getDetail(_formData.id, _formData.id);
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formVisible.value = true;
};
defineExpose({ show });

// 修改表单时根据id获取详情数据
async function getDetail(id, parentId) {
  formLoading.value = true;
  const { data } = await Get({ id });
  formData.value = data || {};
  switch (type.value) {
    case "addChild":
      formData.value.parentId = parentId;
      delete formData.value.id;
      break;
    // case "addBrother":
    //   delete formData.value.id;
    //   break;
    case "edit":
      break;
  }
  formLoading.value = false;
}

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  const data = Object.assign({}, formData.value);
  data.parentId = data.parentId ? data.parentId : "";
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { code, message } = await Update(data);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { code, message } = await Create(data);
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
  formVisible.value = false;
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="640"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="40">
        <el-col :span="12" :offset="0">
          <el-form-item label="父级菜单" prop="parentId">
            <el-cascader
              v-model="formData.parentId"
              style="width: 100%"
              :options="cascaderOptions"
              placeholder="请选择"
              clearable
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
            >
              <template #default="{ data }">
                <span>{{ data.name }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="子类别名称" prop="name">
            <el-input v-model.trim="formData.name" placeholder="子类别名称" />
          </el-form-item>
        </el-col>

        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="显示顺序">
            <el-input-number
              v-model="formData.seqId"
              :min="1"
              :max="999"
              style="width: 100%"
              :step="1"
              :controls="true"
            />
          </el-form-item>
        </el-col> -->
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
