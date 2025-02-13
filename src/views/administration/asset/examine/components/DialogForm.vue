<script setup lang="ts">
import { ref, computed } from "vue";
import { FormInstance } from "element-plus";

import { GetAssetsFlow } from "@/api/asset";
import { useNav } from "@/layout/hooks/useNav";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  staffName: "",
  assetsId: "",
  assetsCode: "",
  assetsName: "",
  userTime: "",
  returnTime: "",
  applyTime: "",
  myAssetsId: "",
  assetsStatus: 1,
  assetsStatusExpr: "",
  catId: "",
  catName: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
// const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const ApproverData = ref([]); //审批人员
const { staffName } = useNav(); //用户名
const type = ref("add");
const stauts = ref("");

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (_formData) {
    type.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    // fileList.value = [];
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
    formData.value.staffName = staffName;
  }
  formVisible.value = true;
};
defineExpose({ show });

// 表单校验规则;
const rules = {
  leaveType: [{ required: true, message: "请选择请假类型", trigger: "change" }],

  applyReason: [
    { required: true, message: "请输入申请事由", trigger: "change" }
  ]
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
  return type.value == "query" ? "流转详情" : "";
});

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  ApproverData.value = [];
  // timeRange.value = [];
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
  // reloadTimeRange();
};

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetAssetsFlow({ id });
  formData.value = data || {};
  if (data) {
    // timeRange.value = [data.startTime, data.endTime];
    ApproverData.value = data.reviewers;
  }
  // getindex();
  formLoading.value = false;
}

// function reloadTimeRange() {
//   timeRange.value = [];
// }

// const form = reactive({
//   startTime: "",
//   endTime: ""
// });

//初始化时间段
// reloadTimeRange();
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="590"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="85px"
    >
      <div>
        <el-row :gutter="20">
          <el-col :span="12" :offset="0">
            <el-form-item label="资产名称" prop="assetsName">
              <el-input v-model="formData.assetsName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="资产编号" prop="assetsCode">
              <el-input v-model="formData.assetsCode" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="使用人姓名" prop="staffName">
              <el-input v-model="formData.staffName" readonly />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="归还时间" prop="returnTime">
              <el-input v-model="formData.returnTime" readonly disabled />
            </el-form-item>
          </el-col> -->
          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="申请数量" prop="leaveType">
              <el-input v-model="formData.leaveType" disabled />
            </el-form-item>
          </el-col> -->
          <el-col :span="12" :offset="0">
            <el-form-item label="申请时间" prop="applyTime">
              <el-date-picker
                v-model="formData.applyTime"
                readonly
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="使用时间" prop="userTime">
              <el-date-picker
                v-model="formData.userTime"
                readonly
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="归还时间" prop="returnTime">
              <el-date-picker
                v-model="formData.returnTime"
                readonly
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="创建时间" prop="startTime">
              <el-date-picker
                disabled
                v-model="formData.startTime"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col> -->
          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="备注" prop="leaveType">
              <el-input v-model="formData.leaveType" disabled />
            </el-form-item>
          </el-col> -->
        </el-row>
      </div>
    </el-form>
    <template #footer>
      <!-- <el-button
        v-if="type == 'pass' || type == 'reject'"
        type="primary"
        @click="submitFormApproval(ruleFormRef, true, false)"
        >同意
      </el-button>
      <el-button
        v-if="type == 'pass' || type == 'reject'"
        @click="submitFormApproval(ruleFormRef, false, true)"
        >驳回</el-button
      > -->
      <el-button @click="formVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
