<script setup lang="ts">
import _ from "lodash";
// import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { useGlobal } from "@pureadmin/utils";
import type { FormInstance } from "element-plus";

import {
  getProjectBid,
  createProjectBid,
  updateProjectBid
} from "@/api/projectBid";
import { getUserListByRoleCodeNew } from "@/api/user";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();
const { $config } = useGlobal<GlobalPropertiesApi>();
const roleCodeStaffListMap = {
  bidReviewStaffList: $config.RoleCodeGeneralManager,
  busiStaffList: $config.RoleCodeBusinessAssistant,
  bidBuyStaffList: $config.PurchasingPurchasingSpecialist
};
const PROJECT_ITEM = {
  reBidCompanyId: "", //投标单位Id
  bidCompanyName: "", //投标单位
  bidPackage: "", //投标包件
  bidAmount: 0.0, //投标金额（元）
  bidBusiStaffId: "", //商务人员Id
  bidBusiStaffName: "", //商务人员
  bidTechStaffId: "", //技术人员Id
  bidTechStaffName: "", //技术人员
  bidBuyStaffId: "", //采购人员Id
  bidBuyStaffName: "", //采购人员
  bidReviewStaffId: "", //终审人员Id
  bidReviewStaffName: "", //终审人员
  bidCompanyComment: "" //备注
};
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  biddingId: "", //项目Id
  fullName: "", //项目名称
  projectShortName: "", //项目简称
  openTime: "", //开标时间
  openAddress: "", //开标地点
  projectItemList: [
    {
      ...PROJECT_ITEM
    }
  ]
};

