<script setup lang="ts">
import _ from "lodash";
import { ElMessage, FormInstance } from "element-plus";
import { ref, computed } from "vue";
import { getFixData, updateAttendGroupFixData } from "@/api/attendance";
const emit = defineEmits(["updateClockCallBack"]);
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  fixCount: "",
  fixTime: "",
  fixType: []
};
const rules = {
  count: [{ required: true, message: "请选择可补卡次数", trigger: "change" }],
  lastDays: [
    { required: true, message: "请输入可补最近多少天的卡", trigger: "blur" }
  ]
};
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const formData = ref(null);
const requesting = ref(false);
const formVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "补卡规则设置";
});
const counts = ref([]);
const types = ref(["缺卡", "迟到", "早退", "正常"]);
// 子组件暴露给父组件调用的方法
const show = gid => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  formData.value.id = gid;
  counts.value = [];
  for (let i = 0; i < 30; i++) {
    counts.value.push(i + 1);
  }
  if (gid != null && gid != "") {
    getDetail();
  }
};
defineExpose({ show });
async function getDetail() {
  const { data } = await getFixData({ id: formData.value.id });
  console.log("data---->", data);
  formData.value.fixCount = data.fixCount;
  formData.value.fixTime = data.fixTime;
  formData.value.fixType = data.fixType;
}
// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      requesting.value = true;
      const param = {
        id: formData.value.id,
        fixCount: formData.value.fixCount,
        fixTime: formData.value.fixTime,
        fixType: formData.value.fixType != null ? formData.value.fixType : []
      };
      const { code, message } = await updateAttendGroupFixData(param);
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
        resetForm(formEl);
        emit("updateClockCallBack");
      }

      requesting.value = false;
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
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="450"
    draggable
    @close="closeDialog"
  >
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="90px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="补卡次数" prop="fixCount">
            <span>每月可提交</span>
            <el-select
              v-model="formData.fixCount"
              clearable
              style="width: 100px; margin: 0 10px"
              ><el-option
                v-for="item in counts"
                :key="item"
                :label="item"
                :value="item"
            /></el-select>
            <span>次补卡</span>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="补卡时间" prop="fixTime">
            <span>可申请过去</span>
            <el-input
              v-model="formData.fixTime"
              style="width: 100px; margin: 0 10px"
              placeholder="请输入"
              oninput="value=value.replace(/[^\d]/g,'')"
            />
            <span>天内的补卡</span>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="补卡类型" prop="fixType">
            <el-select
              v-model="formData.fixType"
              multiple
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in types"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="formVisible = false">取消</el-button>
      <el-button
        :loading="requesting"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >提交
      </el-button>
    </template>
  </el-dialog>
</template>
