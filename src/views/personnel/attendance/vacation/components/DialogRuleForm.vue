<script setup lang="ts">
import _ from "lodash";
import { ElMessage, FormInstance } from "element-plus";
import { ref, computed } from "vue";
import { createLeaveType, updateLeaveType } from "@/api/attendance";
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);
// 表单模型
const INITIAL_DATA = {
  name: "",
  unit: 2,
  calculate: 1,
  ruleFlag: false,
  balWay: 1,
  balTime: 1,
  balRule: 1,
  balDayQty: 5,
  deadTimeType: 1,
  deadTimeFlag: false,
  retainQty: 1,
  retainType: 2,
  fitComment: "全公司",
  sortOrder: 1
};
const rules = {
  name: [{ required: true, message: "请输入假期名称", trigger: "blur" }]
};
const type = ref("add");
const formData = ref(null);
const requesting = ref(false);
const formVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "假期规则";
});

// 子组件暴露给父组件调用的方法
const show = (_type, data) => {
  type.value = _type;
  formVisible.value = true;
  if (_type == "add") {
    formData.value = { ...INITIAL_DATA };
  } else {
    console.log(data);
    formData.value = Object.assign({}, data);
  }
};
defineExpose({ show });
function handleBalRuleChange(val) {
  formData.value.deadTimeType = val;
}
// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      requesting.value = true;
      if (type.value == "edit") {
        const { code, message } = await updateLeaveType(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { code, message } = await createLeaveType(formData.value);

        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
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
    :width="540"
    draggable
    @close="closeDialog"
  >
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      :disabled="type == 'read'"
      label-width="125px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="假期名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="请假单位" prop="unit">
            <el-select v-model="formData.unit" style="width: 100%">
              <el-option label="按天请假" :value="1" />
              <el-option label="按半天请假" :value="2" />
              <!-- <el-option label="按小时请假" :value="3" /> -->
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="计算方式" prop="calculate">
            <el-select v-model="formData.calculate" style="width: 100%">
              <el-option label="按自然日" :value="1" />
              <el-option label="按工作日" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="设置员工假期余额">
            <el-switch v-model="formData.ruleFlag" />
          </el-form-item>
        </el-col>
        <div v-show="formData.ruleFlag" style="width: 100%">
          <el-col :span="24" :offset="0">
            <el-form-item label="余额发放方式">
              <el-select
                v-model="formData.balWay"
                style="width: 100%"
                @change="handleBalRuleChange"
              >
                <el-option label="每年自动发放一次" :value="1" />
                <el-option label="每月自动发放一次" :value="2" />
                <el-option label="手动发放" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-show="formData.balWay != 3" :span="24" :offset="0">
            <el-form-item label="发放日期">
              <el-select
                v-show="formData.balWay == 1"
                v-model="formData.balTime"
                style="width: 100%"
              >
                <el-option label="每年员工入职日" :value="1" />
                <el-option label="每年1月1日" :value="2" />
              </el-select>
              <div v-show="formData.balWay == 2">
                <span>每月</span>
                <el-input
                  v-model="formData.balTime"
                  style="width: 50px; margin: 0 10px"
                  oninput="value=value.replace(/[^\d]/g,'')"
                />
                <span>日</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col v-show="formData.balWay != 3" :span="24" :offset="0">
            <el-form-item label="额度配置规则">
              <el-select v-model="formData.balRule" style="width: 100%">
                <el-option label="固定额度" :value="1" />
                <el-option label="按社会工龄(参加工作年限)" :value="2" />
                <el-option label="按司龄(本公司在职年限)" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-show="formData.balWay != 3" :span="24" :offset="0">
            <el-form-item label="额度">
              <div>
                <span>每人每年发放</span>
                <el-input
                  v-model="formData.balDayQty"
                  style="width: 50px; margin: 0 10px"
                  oninput="value=value.replace(/[^\d]/g,'')"
                />
                <span>天</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-form-item label="有效期">
              <div class="valid">
                <span v-show="formData.balWay != 3">{{
                  formData.balWay == 1 ? "自发放日起一年" : "自发放日起一个月"
                }}</span>
                <el-select
                  v-show="formData.balWay == 3"
                  v-model="formData.deadTimeType"
                  style="width: 100%"
                >
                  <el-option label="按入职日期起12个月" :value="3" />
                  <el-option label="按自然年1月1日到12月31日" :value="4" />
                </el-select>
                <el-checkbox
                  v-model="formData.deadTimeFlag"
                  label="允许延长有效期"
                />
                <div v-show="formData.deadTimeFlag">
                  <span>超过有效期后，余额保留</span>
                  <el-input
                    v-model="formData.retainQty"
                    style="width: 50px; margin: 0 10px"
                    oninput="value=value.replace(/[^\d]/g,'')"
                  />
                  <el-select v-model="formData.retainType" style="width: 60px">
                    <el-option label="天" :value="1" />
                    <el-option label="月" :value="2" />
                  </el-select>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </div>
        <el-col :span="12" :offset="0">
          <el-form-item label="显示顺序">
            <el-input-number
              v-model="formData.sortOrder"
              :min="1"
              :max="999"
              style="width: 100%"
              :step="1"
              :controls="true"
            />
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

<style scoped lang="scss">
.valid {
  display: flex;
  flex-direction: column;
}
</style>
