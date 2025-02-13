<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";
import { TableProBar } from "@/components/ReTable";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import MaterialDialog from "./MaterialDialog.vue";
import { addProjectStaff, updateOneProjectStaff } from "@/api/projectStaff";
import { GetListNVForApp } from "@/api/projectWinBid";
// import {
//   getProductBomRowList,
//   doProductBomRowDelete
// } from "@/api/productBomRow";
// import dayjs from "dayjs";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "",
  projectName: "",
  staffId: "",
  staffName: "",
  deptId: "",
  deptName: "",
  mobile: "",
  inTime: "",
  outTime: "",
  totalDays: 0,
  projectDuty: "",
  projectDutyMobile: ""
};

// 表单校验规则
const fromRules = {
  projectId: [
    { required: true, message: "项目名称不能为空", trigger: "change" }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableData = ref([]);
const loading = ref(false);
const showType = ref("add");
const dialogVisible = ref(false);
const materialDialogRef = ref(null);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const projectWinBidNV = ref([]); //获取中标项目列表

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加项目人员"
    : showType.value == "edit"
      ? "编辑项目人员"
      : showType.value == "query"
        ? "查看项目人员"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  tableData.value = [];
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };

  if (_formData) {
    formData.value = Object.assign({}, _formData);

    handleProjectChange(_formData.projectId);
    tableData.value = _formData.rows;
  }
};
defineExpose({ show });

//获取中标项目列表NV;
async function getProjectWinBidNV() {
  const { data } = await GetListNVForApp();
  if (data) {
    projectWinBidNV.value = data;
  }
}
function handleProjectChange(val) {
  const project = projectWinBidNV.value.find(item => item.id == val);
  formData.value.projectName = project.fullName;
  formData.value.projectDuty = project.dutyStaffName;
  formData.value.projectDutyMobile = project.dutyStaffMobile;
}

//选择产品
function handleAdd() {
  if (
    formData.value.projectId == null ||
    formData.value.projectId == "" ||
    formData.value.projectId == undefined
  ) {
    ElMessage.warning("请选择项目");
    return;
  }
  materialDialogRef.value.show(tableData.value);
}
//选择的物料
function onSelect(selectData) {
  console.log(selectData);
  if (selectData != null) {
    console.log("selectData", selectData);
    selectData.forEach(item => {
      const obj = {
        isNew: true,
        staffName: "",
        companyName: "",
        deptName: "",
        mobile: "",
        inTime: "",
        outTime: "",
        remark: ""
      };
      obj.staffName = item.staffName;
      obj.companyName = item.companyName;
      obj.deptName = item.deptName;
      obj.mobile = item.mobile;

      tableData.value.push(obj);
    });
  }
}

//新增非物料类
function handleAddNew() {
  tableData.value.push({
    isNew: true,
    isEdit: false,
    staffName: "",
    companyName: "",
    deptName: "",
    mobile: "",
    inTime: "",
    outTime: "",
    remark: ""
  });
}

function handleDelete(index) {
  tableData.value.splice(index, 1);
}