// 表单校验规则
const fromRules = {
  fullName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  openTime: [{ required: true, message: "请选择开标时间", trigger: "change" }],
  openAddress: [{ required: true, message: "请输入开标地点", trigger: "blur" }],
  projectItemList: [
    { required: true, message: "请添加投标单位", trigger: "blur" }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const props = defineProps({
  projectList: [],
  bidCompanyList: []
});
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const staffList = ref({
  bidReviewStaffList: [],
  busiStaffList: [],
  bidBuyStaffList: []
});
const showType = ref("add");
const dialogVisible = ref(false);
const requestLoading = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
// const { staffListNV } = storeToRefs(userStaffStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加投标项目信息表"
    : showType.value == "edit"
      ? "编辑投标项目信息表"
      : showType.value == "read"
        ? "查看投标项目信息表"
        : "";
});
const canSure = computed(() => {
  const emptyRow = formData.value.projectItemList.findIndex(
    item => item.reBidCompanyId == ""
  );
  return emptyRow;
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  Object.keys(roleCodeStaffListMap).forEach(item => {
    getStaffListByDeptId(roleCodeStaffListMap[item], item);
  });
  getStaffListNV();
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  formData.value.projectItemList = [
    {
      ...PROJECT_ITEM
    }
  ];
  if (_formData) {
    getDetail(_formData.id);
  }
};
defineExpose({ show });

// 根据Id获取投标项目信息表详情
const getDetail = async id => {
  const { data = {} } = await getProjectBid({
    id
  });
  formData.value = data || {};
};

// 根据部门Id获取员工列表
const getStaffListByDeptId = async (roleCode, staffType) => {
  const { data = {} } = await getUserListByRoleCodeNew({
    roleCode
  });
  staffList.value[staffType] = data || [];
};

function handleBidCompanyChange(val, row) {
  const bidCompany = props.bidCompanyList.find(item => item.value == val);
  const ids = new Set(
    formData.value.projectItemList.map(item => item.reBidCompanyId)
  );
  if (ids.size != formData.value.projectItemList.length) {
    ElMessage.error(bidCompany.name + " 已被添加");
    row.reBidCompanyId = "";
    return;
  }
  row.bidCompanyName = bidCompany.name;
}

function handleAdd() {
  formData.value.projectItemList.push({ ...PROJECT_ITEM });
}

function handleDelete(index) {
  formData.value.projectItemList.splice(index, 1);
}

// function handleBusiChange(val, row) {
//   const staff = staffList.value.busiStaffList.find(item => item.staffId == val);
//   row.bidBusiStaffName = staff.staffName;
// }

// function handleTechChange(val, row) {
//   const staff = staffListNV.value.find(item => item.value == val);
//   row.bidTechStaffName = staff.name;
// }

// function handleBuyChange(val, row) {
//   const staff = staffList.value.bidBuyStaffList.find(
//     item => item.staffId == val
//   );
//   row.bidBuyStaffName = staff.staffName;
// }

// function handleReviewChange(val, row) {
//   const staff = staffList.value.bidReviewStaffList.find(
//     item => item.staffId == val
//   );
//   row.bidReviewStaffName = staff.staffName;
// }

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  requestLoading.value = true;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "add") {
        createProjectBid(formData.value)
          .then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              dialogVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          })
          .finally(() => {
            requestLoading.value = false;
          });
      } else if (showType.value == "edit") {
        updateProjectBid(formData.value)
          .then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              dialogVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          })
          .finally(() => {
            requestLoading.value = false;
          });
      }
    } else {
      requestLoading.value = false;
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
    :width="1080"
    draggable
    @close="closeDialog"
  >
    <el-alert
      v-if="showType == 'add'"
      show-icon
      title="提示：仅添加外部项目投标信息表"
      type="info"
      :closable="false"
    />
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      label-width="78px"
      :class="{
        'mt-4': showType == 'add'
      }"
      :rules="fromRules"
    >
      <el-row :gutter="20">
        <el-col :span="8" :offset="0">
          <el-form-item label="项目名称" prop="fullName">
            <el-input
              v-model="formData.fullName"
              :placeholder="showType != 'add' ? '' : '请输入'"
              :readonly="showType != 'add'"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="开标时间" prop="openTime">
            <el-date-picker
              v-model="formData.openTime"
              :readonly="showType == 'read'"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              type="datetime"
              style="width: 100%"
              :placeholder="showType == 'read' ? '' : '请选择'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="开标地点" prop="openAddress">
            <el-input
              v-model="formData.openAddress"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-card shadow="never" :body-style="{ padding: '0px', border: 'none' }">
      <template #header>
        <div class="flex justify-between items-center">
          <span>标书制作人员</span>
          <el-button
            v-if="showType != 'read'"
            type="primary"
            plain
            @click="handleAdd"
          >
            添加
          </el-button>
        </div>
      </template>
      <el-table
        highlight-current-row
        :data="formData.projectItemList"
        border
        stripe
        max-height="400"
      >
        <el-table-column
          label="序号"
          type="index"
          width="60"
          fixed="left"
          align="center"
        />
        <el-table-column label="投标单位" :width="150">
          <template #default="{ row }">
            <el-select
              v-model="row.reBidCompanyId"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              clearable
              no-match-text="搜索"
              filterable
              style="width: 100%"
              @change="handleBidCompanyChange($event, row)"
            >
              <el-option
                v-for="item in props.bidCompanyList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
                :disabled="item.remark == 0"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="投标包件" :width="150">
          <template #default="{ row }">
            <el-input
              v-model="row.bidPackage"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </template>
        </el-table-column>
        <el-table-column label="投标金额（元）" :width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.bidAmount"
              :readonly="showType == 'read'"
              :controls="false"
              :min="0"
              value-on-clear="min"
            />
          </template>
        </el-table-column>
        <el-table-column label="商务人员" :width="150">
          <template #default="{ row }">
            <el-input
              v-model="row.bidBusiStaffName"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
            <!-- <el-select
              v-model="row.bidBusiStaffId"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
              filterable
              @change="handleBusiChange($event, row)"
              clearable
            >
              <el-option
                v-for="item in staffList.busiStaffList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select> -->
          </template>
        </el-table-column>
        <el-table-column label="技术人员" :width="150">
          <template #default="{ row }">
            <el-input
              v-model="row.bidTechStaffName"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
            <!-- <el-select
              v-model="row.bidTechStaffId"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
              filterable
              @change="handleTechChange($event, row)"
              clearable
            >
              <el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select> -->
          </template>
        </el-table-column>
        <el-table-column label="采购人员" :width="150">
          <template #default="{ row }">
            <el-input
              v-model="row.bidBuyStaffName"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
            <!-- <el-select
              v-model="row.bidBuyStaffId"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
              filterable
              @change="handleBuyChange($event, row)"
              clearable
            >
              <el-option
                v-for="item in staffList.bidBuyStaffList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select> -->
          </template>
        </el-table-column>
        <el-table-column label="终审人员" :width="150">
          <template #default="{ row }">
            <el-input
              v-model="row.bidReviewStaffName"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
            <!-- <el-select
              v-model="row.bidReviewStaffId"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
              filterable
              @change="handleReviewChange($event, row)"
              clearable
            >
              <el-option
                v-for="item in staffList.bidReviewStaffList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select> -->
          </template>
        </el-table-column>
        <el-table-column label="备注" :width="150">
          <template #default="{ row }">
            <el-input
              v-model="row.bidCompanyComment"
              :readonly="showType == 'read'"
              type="textarea"
              rows="1"
              :maxlength="255"
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </template>
        </el-table-column>
        <el-table-column
          v-if="showType != 'read'"
          label="操作"
          width="100"
          fixed="right"
          align="center"
        >
          <template #default="{ $index }">
            <el-button type="text" @click="handleDelete($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <template #footer>
      <el-button @click="dialogVisible = false">{{
        showType != "read" ? "取消" : "关闭"
      }}</el-button>
      <el-button
        v-if="showType != 'read'"
        :disabled="canSure != -1"
        :loading="requestLoading"
        :title="
          canSure != -1
            ? '标书制作人员第' + (canSure + 1) + '行投标单位未选择'
            : ''
        "
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
:deep(.el-card__header) {
  padding: 10px;
}
</style>
