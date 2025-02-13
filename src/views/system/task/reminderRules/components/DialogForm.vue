<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";

import {
  updateNoticeRule,
  getNoticeRule,
  createNoticeRule,
  getBNVList,
  getIntervalUnitType
} from "@/api/noticeRule";

// 表单模型
const INITIAL_DATA = {
  id: "",
  noticeRuleType: 1, //通知规则类别 1 审核类 2 系统提醒类
  businessCode: "", //业务名称代码
  businessName: "", //业务名称
  firstNoticeTime: 0, //首次提醒时间
  beforeExpirationUnit: "分", //到期前提醒时间单位
  beforeExpirationTime: 0, //到期前提醒时间
  firstNoticeUnit: "分", //首次提醒时间单位
  cycleNoticeTime: 1, //间隔提醒周期
  cycleNoticeUnit: "分", //间隔提醒周期单位
  isWebNotice: false, //web提醒方式
  isMessageNotice: false, //短信提醒方式
  isMailNotice: false, //邮件提醒方式
  isAppNotice: false, //APP提醒方式
  isEnable: true, //是否启用
  timeRange: undefined, //是否启用
  lastExecutionTime: "", //最后执行时间
  noticeStartTime: "", //通知开始时间
  noticeEndTime: "", //通知结束时间
  noticeContent: "", //提醒文案
  applicantNoticeContent: "", //结果反馈文案
  auditorNoticeContent: "", //审核时提醒文案
  remark: "" //备注
};
// const validateBeforeExpirationTime = (rule: any, value: any, callback: any) => {
//   if (!value && formData.value.noticeRuleType === 2) {
//     return callback(new Error("请输入到期前提醒时间"));
//   } else {
//     callback();
//   }
// };
// const validateFirstNoticeTime = (rule: any, value: any, callback: any) => {
//   if (!value && formData.value.noticeRuleType === 1) {
//     return callback(new Error("请输入首次提醒时间"));
//   } else {
//     callback();
//   }
// };

const validateApplicantNoticeContent = (
  rule: any,
  value: any,
  callback: any
) => {
  if (!value && formData.value.noticeRuleType === 2) {
    return callback(new Error("请输入系统类提醒文案"));
  } else {
    callback();
  }
};
const validateApplyNoticeContent = (rule: any, value: any, callback: any) => {
  if (!value && formData.value.noticeRuleType === 1) {
    return callback(new Error("请输入结果反馈文案"));
  } else {
    callback();
  }
};
const validateAuditorNoticeContent = (rule: any, value: any, callback: any) => {
  if (!value && formData.value.noticeRuleType === 1) {
    return callback(new Error("请输入审核时提醒文案"));
  } else {
    callback();
  }
};
// 表单校验规则
const fromRules = {
  businessCode: [
    { required: true, message: "请输入业务名称", trigger: "blur" }
  ],
  cycleNoticeTime: [
    { required: true, message: "请输入间隔提醒周期", trigger: "blur" }
  ],
  // beforeExpirationTime: [
  //   {
  //     trigger: "blur",
  //     validator: validateBeforeExpirationTime
  //   }
  // ],
  // firstNoticeTime: [
  //   {
  //     trigger: "blur",
  //     validator: validateFirstNoticeTime
  //   }
  // ],
  timeRange: [{ required: true, message: "请选择提醒时间段", trigger: "blur" }],
  noticeContent: [
    {
      trigger: "blur",
      validator: validateApplicantNoticeContent
    }
  ],
  applicantNoticeContent: [
    {
      trigger: "blur",
      validator: validateApplyNoticeContent
    }
  ],
  auditorNoticeContent: [
    {
      trigger: "blur",
      validator: validateAuditorNoticeContent
    }
  ]
};
//el-cascader props属性值
const selProps = {
  children: "children",
  label: "name",
  multiple: false,
  emitPath: false,
  value: "value",
  checkStrictly: false
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const loading = ref(false);
const showType = ref("add");
const cascaderRef = ref();
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const allBusinessType = ref([]); //业务名称
const allIntervalUnitType = ref([]); //间隔提醒单位

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加提醒规则"
    : showType.value == "edit"
      ? "编辑提醒规则"
      : showType.value == "query"
        ? "查看提醒规则"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  //加载所有请假类型;
  getBusinessTypeList();
  getIntervalUnitTypeList();
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    getDetail(_formData.id);
  }
};
defineExpose({ show });

