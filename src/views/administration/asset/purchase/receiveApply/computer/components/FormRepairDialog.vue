<script setup lang="ts">
import { ref, computed } from "vue";
import { getProjCredit } from "@/api/projRegister";
import dayjs from "dayjs";
import type { FormInstance } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  companyName: "",

  applyTime: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
// const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const type = ref("add");

function formatDatetime(dt) {
  return dayjs(dt).format("YYYY-MM-DD HH:mm");
}

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

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "repair" ? "维修/更换明细" : "";
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
  const { data } = await getProjCredit({ id });
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
    :width="920"
    draggable
    @close="beforeClose"
  >
    <!-- 表单内容 -->
    <el-form ref="ruleFormRef" label-width="100px">
      <el-card shadow="never" :body-style="{ padding: '0px', border: 'none' }">
        <el-table
          highlight-current-row
          :data="formData.reviewers"
          border
          stripe
          height="400"
        >
          <el-table-column
            label="序号"
            type="index"
            width="60"
            fixed="left"
            align="center"
          />

          <el-table-column
            fixed="left"
            label="配件名称"
            :min-width="180"
            show-overflow-tooltip
            prop="deptName"
          />
          <el-table-column
            label="更换原因"
            :min-width="180"
            show-overflow-tooltip
            prop="deptName"
          />
          <el-table-column
            label="更换时间"
            :min-width="100"
            show-overflow-tooltip
            align="center"
            prop="applyTime"
          >
            <template #default="{ row }">
              {{ formatDatetime(row.applyTime) }}
            </template>
          </el-table-column>

          <el-table-column
            label="管理员"
            :min-width="100"
            show-overflow-tooltip
            prop="deptName"
          />
          <el-table-column
            label="备注"
            :min-width="150"
            show-overflow-tooltip
            prop="deptName"
          />

          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
      </el-card>
    </el-form>

    <template #footer>
      <!-- 查看详情 -->
      <el-button v-if="type == 'repair'" @click="beforeClose">关闭</el-button>
    </template>
  </el-dialog>
</template>
