<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { updateFieldMapping } from "@/api/sellContractItemAttach";
import { ElMessage, type FormInstance } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  materialName: "", //物资名称
  materialSpec: "", //规格型号
  materialUnit: "", //单位
  materialQty: "", //数量
  materialPrice: "", //单价
  materialParams: "" //参数要求
};

// 表单校验规则
const fromRules = {
  materialName: [
    { required: true, message: "请选择物资名称", trigger: "change" }
  ],
  materialSpec: [
    { required: true, message: "请选择规格型号", trigger: "change" }
  ],
  materialUnit: [{ required: true, message: "请选择单位", trigger: "change" }],
  materialQty: [{ required: true, message: "请选择数量", trigger: "change" }],
  materialPrice: [{ required: true, message: "请选择单价", trigger: "change" }],
  materialParams: [
    { required: true, message: "请选择参数要求", trigger: "change" }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const dialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const showType = ref("add");
const options = ref([
  // { name: "设备名称", value: 0, bindName: "" },
  // { name: "规格", value: 1, bindName: "" }
]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加示例"
    : showType.value == "edit"
      ? "编辑示例"
      : showType.value == "read"
        ? "查看示例"
        : showType.value == "bind"
          ? "绑定物资合同清单"
          : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    formData.value.id = _formData.id;
    if (_formData.isWzhtqdMapping) {
      try {
        const fieldMapping = JSON.parse(_formData.fieldMappingJson);
        Object.keys(formData.value).forEach(element1 => {
          Object.keys(fieldMapping).forEach(element2 => {
            if (element1 == fieldMapping[element2]) {
              formData.value[element1] = element2;
            }
          });
        });
      } catch (error) {
        console.log(error);
      }
    }

    try {
      const tableData = JSON.parse(_formData.itemsJson);
      const column = tableData[0];
      if (column) {
        const columnKeys = Object.keys(column);
        options.value = columnKeys
          .filter(item => item != "__行数__")
          .map((item, index) => {
            return { name: item, value: index, bindName: "" };
          });
        if (_formData.isWzhtqdMapping) {
          Object.keys(formData.value).forEach(element => {
            if (element != "id") {
              handleChange(formData.value[element], element);
            }
          });
        }
      }
    } catch (error) {
      options.value = [];
    } finally {
      console.log("options", options.value);
    }
  }
};
defineExpose({ show });

function handleChange(val, bindName) {
  const option1 = options.value.find(item => item.bindName == bindName);
  if (option1) {
    option1.bindName = "";
  }
  if (val) {
    const option2 = options.value.find(item => item.name == val);
    option2.bindName = bindName;
  }
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "bind") {
        const binds = options.value.filter(item => item.bindName != "");
        const obj = {};
        binds.forEach(item => {
          obj[item.name] = item.bindName;
        });
        const { code, message } = await updateFieldMapping({
          id: formData.value.id,
          fieldMappingJson: JSON.stringify(obj)
        });
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      }
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
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="632"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="96px"
    >
      <el-row :gutter="40">
        <el-col :span="12" :offset="0">
          <el-form-item label="物资名称" prop="materialName">
            <el-select
              v-model="formData.materialName"
              placeholder="请选择"
              clearable
              filterable
              @change="handleChange($event, 'materialName')"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.name"
                :value="item.name"
                :disabled="item.bindName != ''"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="规格型号" prop="materialSpec">
            <el-select
              v-model="formData.materialSpec"
              placeholder="请选择"
              clearable
              filterable
              @change="handleChange($event, 'materialSpec')"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.name"
                :value="item.name"
                :disabled="item.bindName != ''"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="单位" prop="materialUnit">
            <el-select
              v-model="formData.materialUnit"
              placeholder="请选择"
              clearable
              filterable
              @change="handleChange($event, 'materialUnit')"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.name"
                :value="item.name"
                :disabled="item.bindName != ''"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="数量" prop="materialQty">
            <el-select
              v-model="formData.materialQty"
              placeholder="请选择"
              clearable
              filterable
              @change="handleChange($event, 'materialQty')"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.name"
                :value="item.name"
                :disabled="item.bindName != ''"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="单价" prop="materialPrice">
            <el-select
              v-model="formData.materialPrice"
              placeholder="请选择"
              clearable
              filterable
              @change="handleChange($event, 'materialPrice')"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.name"
                :value="item.name"
                :disabled="item.bindName != ''"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="参数要求" prop="materialParams">
            <el-select
              v-model="formData.materialParams"
              placeholder="请选择"
              clearable
              filterable
              @change="handleChange($event, 'materialParams')"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.name"
                :value="item.name"
                :disabled="item.bindName != ''"
              />
            </el-select>
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
