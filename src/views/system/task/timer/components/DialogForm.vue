<script setup lang="ts">
import { isUrl } from "@pureadmin/utils";
import { ref, watch, computed, toRef } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { isValidCronExpression } from "cron-expression-validator";

import CronForm from "./CronForm.vue";
import { createJob, updateJob } from "@/api/task";

defineOptions({
  name: "TimerForm"
});

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

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
const cronFormRef = ref();
const formVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = toRef(props, "data");

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return formData.value.jobId ? "编辑定时任务" : "添加定时任务";
});

// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => formVisible.value,
  val => {
    emit("update:visible", val);
  }
);
watch(
  () => props.visible,
  val => {
    formVisible.value = val;
  }
);
watch(
  () => props.data,
  val => {
    // if (val.jobId) {
    //   formData.value = val;
    // } else {
    //   formData.value = val;
    // }
    formData.value = val;
  }
);

// 表单校验规则;
const rules = {
  jobName: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
  jobGroup: [{ required: true, message: "请输入任务分组", trigger: "blur" }],
  apiUrl: [
    {
      message: "接口地址不合法",
      validator: (rule, value, callback) => {
        console.log("isUrl(value)", isUrl(value));
        if (value && !isUrl(value)) {
          callback(new Error("接口地址不合法"));
        } else {
          callback();
        }
      }
    }
  ],
  cronExpression: [
    {
      required: true,
      trigger: "blur",
      validator: (rule, value, callback) => {
        console.log("isValidCron(value)", isValidCronExpression(value));
        if (!value) {
          callback(new Error("请输入cron表达式"));
        } else if (!isValidCronExpression(value)) {
          callback(new Error("cron表达式不合法"));
        } else {
          callback();
        }
      }
    }
  ],
  overTime: [{ required: true, message: "请输入超时时间", trigger: "blur" }],
  retry: [{ required: true, message: "请输入失败重试次数", trigger: "blur" }]
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.jobId) {
        const { message, code } = await updateJob(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, code } = await createJob(formData.value);
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

function handleCron() {
  if (formData.value.isEdit) {
    cronFormRef.value.show(formData.value.cronExpression);
  }
}
function onCronResult(res) {
  formData.value.cronExpression = res;
  ruleFormRef.value.validateField("cronExpression", () => null);
}
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="660"
    draggable
    :before-close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-row :gutter="20"
        ><el-col :offset="0" :span="12">
          <el-form-item label="任务名称" prop="jobName">
            <el-input v-model.trim="formData.jobName" />
          </el-form-item>
        </el-col>
        <el-col :offset="0" :span="12">
          <el-form-item label="任务分组" prop="jobGroup">
            <el-input v-model.trim="formData.jobGroup" />
          </el-form-item>
        </el-col>
        <el-col :offset="0" :span="12">
          <el-form-item label="请求方式" prop="requestMethod">
            <el-select
              v-model="formData.requestMethod"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option key="1" label="GET" value="get" />
              <el-option key="2" label="POST" value="post" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :offset="0" :span="24">
          <el-form-item label="接口地址" prop="apiUrl">
            <el-input v-model.trim="formData.apiUrl" />
          </el-form-item>
        </el-col>
        <el-col :offset="0" :span="24">
          <el-form-item prop="cronExpression">
            <template #label>
              <div class="flex items-center">
                <span> cron表达式 </span>
                <el-popover
                  placement="top"
                  title="Cron表达式结构"
                  width="320"
                  effect="plain"
                  trigger="hover"
                  content="corn从左到右（用空格隔开）：秒 分 小时 月份中的日期 月份 星期中的日期 年份"
                >
                  <template #reference
                    ><IconifyIconOffline icon="questionFilled"
                  /></template>
                </el-popover>
              </div>
            </template>
            <el-input
              v-model="formData.cronExpression"
              placeholder="示例：0/2 * * * * ?"
            >
              <template #append>
                <!-- <el-button :icon="Timer" @click="handleCron"> -->
                <el-button @click="handleCron"> 生成表达式 </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :offset="0" :span="24">
          <el-form-item label="任务参数" prop="jobParams">
            <el-input v-model.trim="formData.jobParams" />
          </el-form-item>
        </el-col>
        <el-col :offset="0" :span="24">
          <el-form-item label="描述" prop="description">
            <el-input
              v-model.trim="formData.description"
              :autosize="{ minRows: 2, maxRows: 4 }"
              maxlength="150"
              show-word-limit
              type="textarea"
            />
          </el-form-item>
        </el-col>
        <el-col :offset="0" :span="12">
          <el-form-item label="超时时间（秒）" prop="overTime">
            <el-input-number
              v-model="formData.overTime"
              :min="30"
              placeholder=""
              :precision="0"
              :step="1"
            />
          </el-form-item>
        </el-col>
        <el-col :offset="0" :span="12">
          <el-form-item label="失败重试次数" prop="retry">
            <el-input-number
              v-model="formData.retry"
              :min="0"
              placeholder=""
              :precision="0"
              :step="1"
            />
          </el-form-item>
        </el-col>
        <el-col :offset="0" :span="12">
          <el-form-item label="是否启动" prop="isStart">
            <el-switch
              v-model="formData.isStart"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button
        v-if="formData.isEdit"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
    </template>
  </el-dialog>
  <CronForm ref="cronFormRef" @cronResult="onCronResult" />
</template>
