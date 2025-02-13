<script setup lang="ts">
import _ from "lodash";
import { ElMessage, FormInstance, TabsPaneContext } from "element-plus";
import { ref, computed } from "vue";
import {
  getLeaveTypeNV,
  getStaffLeaveBalance,
  modifyDays
} from "@/api/attendance";
const emit = defineEmits(["search"]);
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  type: "+",
  day: "1",
  opinion: ""
};
const rules = {
  opinion: [{ required: true, message: "请输入修改理由", trigger: "blur" }]
};
const staffId = ref("");
const staffName = ref("");
const activeValue = ref("");
const activeName = ref("");
const tabData = ref([]);
const leftDay = ref(0);
const activities = ref([]);
const isEdit = ref(false);
const canEdit = ref(false);
const formData = ref(null);
const requesting = ref(false);
const formVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "假期余额设置";
});

// 子组件暴露给父组件调用的方法
const show = (typeId, staffIds, staffN) => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  activeValue.value = typeId;
  staffName.value = staffN;
  staffId.value = staffIds;
  getLevelNvData();
  getLeaveBalanceLogData();
};
defineExpose({ show });

function getName() {
  console.log("222");
  tabData.value.forEach(item => {
    if (item.value == activeValue.value) {
      activeName.value = item.name;
    }
  });
}

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log("tab.props.name--->", tab);
  console.log("event--->", event);
  activeValue.value = tab.props.name.toString();
  isEdit.value = false;
  getLeaveBalanceLogData();
  getName();
};

async function getLevelNvData() {
  const { data } = await getLeaveTypeNV();
  tabData.value = data || [];
  getName();
}

async function getLeaveBalanceLogData() {
  const param = {
    leaveTypeId: activeValue.value,
    staffId: staffId.value
  };
  const { data } = await getStaffLeaveBalance(param);
  console.log(data);
  formData.value.id = data.id;
  leftDay.value = data.leftValue;
  if (!data.isLimit) {
    leftDay.value = -1;
  }
  activities.value = data.logItems || [];
  canEdit.value = data.canEditBal == null ? false : data.canEditBal;
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      requesting.value = true;
      const param = {
        id: formData.value.id,
        deltaValue: formData.value.type + formData.value.day,
        remark: formData.value.opinion
      };
      const { code, message } = await modifyDays(param);
      if (code == 0) {
        ElMessage.success(message);
        isEdit.value = false;
        resetForm(formEl);
        emit("search");
        getLeaveBalanceLogData();
        requesting.value = false;
      } else {
        requesting.value = false;
      }
      // requesting.value = false;
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
    :width="810"
    draggable
    @close="closeDialog"
  >
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-tabs v-model="activeValue" @tab-click="handleClick">
            <el-tab-pane
              v-for="item in tabData"
              :key="item.value"
              :label="item.name"
              :name="item.value"
            />
          </el-tabs>
        </el-col>
        <el-col :span="24" :offset="0">
          <div style="margin: 10px 0">
            <span style="font-size: 14px">当前 {{ activeName }} 余额：</span>
            <span v-if="leftDay == -1" style="font-size: 16px">无限制</span>
            <span v-else style="font-size: 16px">{{ leftDay }}天</span>
            <el-button
              v-show="canEdit"
              style="margin-left: 50px"
              @click="isEdit = true"
              >修改余额</el-button
            >
          </div>
        </el-col>
        <el-col v-show="isEdit" :span="12" :offset="0">
          <el-form-item label="修改天数：">
            <el-select v-model="formData.type" style="width: 100px">
              <el-option label="增加" value="+" />
              <el-option label="减少" value="-" />
            </el-select>
            <el-input
              v-model="formData.day"
              style="width: 100px; margin: 0 10px"
              oninput="value=value.replace(/[^\d.]/g,'')"
            />
            <span>天</span>
          </el-form-item>
        </el-col>
        <el-col v-show="isEdit" :span="12" :offset="0">
          <el-form-item label="修改理由：" prop="opinion">
            <el-input v-model="formData.opinion" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0" style="margin-top: 20px">
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="activity.createTime"
              placement="top"
            >
              <el-card>
                <div v-if="activity.deltaValue < 0">
                  <span style="font-size: 14px"
                    >{{ activity.deltaValue }}天</span
                  >
                </div>
                <div v-else>
                  <span style="font-size: 14px"
                    >{{ activity.deltaValue }}天</span
                  >
                  <span style="font-size: 12px; margin-left: 20px; color: #999"
                    >{{ activity.availRemark }}有效</span
                  >
                </div>
                <div style="font-size: 14px; margin-top: 20px">
                  {{ activity.busiRemark }}
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button v-show="isEdit" @click="formVisible = false">取消</el-button>
      <el-button
        v-show="isEdit"
        :loading="requesting"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >提交
      </el-button>
    </template>
  </el-dialog>
</template>