// 根据Id获取费用报销详情
const getDetail = async id => {
  loading.value = true;
  const { data = {} } = await getNoticeRule({
    id
  });
  formData.value = data || {};
  formData.value.timeRange =
    formData.value.noticeStartTime && formData.value.noticeEndTime
      ? [formData.value.noticeStartTime, formData.value.noticeEndTime]
      : [];
  loading.value = false;
};

// 提交表单
const submitForm = _.debounce((formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      const { timeRange, ...params } = formData.value;
      params.noticeStartTime = timeRange[0];
      params.noticeEndTime = timeRange[1];
      if (showType.value == "add") {
        createNoticeRule(params)
          .then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              dialogVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          })
          .finally(() => {
            loading.value = false;
          });
      } else if (showType.value == "edit") {
        updateNoticeRule(params)
          .then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              dialogVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          })
          .finally(() => {
            loading.value = false;
          });
      }
    }
  });
}, 300);

// 获取业务名称列表
function getBusinessTypeList() {
  getBNVList()
    .then(({ data }) => {
      allBusinessType.value = data || [];
    })
    .catch(() => {
      allBusinessType.value = [];
    });
}

// 获取间隔提醒单位列表
function getIntervalUnitTypeList() {
  getIntervalUnitType()
    .then(({ data }) => {
      allIntervalUnitType.value = data || [];
    })
    .catch(() => {
      allIntervalUnitType.value = [];
    });
}

