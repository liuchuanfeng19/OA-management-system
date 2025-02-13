<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
import { ref, computed } from "vue";
import {
  GetListNV,
  Createdetail,
  GetProdetail,
  Updatedetail
} from "@/api/project";
import { getTree } from "@/api/department";
import { ElMessage, type FormInstance } from "element-plus";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projId: "",
  projName: "",
  name: "",
  area: 0,
  structType: "",
  floorQty: 0,
  height: 0
};

// vue3 在 <script setup> 中使用 defineProps API 来声明 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(props.data);
const formLoading = ref(false);
const ProData = ref([]); //项目列表
const departmentData = ref([]); //部门列表
const { staffName } = useNav(); //用户名
const type = ref("add");

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  // getApprover();
  GetProStatus();
  departmentname();
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formData.value.staffName = staffName;
  formVisible.value = true;
};
defineExpose({ show });

//el-cascader props属性值
// const selProps = {
//   children: "children",
//   label: "fullName",
//   multiple: false,
//   emitPath: false,
//   value: "id",
//   checkStrictly: true
// };

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加项目明细"
    : type.value == "edit"
      ? "编辑项目明细"
      : type.value == "query"
        ? "查看项目明细"
        : "";
});

// 表单校验规则;

const rules = {
  projId: [{ required: true, message: "请选择项目名称", trigger: "change" }],
  name: [{ required: true, message: "请输入单位工程名称", trigger: "blur" }],
  area: [{ required: true, message: "请输入建筑面积", trigger: "blur" }],
  structType: [
    { required: true, message: "请输入结构类型期", trigger: "blur" }
  ],
  floorQty: [
    { required: true, message: "请输入地上/地下层数", trigger: "blur" }
  ],
  height: [{ required: true, message: "请输入檐口高度", trigger: "blur" }]
};

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetProdetail({ id });
  formData.value = data || {};
  formLoading.value = false;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await Updatedetail(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await Createdetail(formData.value);
        if (data) {
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

//获取项目列表
async function GetProStatus() {
  const { data } = await GetListNV();
  ProData.value = data || {};
}
//部门选项接口
async function departmentname() {
  const { data } = await getTree();
  departmentData.value = data || [];
}
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
      label-width="110px"
    >
      <div style="margin-right: 10px; margin-left: 10px">
        <div class="header">
          <el-row :gutter="20">
            <el-col :span="12" :offset="0">
              <el-form-item label="项目名称" prop="projId">
                <el-select
                  v-model="formData.projId"
                  :disabled="type == 'query' || type == 'edit'"
                  style="width: 100%"
                  :placeholder="
                    type == 'query' || type == 'edit' ? '' : '请选择'
                  "
                >
                  <el-option
                    v-for="item in ProData"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12" :offset="0">
              <el-form-item label="单位工程名称" prop="name">
                <el-input
                  v-model="formData.name"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12" :offset="0">
              <el-form-item label="建筑面积(㎡)" prop="area">
                <el-input
                  v-model="formData.area"
                  type="number"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="结构类型" prop="structType">
                <el-input
                  v-model="formData.structType"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="层数" prop="floorQty">
                <el-input
                  v-model="formData.floorQty"
                  type="number"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="檐口高度(m)" prop="height">
                <el-input
                  v-model="formData.height"
                  type="number"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>
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
        >确定
      </el-button>

      <el-button v-if="type == 'query'" @click="formVisible = false"
        >关闭</el-button
      >
    </template>
  </el-dialog>
</template>
