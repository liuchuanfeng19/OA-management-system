<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue";
import { saveButton } from "@/api/button";
import { ElMessage, type FormInstance, CascaderOption } from "element-plus";

interface RestaurantItem {
  value: string;
  code: string;
}

// 表单模型
const INITIAL_DATA = {
  funcItemId: undefined, // 添加初始值必须为undefind
  menuId: "",
  menuName: "",
  itemName: "", //按钮编号
  code: "",
  displayName: "",
  category: "",
  // isPublic: 0,
  // allowDelete: 0,
  // allowEdit: 0,
  remarks: ""
  // creater: "",
  // createTime: "",
  // modifier: "",
  // modifyTime: "",
  // isValid: true,
  // menuName: "",
  // isSelected: true
};

// 表单校验规则
const rules = {
  menuId: [{ required: true, message: "请选择所属菜单", trigger: "change" }],
  displayName: [{ required: true, message: "请输入按钮名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入按钮编号", trigger: "blur" }]
};

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "title",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

const restaurants: RestaurantItem[] = [
  { value: "查询", code: "query" },
  { value: "添加", code: "add" },
  { value: "编辑", code: "edit" },
  { value: "删除", code: "delete" },
  { value: "申请", code: "apply" },
  { value: "审核", code: "audit" },
  { value: "导入", code: "import" },
  { value: "导出", code: "export" },
  { value: "预览", code: "preview" },
  { value: "下载", code: "download" },
  { value: "打印", code: "print" }
];

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
const cascaderRef = ref(null);
const cascaderOptions = ref<CascaderOption[]>([]);
const type = ref("add");

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加按钮"
    : type.value == "edit"
      ? "修改按钮"
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
const show = async (_formData, _menuId) => {
  cascaderOptions.value = JSON.parse(
    JSON.stringify(props.list)
  ) as CascaderOption[];
  if (_formData) {
    type.value = "edit";
    formData.value = { ..._formData };
    formData.value.menuName = _formData.itemName.split(".")[0] + ".";
    formData.value.code = _formData.itemName.split(".")[1];
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA, menuId: _menuId };
  }
  formVisible.value = true;
  if (_menuId) {
    nextTick(() => {
      handleMenuChange();
    });
  }
};
defineExpose({ show });

const handleMenuChange = () => {
  const menu = cascaderRef.value.getCheckedNodes();
  formData.value.menuName = menu[0].data.name + ".";
};

const nameQuerySearch = (queryString: string, cb: any) => {
  const results = queryString
    ? restaurants.filter(createFilter(queryString))
    : restaurants;
  cb(results);
};

const createFilter = (queryString: string) => {
  return (restaurant: RestaurantItem) => {
    return (
      restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    );
  };
};

const handleNameSelect = (item: RestaurantItem) => {
  formData.value.code = item.code;
};

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  const data = Object.assign({}, formData.value);
  data.itemName = data.menuName + data.code;
  delete data.menuName;
  delete data.code;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await saveButton(data);
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
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
    :width="600"
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
      <el-row :gutter="40">
        <el-col :span="12" :offset="0">
          <el-form-item label="所属菜单" prop="menuId">
            <el-cascader
              ref="cascaderRef"
              v-model="formData.menuId"
              :options="cascaderOptions"
              placeholder="请选择"
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
              @change="handleMenuChange"
            >
              <template #default="{ data }">
                <span>{{ data.title }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="按钮名称" prop="displayName">
            <el-autocomplete
              v-model.trim="formData.displayName"
              style="width: 100%"
              :fetch-suggestions="nameQuerySearch"
              clearable
              placeholder="请输入"
              @select="handleNameSelect"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="分类">
            <el-select
              v-model="formData.category"
              placeholder="请选择"
              style="width: 100%"
              clearable
            >
              <el-option :key="1" label="按钮" value="按钮" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="按钮编号" prop="code">
            <el-input
              v-model.trim="formData.code"
              placeholder="请输入"
              :disabled="!formData.menuName || !formData.displayName"
            >
              <template #prepend>{{ formData.menuName }}</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model="formData.remarks"
              type="textarea"
              show-word-limit
              maxlength="255"
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

<style lang="scss" scoped>
:deep(.el-input-group__prepend) {
  padding: 0 11px !important;
}
</style>