function handleBusinessCodeChange() {
  const cascaderNode = cascaderRef.value.getCheckedNodes();
  if (cascaderNode.length > 0) {
    formData.value.noticeRuleType = cascaderNode[0].parent.data.value;
  } else {
    formData.value.noticeRuleType = 1;
  }
  if (formData.value.noticeRuleType == 1) {
    //审核类提醒
    formData.value.beforeExpirationTime = 0;
    formData.value.beforeExpirationUnit = "分";
  } else if (formData.value.noticeRuleType == 2) {
    //系统类提醒
    formData.value.firstNoticeTime = 0;
    formData.value.firstNoticeUnit = "分";
  }
}

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
    :width="760"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="130px"
    >
      <el-row :gutter="40">
        <el-col :span="12" :offset="0">
          <el-form-item label="业务名称" prop="businessCode">
            <el-cascader
              ref="cascaderRef"
              v-model="formData.businessCode"
              :options="allBusinessType"
              clearable
              :disabled="showType == 'query'"
              filterable
              :show-all-levels="false"
              :props="selProps"
              @change="handleBusinessCodeChange"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.noticeRuleType == 1" :span="12" :offset="0">
          <el-form-item prop="firstNoticeTime">
            <template #label>
              <div class="flex items-center">
                <span> 首次提醒时间 </span>
                <el-popover
                  placement="top"
                  width="70"
                  effect="dark"
                  trigger="hover"
                  content="0:立刻执行"
                >
                  <template #reference
                    ><IconifyIconOffline icon="questionFilled"
                  /></template>
                </el-popover>
              </div>
            </template>
            <el-input
              v-model.trim="formData.firstNoticeTime"
              :style="{ width: '100%' }"
              :readonly="showType == 'query'"
              type="number"
              placeholder="请输入"
              @input="
                val => {
                  formData.firstNoticeTime = val ? Math.abs(parseInt(val)) : 0;
                }
              "
            >
              <template #append>
                <el-select
                  v-model="formData.firstNoticeUnit"
                  :style="{ width: '60px' }"
                  placeholder="请选择"
                  :disabled="showType == 'query'"
                >
                  <el-option
                    v-for="item in allIntervalUnitType"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col v-if="formData.noticeRuleType == 2" :span="12" :offset="0">
          <el-form-item prop="beforeExpirationTime">
            <template #label>
              <div class="flex items-center">
                <span> 到期前提醒时间 </span>
                <el-popover
                  placement="top"
                  width="70"
                  effect="dark"
                  trigger="hover"
                  content="0:立刻执行"
                >
                  <template #reference
                    ><IconifyIconOffline icon="questionFilled"
                  /></template>
                </el-popover>
              </div>
            </template>
            <el-input
              v-model.trim="formData.beforeExpirationTime"
              :style="{ width: '100%' }"
              :readonly="showType == 'query'"
              placeholder="请输入"
              type="number"
              @input="
                val => {
                  formData.beforeExpirationTime = val
                    ? Math.abs(parseInt(val))
                    : 0;
                }
              "
            >
              <template #append>
                <el-select
                  v-model="formData.beforeExpirationUnit"
                  :style="{ width: '60px' }"
                  placeholder="请选择"
                  :disabled="showType == 'query'"
                >
                  <el-option
                    v-for="item in allIntervalUnitType"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item prop="cycleNoticeTime">
            <template #label>
              <div class="flex items-center">
                <span> 间隔提醒周期 </span>
                <el-popover
                  placement="top"
                  width="170"
                  effect="dark"
                  trigger="hover"
                  content="未处理前的非首次提醒"
                >
                  <template #reference
                    ><IconifyIconOffline icon="questionFilled"
                  /></template>
                </el-popover>
              </div>
            </template>
            <el-input
              v-model="formData.cycleNoticeTime"
              :style="{ width: '100%' }"
              :readonly="showType == 'query'"
              placeholder="请输入"
            >
              <template #append>
                <el-select
                  v-model="formData.cycleNoticeUnit"
                  :style="{ width: '60px' }"
                  placeholder="请选择"
                  :disabled="showType == 'query'"
                >
                  <el-option
                    v-for="item in allIntervalUnitType"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="提醒时间段" prop="timeRange">
            <el-time-picker
              v-model="formData.timeRange"
              is-range
              format="HH:mm"
              value-format="HH:mm"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            />
          </el-form-item>
        </el-col>
        <el-col :offset="0" :span="12">
          <el-form-item label="是否启用">
            <el-radio
              v-model="formData.isEnable"
              :label="true"
              :disabled="showType == 'query'"
              >是</el-radio
            >
            <el-radio
              v-model="formData.isEnable"
              :label="false"
              :disabled="showType == 'query'"
              >否</el-radio
            >
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="提醒方式">
            <el-checkbox
              v-model="formData.isAppNotice"
              :disabled="showType == 'query'"
              >APP</el-checkbox
            >
            <el-checkbox
              v-model="formData.isWebNotice"
              :disabled="showType == 'query'"
              >网页</el-checkbox
            >
            <el-checkbox
              v-model="formData.isMessageNotice"
              :disabled="showType == 'query'"
              >短信</el-checkbox
            >
            <el-checkbox
              v-model="formData.isMailNotice"
              :disabled="showType == 'query'"
              >邮箱</el-checkbox
            >
          </el-form-item>
        </el-col>
        <el-col v-if="formData.noticeRuleType == 2" :offset="0" :span="24">
          <el-form-item label="系统类提醒文案" prop="noticeContent">
            <el-input
              v-model="formData.noticeContent"
              :rows="2"
              type="textarea"
              :placeholder="
                showType == 'add' || showType == 'edit' ? '' : '请输入'
              "
              :readonly="showType == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.noticeRuleType == 1" :offset="0" :span="24">
          <el-form-item prop="applicantNoticeContent">
            <template #label>
              <div class="flex items-center">
                <span> 结果反馈文案 </span>
                <el-popover
                  placement="top"
                  width="170"
                  effect="dark"
                  trigger="hover"
                  content="至申请人或填报人"
                >
                  <template #reference
                    ><IconifyIconOffline icon="questionFilled"
                  /></template>
                </el-popover>
              </div>
            </template>
            <el-input
              v-model="formData.applicantNoticeContent"
              :rows="2"
              type="textarea"
              :placeholder="
                showType == 'add' || showType == 'edit' ? '' : '请输入'
              "
              :readonly="showType == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.noticeRuleType == 1" :offset="0" :span="24">
          <el-form-item label="" prop="auditorNoticeContent">
            <template #label>
              <div class="flex items-center">
                <span> 审核提醒文案 </span>
                <el-popover
                  placement="top"
                  width="170"
                  effect="dark"
                  trigger="hover"
                  content="至审核人或处理人"
                >
                  <template #reference
                    ><IconifyIconOffline icon="questionFilled"
                  /></template>
                </el-popover>
              </div>
            </template>
            <el-input
              v-model="formData.auditorNoticeContent"
              :rows="2"
              type="textarea"
              :placeholder="
                showType == 'add' || showType == 'edit' ? '' : '请输入'
              "
              :readonly="showType == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col :offset="0" :span="24">
          <el-form-item label="备注">
            <el-input
              v-model="formData.remark"
              :rows="2"
              type="textarea"
              :placeholder="
                showType == 'add' || showType == 'edit' ? '' : '请输入'
              "
              :readonly="showType == 'query'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ showType == "query" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'query'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
