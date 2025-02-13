<script setup lang="ts">
import _ from "lodash";
import dayjs from "dayjs";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";

import { BatchCreate } from "@/api/reqCartItem";

const COMPANY_MODEL = {
  materialName: "", //物资名称(设备名称)
  materialSpec: "", //规格型号
  materialUnit: "", //单位
  materialQty: "", //数量
  materialParams: "", //参数要求
  receiveTime: "", //到货日期
  remark: "" //备注
};
// 表单模型
const INITIAL_DATA = {
  id: "",
  projectId: "", //项目ID
  projectFullName: "", //项目全称（只读）
  projectShortName: "", //项目简称（只读）
  winBidCompanyName: "", //中标单位（只读）
  projectDutyStaffName: "", //项目负责人（只读）
  reqCartItems: [
    // {
    //   ...COMPANY_MODEL
    // }
  ]
};
// 表单校验规则
const fromRules = {
  projectId: [{ required: true, message: "请选择", trigger: "blur" }],
  receiveTime: [{ required: true, message: "请选择", trigger: "change" }],
  reqCartItems: [{ required: true, message: "请添加", trigger: "blur" }]
};

const rowRules = {
  materialName: [
    { required: true, message: "请填写设备名称", trigger: "blur" }
  ],
  materialSpec: [
    { required: true, message: "请填写规格型号", trigger: "blur" }
  ],
  materialUnit: [{ required: true, message: "请填写单位", trigger: "blur" }],
  materialQty: [{ required: true, message: "请填写数量", trigger: "blur" }],
  materialParams: [
    { required: true, message: "请填写参数要求", trigger: "blur" }
  ],
  receiveTime: [
    { required: true, message: "请选择到货日期", trigger: "change" }
  ]
};
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const props = defineProps({
  projectList: []
});
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const showType = ref("add");
const dialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const rowData = ref({ ...COMPANY_MODEL });
const ruleFormRef = ref<FormInstance>();
const rulerowFormRef = ref<FormInstance>();
const flag = ref("add");

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加购物车采购项"
    : showType.value == "apply"
      ? "申请购物车采购项"
      : showType.value == "edit"
        ? "编辑购物车采购项"
        : showType.value == "query"
          ? "查看购物车采购项"
          : showType.value == "audit"
            ? "审核购物车采购项"
            : "";
});

function formatDatetime(dt) {
  return dayjs(dt).format("YYYY-MM-DD");
}

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  rowData.value = { ...COMPANY_MODEL };
  // formData.value.reqCartItems = [
  //   // {
  //   //   ...COMPANY_MODEL
  //   // }
  // ];
  // if (_formData) {
  //   getDetail(_formData.id);
  // }
};
defineExpose({ show });

// 根据部门Id获取员工列表
// const getDetail = async id => {
//   const { data = {} } = await getProjectBid({
//     id
//   });
//   formData.value = data || {};
// };

function handleProjectChange(val) {
  const project = props.projectList.find(item => item.id == val);
  formData.value.winBidCompanyName = project.winBidCompanyName;
}

function handleAdd() {
  if (flag.value == "add") {
    rulerowFormRef.value.validate(async valid => {
      if (valid) {
        formData.value.reqCartItems.push({ ...rowData.value });
        resetForm(rulerowFormRef.value);
      }
    });
  } else {
    formData.value.reqCartItems = JSON.parse(
      JSON.stringify(formData.value.reqCartItems)
    );
    resetForm(rulerowFormRef.value);
    rowData.value = { ...rowData.value };
    flag.value == "add";
  }
}

function handleDelete(index) {
  console.log("index", index);
  formData.value.reqCartItems.splice(index, 1);
}