// 提交表单
const submitForm = _.debounce((formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      const param = Object.assign({}, formData.value);
      param["Rows"] = tableData.value;
      if (showType.value == "add" || showType.value == "copy") {
        addProjectStaff(param)
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
      } else {
        updateOneProjectStaff(param)
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

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value);
};
getProjectWinBidNV();
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="640"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              placeholder="请选择"
              clearable
              filterable
              style="width: 100%"
              :disabled="showType != 'add'"
              @change="handleProjectChange"
            >
              <el-option
                v-for="item in projectWinBidNV"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="项目负责人" prop="projectDuty">
            <el-input v-model="formData.projectDuty" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="项目负责人电话" prop="projectDutyMobile">
            <el-input v-model="formData.projectDutyMobile" readonly />
          </el-form-item>
        </el-col>
        <el-col v-if="showType != 'add'" :span="12" :offset="0">
          <el-form-item label="姓名" prop="staffName">
            <el-input v-model="formData.staffName" readonly />
          </el-form-item>
        </el-col>
        <el-col v-if="showType != 'add'" :span="12" :offset="0">
          <el-form-item label="所属部门" prop="deptName">
            <el-input v-model="formData.deptName" readonly />
          </el-form-item>
        </el-col>
        <el-col v-if="showType != 'add'" :span="12" :offset="0">
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="formData.mobile" readonly />
          </el-form-item>
        </el-col>
        <el-col v-if="showType != 'add'" :span="12" :offset="0">
          <el-form-item label="入项日期" prop="inTime">
            <el-date-picker
              v-model="formData.inTime"
              type="date"
              :clearable="false"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              placeholder="入项日期"
              :disabled="showType == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="showType != 'add'" :span="12" :offset="0">
          <el-form-item label="退项日期" prop="outTime">
            <el-date-picker
              v-model="formData.outTime"
              type="date"
              :clearable="false"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              placeholder="退项日期"
              :disabled="showType == 'query'"
            />
          </el-form-item>
        </el-col>

        <el-col v-if="showType == 'add'" :span="24" :offset="0">
          <el-form-item label-width="0px">
            <TableProBar
              title="项目人员"
              :dataList="tableData"
              @refresh="onSearch"
            >
              <template #buttons>
                <el-button
                  :icon="useRenderIcon('add')"
                  type="primary"
                  @click="handleAddNew"
                  >添加</el-button
                >
                <el-button
                  :icon="useRenderIcon('add')"
                  type="primary"
                  @click="handleAdd"
                  >选择人员</el-button
                >
              </template>
              <template v-slot="{ size }">
                <el-table
                  border
                  :height="240"
                  :size="size"
                  highlight-current-row
                  :data="tableData"
                >
                  <el-table-column
                    fixed="left"
                    type="index"
                    label="序号"
                    align="center"
                    width="60"
                  />

                  <el-table-column
                    label="姓名"
                    align="center"
                    prop="staffName"
                    width="100"
                    show-overflow-tooltip
                  >
                    <template #default="{ row }">
                      <el-input
                        v-model.trim="row.staffName"
                        placeholder="姓名"
                      />
                      <!-- <span v-else>{{ row.staffName }}</span> -->
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="公司"
                    align="center"
                    prop="companyName"
                    width="120"
                    show-overflow-tooltip
                  >
                    <template #default="{ row }">
                      <el-input
                        v-model.trim="row.companyName"
                        placeholder="公司"
                      />
                      <!-- <span v-else>{{ row.companyName }}</span> -->
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="部门"
                    width="130"
                    align="left"
                    prop="deptName"
                    show-overflow-tooltip
                  >
                    <template #default="{ row }">
                      <el-input
                        v-model.trim="row.deptName"
                        align="center"
                        placeholder="部门"
                      />
                      <!-- <span v-else>{{ row.deptName }}</span> -->
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="电话"
                    align="center"
                    prop="mobile"
                    width="130"
                    show-overflow-tooltip
                  >
                    <template #default="{ row }">
                      <el-input
                        v-model.trim="row.mobile"
                        align="center"
                        placeholder="电话"
                      />
                      <!-- <span v-else>{{ row.mobile }}</span> -->
                    </template>
                  </el-table-column>

                  <el-table-column
                    label="入项时间"
                    align="center"
                    prop="inTime"
                    width="146"
                    show-overflow-tooltip
                  >
                    <template #default="{ row }">
                      <el-date-picker
                        v-model="row.inTime"
                        type="date"
                        :clearable="false"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        style="width: 120px"
                        placeholder="入项时间"
                      />
                      <!-- <span v-else>{{
                        dayjs(row.inTime).format("YYYY-MM-DD")
                      }}</span> -->
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="退项时间"
                    prop="outTime"
                    align="center"
                    width="146"
                    show-overflow-tooltip
                  >
                    <template #default="{ row }">
                      <el-date-picker
                        v-model="row.outTime"
                        type="date"
                        :clearable="false"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        style="width: 120px"
                        placeholder="退项时间"
                      />
                      <!-- <span v-else>{{
                        dayjs(row.outTime).format("YYYY-MM-DD")
                      }}</span> -->
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="备注"
                    align="left"
                    prop="remark"
                    min-width="150"
                    show-overflow-tooltip
                  >
                    <template #default="{ row }">
                      <el-input v-model.trim="row.remark" placeholder="备注" />
                      <!-- <span v-else>{{ row.remark }}</span> -->
                    </template>
                  </el-table-column>
                  <el-table-column
                    fixed="right"
                    label="操作"
                    width="120"
                    align="center"
                  >
                    <template #default="scope">
                      <el-button
                        link
                        type="danger"
                        @click="handleDelete(scope.$index)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                  <template #empty>
                    <el-empty description="暂无数据" />
                  </template>
                </el-table>
              </template>
            </TableProBar>
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
        :loading="loading"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
    <MaterialDialog ref="materialDialogRef" @select="onSelect" />
  </el-dialog>
</template>
