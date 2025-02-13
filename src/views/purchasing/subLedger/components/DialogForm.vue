<script setup lang="ts">
import { ref, computed } from "vue";
import { GetAccDetail } from "@/api/joinSignItem";
// import moment from "moment";
import type { FormInstance } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectFullName: "",
  materialName: "",
  materialSpec: "",
  materialUnit: "",
  materialQty: "",
  materialParams: "",
  subTotal: 0,
  remark: "",
  handStaffName: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
// const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);

const type = ref("add");

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    type.value = _type;

    await getDetail(_formData.id);
  }
};
defineExpose({ show });

// 表单校验规则;

const rules = {};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "query" ? "查看项目明细台账" : "";
});

// 重置表单
const resetForm = () => {
  ruleFormRef.value.resetFields();
};

//关闭对话框
const beforeClose = () => {
  resetForm();
  formVisible.value = false;
};

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetAccDetail({ id });
  formData.value = data || {};

  formLoading.value = false;
}

function reloadTimeRange() {}

//初始化时间段
reloadTimeRange();
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="620"
    draggable
    @close="beforeClose"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <div>
        <el-row :gutter="20">
          <el-col :span="24" :offset="0">
            <el-form-item label="项目名称" prop="projectFullName">
              <el-input v-model="formData.projectFullName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="设备名称" prop="materialName">
              <el-input v-model="formData.materialName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="型号" prop="materialSpec">
              <el-input v-model="formData.materialSpec" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="单位" prop="materialUnit">
              <el-input v-model="formData.materialUnit" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="数量" prop="materialQty">
              <el-input v-model="formData.materialQty" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="小计" prop="subTotal">
              <el-input v-model="formData.subTotal" readonly />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="合计" prop="deviceParams">
              <el-input v-model.trim="formData.deviceParams" readonly />
            </el-form-item>
          </el-col> -->
          <el-col :span="12" :offset="0">
            <el-form-item label="采购负责人" prop="handStaffName">
              <el-input v-model.trim="formData.handStaffName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同签订日期" prop="supplyContractTime">
              <el-input v-model.trim="formData.supplyContractTime" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="24" :offset="0">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model.trim="formData.remark"
                :rows="2"
                type="textarea"
                readonly
              />
            </el-form-item>
          </el-col>

          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="质保金到期日" prop="startTime">
              <el-input v-model.trim="formData.startTime" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="未付款到期日" prop="startTime">
              <el-date-picker
                :style="{ width: '100%' }"
                v-model="formData.startTime"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled="type == 'query'"
              />
            </el-form-item>
          </el-col> -->
        </el-row>
      </div>
    </el-form>
    <template #footer>
      <!-- 查看详情 -->
      <el-button v-if="type == 'query'" @click="beforeClose">关闭</el-button>
    </template>
  </el-dialog>
</template>
