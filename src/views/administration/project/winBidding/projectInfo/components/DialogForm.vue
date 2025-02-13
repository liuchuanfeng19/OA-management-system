<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { useGlobal } from "@pureadmin/utils";
import { ElMessage, type FormInstance } from "element-plus";

// import { getBidCompanyNVList } from "@/api/bidCompany";
import {
  getProjectWinBid,
  createProjectWinBid,
  updateProjectWinBid,
  GetProgressStatusNV
} from "@/api/projectWinBid";
import { getUserListByRoleCodeNew } from "@/api/user";

const { $config } = useGlobal<GlobalPropertiesApi>();
const roleCodeStaffListMap = {
  projStaffList: $config.RoleCodeProjectManager,
  techStaffList: $config.RoleCodeTechnicalManager,
  dutyStaffList: $config.RoleCodeProjectManager,
  busiStaffList: $config.RoleCodeBusinessAssistant
};
const PROJECT_ITEM = {
  id: undefined, //
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
  biddingId: "", //项目招标I
  isFromBidding: true, //中标项目是否来自于招投标
  code: "", //项目编号（项目主数据字段）
  fullName: "", //项目名称
  shortName: "", //项目立项简称
  dutyStaffId: "", //项目经理/负责人Id
  dutyStaffName: "", //项目经理/负责人
  busiStaffId: "", //商务负责人Id
  busiStaffName: "", //商务负责人
  bidStatus: 0, //投标状态（项目主数据字段）
  bidCompanyId: "", //中标公司ID/投标公司ID
  winBidCompanyName: "", //中标单位
  projStaffId: "", //投标文件项目经理Id
  projStaffName: "", //投标文件项目经理
  techStaffId: "", //投标文件技术负责人Id
  techStaffName: "", //投标文件技术负责人
  date: undefined, //开竣工日期
  startTime: "", //开工日期
  endTime: "", //竣工日期
  winBidComment: "", //中标项目信息表描述
  progressStatus: 1, //项目进度
  isWinBidOnly: true, //是否是在中标项目信息表中创建
  openTime: "", //开标时间
  openAddress: "", //开标地点
  projectItemList: [
    {
      ...PROJECT_ITEM
    }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const props = defineProps({
  bidCompanyList: []
});
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const staffList = ref({
  projStaffList: [],
  techStaffList: [],
  dutyStaffList: [],
  busiStaffList: []
});
const formData = ref(JSON.parse(JSON.stringify(INITIAL_DATA)));
const showType = ref("add");
// const bidCompanyList = ref([]);
const progressStatusList = ref([]);
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
// 表单校验规则
const fromRules = ref({
  fullName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  openTime: [{ required: true, message: "请选择开标时间", trigger: "change" }],
  openAddress: [{ required: true, message: "请输入开标地点", trigger: "blur" }],
  // projStaffId: [
  //   { required: true, message: "请选择投标文件项目经理", trigger: "blur" }
  // ],
  // dutyStaffId: [
  //   { required: true, message: "请选择项目经理/负责人", trigger: "blur" }
  // ],
  // busiStaffId: [
  //   { required: true, message: "请选择商务负责人", trigger: "blur" }
  // ],
  // techStaffId: [
  //   { required: true, message: "请选择投标文件技术负责人", trigger: "blur" }
  // ],
  winBidCompanyName: [
    {
      required: true,
      message: "请输入中标单位",
      trigger: "blur"
    }
  ],
  shortName: [
    { required: true, message: "请输入项目立项简称", trigger: "blur" }
  ],
  progressStatus: [
    { required: true, message: "请选择项目进度", trigger: "change" }
  ]
});

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加中标项目信息表"
    : showType.value == "edit"
      ? "编辑中标项目信息表"
      : showType.value == "read"
        ? "查看中标项目信息表"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  BuildsLeaseStatus();
  Object.keys(roleCodeStaffListMap).forEach(item => {
    getStaffListByDeptId(roleCodeStaffListMap[item], item);
  });
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = JSON.parse(JSON.stringify(INITIAL_DATA));
  if (showType.value == "add") {
    formData.value.isWinBidOnly = true;
  }
  if (_formData) {
    getDetail(_formData.id);
    // formData.value = { ..._formData };
    // getBidCompanyList();
  }
};
defineExpose({ show });

// 根据Id获取投标项目信息表详情
const getDetail = async id => {
  const { data = {} } = await getProjectWinBid({
    id
  });
  formData.value = data || {};
  formData.value.openTime =
    formData.value.openTime == "0001-01-01 00:00:00"
      ? ""
      : formData.value.openTime;
  formData.value.date =
    formData.value.startTime != null && formData.value.endTime != null
      ? [formData.value.startTime, formData.value.endTime]
      : [];
};

// // 根据部门Id获取员工列表
// const getBidCompanyList = async () => {
//   const { data = {} } = await getBidCompanyNVList({
//     projectId: formData.value.biddingId
//   });
//   bidCompanyList.value = data.data || [];
// };

// 根据部门Id获取员工列表
const getStaffListByDeptId = async (roleCode, staffType) => {
  const { data = {} } = await getUserListByRoleCodeNew({
    roleCode
  });
  staffList.value[staffType] = data || [];
};

function handleAdd() {
  formData.value.projectItemList.push({ ...PROJECT_ITEM });
}

function handleDelete(index) {
  formData.value.projectItemList.splice(index, 1);
}

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
function handleCompanyChange(val) {
  const company = formData.value.projectItemList.find(item => item.id == val);
  formData.value.winBidCompanyName = company.bidCompanyName;
  ruleFormRef.value.validateField("winBidCompanyName", () => null);
}

// function handleProjChange(val) {
//   const staff = staffList.value.projStaffList.find(item => item.staffId == val);
//   formData.value.projStaffName = staff.staffName;
//   ruleFormRef.value.validateField("projStaffId", () => null);
// }

// function handleTechChange(val) {
//   const staff = staffList.value.techStaffList.find(item => item.staffId == val);
//   formData.value.techStaffName = staff.staffName;
//   ruleFormRef.value.validateField("techStaffId", () => null);
// }

function handleDutyChange(val) {
  const staff = staffList.value.dutyStaffList.find(item => item.staffId == val);
  formData.value.dutyStaffName = staff.staffName;
  ruleFormRef.value.validateField("dutyStaffId", () => null);
}

function handleBusiChange(val) {
  const staff = staffList.value.busiStaffList.find(item => item.staffId == val);
  formData.value.busiStaffName = staff.staffName;
  ruleFormRef.value.validateField("busiStaffId", () => null);
}

function handleDateChange(val) {
  if (val != null) {
    formData.value.startTime = val[0];
    formData.value.endTime = val[1];
  } else {
    formData.value.startTime = "";
    formData.value.endTime = "";
  }
}

//获取项目进度状态NV
async function BuildsLeaseStatus() {
  const { data } = await GetProgressStatusNV();
  progressStatusList.value = data;
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "add") {
        const { code, message } = await createProjectWinBid(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (showType.value == "edit") {
        const { code, message } = await updateProjectWinBid(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
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
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="1180"
    draggable
    @close="closeDialog"
  >
    <el-alert
      v-if="showType == 'add'"
      show-icon
      title="提示：仅添加外部项目中标信息表"
      type="info"
      :closable="false"
    />
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :class="{
        'mt-4': showType == 'add'
      }"
      :rules="fromRules"
      :disabled="showType == 'read'"
      label-width="150px"
    >
      <el-row :gutter="40">
        <el-col :span="24" :offset="0">
          <el-form-item label="项目名称" prop="fullName">
            <el-input
              v-model="formData.fullName"
              :readonly="showType != 'add'"
              :placeholder="showType != 'add' ? '' : '请输入'"
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
        <el-card
          class="mx-[20px] mb-[18px]"
          shadow="never"
          :body-style="{
            padding: '0px',
            border: 'none'
          }"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span
                class="flex justify-between items-center truncate text-dark-300!"
                style="font-weight: 560 !important"
                >标书制作人员</span
              >
              <el-button
                v-if="showType != 'read'"
                type="primary"
                size="small"
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
        <el-card
          class="w-full mx-[20px] mb-[18px]"
          shadow="never"
          :body-style="{
            padding: '18px',
            paddingBottom: '0px',
            border: 'none'
          }"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span
                class="flex justify-between items-center truncate text-dark-300!"
                style="font-weight: 560 !important"
                >中标单位信息</span
              >
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8" :offset="0">
              <el-form-item label="中标单位" prop="winBidCompanyName">
                <el-input
                  v-if="formData.projectItemList.length < 1"
                  v-model="formData.winBidCompanyName"
                  :readonly="showType == 'read'"
                  placeholder="请输入"
                />
                <el-select
                  v-else
                  v-model="formData.bidCompanyId"
                  :disabled="showType == 'read'"
                  :placeholder="showType == 'read' ? '' : '请选择'"
                  filterable
                  style="width: 100%"
                  @change="handleCompanyChange"
                >
                  <el-option
                    v-for="item in formData.projectItemList"
                    :key="item.id"
                    :label="item.bidCompanyName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="投标文件项目经理" prop="projStaffName">
                <el-input
                  v-model="formData.projStaffName"
                  :readonly="showType == 'read'"
                  :placeholder="showType == 'read' ? '' : '请输入'"
                />
                <!-- <el-select
              v-model="formData.projStaffId"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
              filterable
              @change="handleProjChange"
              clearable
            >
              <el-option
                v-for="item in staffList.projStaffList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select> -->
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="投标文件技术负责人" prop="techStaffName">
                <el-input
                  v-model="formData.techStaffName"
                  :readonly="showType == 'read'"
                  :placeholder="showType == 'read' ? '' : '请输入'"
                />
                <!-- <el-select
              v-model="formData.techStaffId"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
              filterable
              @change="handleTechChange"
              clearable
            >
              <el-option
                v-for="item in staffList.techStaffList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select> -->
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="开竣工日期" prop="date">
                <el-date-picker
                  v-model="formData.date"
                  :disabled="showType == 'read'"
                  type="daterange"
                  start-placeholder="开工日期"
                  end-placeholder="竣工日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  @change="handleDateChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
        <el-card
          class="w-full mx-[20px] mb-[18px]"
          shadow="never"
          :body-style="{
            padding: '18px',
            paddingBottom: '0px',
            border: 'none'
          }"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span
                class="flex justify-between items-center truncate text-dark-300!"
                style="font-weight: 560 !important"
                >项目立项信息</span
              >
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8" :offset="0">
              <el-form-item label="项目立项简称" prop="shortName">
                <el-input
                  v-model="formData.shortName"
                  :readonly="showType == 'read'"
                  :placeholder="showType == 'read' ? '' : '请输入'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="项目经理/负责人" prop="dutyStaffName">
                <!-- <el-input
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
              v-model="formData.dutyStaffName"
            /> -->
                <el-select
                  v-model="formData.dutyStaffId"
                  :disabled="showType == 'read'"
                  :placeholder="showType == 'read' ? '' : '请选择'"
                  style="width: 100%"
                  filterable
                  clearable
                  @change="handleDutyChange"
                >
                  <el-option
                    v-for="item in staffList.dutyStaffList"
                    :key="item.staffId"
                    :label="item.staffName"
                    :value="item.staffId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="商务负责人" prop="busiStaffName">
                <!-- <el-input
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
              v-model="formData.busiStaffName"
            /> -->
                <el-select
                  v-model="formData.busiStaffId"
                  :disabled="showType == 'read'"
                  :placeholder="showType == 'read' ? '' : '请选择'"
                  style="width: 100%"
                  filterable
                  clearable
                  @change="handleBusiChange"
                >
                  <el-option
                    v-for="item in staffList.busiStaffList"
                    :key="item.staffId"
                    :label="item.staffName"
                    :value="item.staffId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="项目进度" prop="progressStatus">
                <el-select
                  v-model="formData.progressStatus"
                  :style="{ width: '100%' }"
                  :disabled="showType == 'read'"
                  :placeholder="showType == 'read' ? '' : '请选择'"
                  ><el-option
                    v-for="item in progressStatusList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                /></el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="winBidComment">
            <el-input
              v-model="formData.winBidComment"
              type="textarea"
              show-word-limit
              :maxlength="255"
              :placeholder="showType == 'read' ? '' : '请输入'"
              :readonly="showType == 'read'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">{{
        showType == "read" ? "关闭" : "取消"
      }}</el-button>
      <el-button
        v-if="showType == 'add' || showType == 'edit'"
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