function handleEdit(index) {
  flag.value = "edit";
  rowData.value = formData.value.reqCartItems[index];
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await BatchCreate(formData.value);
      if (code == 0) {
        ElMessage.success(message);
        dialogVisible.value = false;
        resetForm(formEl);
        emit("search");
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
    :width="800"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->

    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="92px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              placeholder="请选择"
              clearable
              filterable
              style="width: 100%"
              @change="handleProjectChange"
            >
              <el-option
                v-for="item in props.projectList"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col v-if="showType == 'add'" :span="12" :offset="0">
          <el-form-item label="中标单位" prop="winBidCompanyName">
            <el-input
              v-model="formData.winBidCompanyName"
              :show-word-limit="true"
              readonly
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-alert show-icon title="设备明细新增" type="info" :closable="false" />

    <el-card shadow="never" :body-style="{ padding: '0px', border: 'none' }">
      <template #header>
        <div class="flex justify-between items-center">
          <span>设备明细</span>
          <!-- <el-button
            v-if="showType == 'add' || showType == 'edit'"
            type="primary"
            plain
            @click="handleAdd()"
          >
            添加
          </el-button> -->
        </div>
        <el-form
          ref="rulerowFormRef"
          style="margin-top: 10px"
          :model="rowData"
          :rules="rowRules"
          label-width="92px"
        >
          <el-row :gutter="20">
            <el-col :span="12" :offset="0">
              <el-form-item label="设备名称" prop="materialName">
                <el-input v-model="rowData.materialName" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="规格型号" prop="materialSpec">
                <el-input v-model="rowData.materialSpec" />
              </el-form-item>
            </el-col>

            <el-col :span="24" :offset="0">
              <el-form-item label="参数要求" prop="materialParams">
                <el-input
                  v-model="rowData.materialParams"
                  :rows="3"
                  type="textarea"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="单位" prop="materialUnit">
                <el-input v-model="rowData.materialUnit" style="width: 100px" />
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item
                label="数量"
                prop="materialQty"
                label-width="70px !important"
              >
                <el-input
                  v-model="rowData.materialQty"
                  type="number"
                  style="width: 100px"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="到货日期" prop="receiveTime">
                <el-date-picker
                  v-model="rowData.receiveTime"
                  :style="{ width: '100%' }"
                  type="date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24" :offset="0">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="rowData.remark" :rows="1" type="textarea" />
              </el-form-item>
            </el-col>
          </el-row>
          <div style="text-align: right">
            <el-button type="primary" @click="handleAdd()"> 保存 </el-button>
          </div>
        </el-form>
      </template>
      <el-table
        highlight-current-row
        :data="formData.reqCartItems"
        border
        stripe
        :max-height="280"
      >
        <el-table-column
          label="序号"
          type="index"
          width="60"
          fixed="left"
          align="center"
        />

        <el-table-column
          label="设备名称"
          fixed="left"
          :min-width="180"
          show-overflow-tooltip
          prop="materialName"
        />
        <el-table-column
          label="规格型号"
          :width="100"
          show-overflow-tooltip
          prop="materialSpec"
        />
        <el-table-column
          label="参数要求"
          :min-width="300"
          show-overflow-tooltip
          prop="materialParams"
        />
        <el-table-column
          label="单位"
          :min-width="60"
          show-overflow-tooltip
          prop="materialUnit"
        />

        <el-table-column
          label="数量"
          :min-width="60"
          show-overflow-tooltip
          prop="materialQty"
        />

        <el-table-column
          label="到货日期"
          :width="120"
          show-overflow-tooltip
          prop="receiveTime"
        >
          <template #default="{ row }">
            {{ formatDatetime(row.receiveTime) }}
          </template>
        </el-table-column>

        <el-table-column
          label="备注"
          :width="120"
          show-overflow-tooltip
          prop="remark"
        />
        <el-table-column
          v-if="showType == 'add'"
          label="操作"
          width="100"
          fixed="right"
          align="center"
        >
          <template #default="{ $index }">
            <el-button type="text" @click="handleEdit($index)">
              编辑
            </el-button>
            <el-button type="text" @click="handleDelete($index)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <template #footer>
      <el-button @click="dialogVisible = false">{{
        showType != "query" ? "取消" : "关闭"
      }}</el-button>
      <el-button
        v-if="showType == 'add'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
      <!-- <el-button
        v-if="showType == 'apply'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >提交</el-button
      > -->
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
:deep(.el-card__header) {
  padding: 10px;
}

:deep(.el-form-item) {
  &:nth-last-of-type(1) {
    margin-right: 0;
  }
}
</style>
