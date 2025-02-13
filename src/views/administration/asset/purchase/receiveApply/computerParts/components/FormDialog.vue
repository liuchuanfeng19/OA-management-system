<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { FormInstance, ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import {
  ComputerPartGet,
  CreateComputerPart,
  UpdateComputerPart
} from "@/api/computerPart";
import { ComputerGetListNV } from "@/api/computer";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();

const rules = {
  computerId: [{ required: true, message: "请选择设备", trigger: "change" }],

  partName: [{ required: true, message: "请输入配件名称", trigger: "blur" }],
  replaceTime: [
    { required: true, message: "请选择更换日期", trigger: "change" }
  ],
  adminStaffId: [
    { required: true, message: "请选择管理员", trigger: "change" }
  ],
  replaceReason: [
    { required: true, message: "请输入更换原因", trigger: "blur" }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  computerId: "",
  computerName: "",
  computerCode: "",
  partName: "",
  replaceReason: "",
  replaceTime: "",
  adminStaffId: "",
  adminStaffName: "",
  remark: ""
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法

const computerList = ref([]);
const showType = ref("add");
const formData = ref(null);
const formLoading = ref(false);
const formVisible = ref(false);
const activeName = ref("baseInfo");
const ruleFormRef = ref<FormInstance>();
const { staffListNV } = storeToRefs(userStaffStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "新增"
    : showType.value == "edit"
      ? "编辑"
      : showType.value == "read"
        ? "查看"
        : "";
});

//设备NV列表
async function getComputerList(id) {
  const { data } = await ComputerGetListNV({ id: id });
  computerList.value = data || [];
}

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  getStaffListNV();
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };

  if (_formData) {
    showType.value = _type;
    await getDetail(_formData.id);
    await getComputerList(formData.value.computerId);
  } else {
    showType.value = "add";
    getComputerList(null);
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await ComputerPartGet({ id });
  formData.value = data || {};

  formLoading.value = false;
}

//选择设备关联数据
function handleComputerChange(val) {
  const project = computerList.value.find(item => item.value == val);
  formData.value.computerCode = project.remark;
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "edit") {
        UpdateComputerPart(formData.value).then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        });
      } else if (showType.value == "add") {
        CreateComputerPart(formData.value).then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        });
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
  formVisible.value = false;
  resetForm(ruleFormRef.value);
  activeName.value = "baseInfo";
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="640"
    :class="showType == 'add' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      v-show="activeName == 'baseInfo'"
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="设备名称" prop="computerId">
            <el-select
              v-model="formData.computerId"
              filterable
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              :style="{ width: '100%' }"
              @change="handleComputerChange"
            >
              <el-option
                v-for="item in computerList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="设备编号" prop="computerCode">
            <el-input v-model="formData.computerCode" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="配件名称" prop="partName">
            <el-input
              v-model="formData.partName"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="更换原因" prop="replaceReason">
            <el-input
              v-model="formData.replaceReason"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="更换日期" prop="replaceTime">
            <el-date-picker
              v-model="formData.replaceTime"
              :placeholder="showType == 'read' ? '' : '请选择'"
              :disabled="showType == 'read'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="管理员" prop="adminStaffId">
            <el-select
              v-model="formData.adminStaffId"
              filterable
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              :style="{ width: '100%' }"
              ><el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="formVisible = false">
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
