<script setup lang="ts">
import { storeToRefs } from "pinia";
import { FormInstance } from "element-plus";
import { ref, onMounted, nextTick } from "vue";

import { exportExcel } from "@/api/exportAll";
import { getItemsList } from "@/api/attendance";
import { TableProBar } from "@/components/ReTable";
import { GetTreeByDeptId } from "@/api/department";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { userDepartmentStoreHook } from "@/store/modules/department";

defineOptions({
  name: "AttendanceDetails"
});
const { getRootDeptList } = userDepartmentStoreHook();
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const treeData = ref([]);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const formRef = ref<FormInstance>();
const columnList = ref([]);
const queryForm = ref({
  month: "",
  staffName: "",
  pageIndex: 1,
  pageSize: 20,
  companyId: "",
  deptId: ""
});
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());

const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now();
};
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
const exportLoading = ref(false);
// 查看表格行
// function handleQuery(row) {
//   console.log(row);
// }
// current-change 改变时触发
function handleCurrentChange() {
  onSearch();
}

// pageSize 改变时触发
function handleSizeChange() {
  onSearch();
}
//切换“折叠”与“展开”
function handleFold() {
  fold.value = !fold.value;
  setTableHeight();
}

async function dpname(val) {
  if (val != null && val != "") {
    const { data } = await GetTreeByDeptId({ deptId: val });
    treeData.value = data || [];
  } else {
    treeData.value = [];
  }
}
// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data } = await getItemsList(queryForm.value);
  dataList.value = data.data || [];
  if (dataList.value.length > 0) {
    const item = dataList.value[0];
    columnList.value = item.items || [];
  }
  totalPage.value = data.totalCount;
  loading.value = false;
}

//导出
async function handleExport() {
  exportLoading.value = true;
  const fileName = "考勤明细";
  await exportExcel("/api/Attendance/ExportItems?", fileName, queryForm.value);
  exportLoading.value = false;
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  const date = new Date();
  const month = date.getMonth() + 1;
  queryForm.value.month =
    date.getFullYear() + "-" + (month < 10 ? "0" + month.toString() : month);
  onSearch();
};

// 设置表格组件高度
const setTableHeight = () => {
  nextTick(() => {
    maxItemNum.value =
      (formRef.value.$el.clientWidth -
        8 -
        32 -
        formRef.value.$el.children[formRef.value.$el.children.length - 1]
          .clientWidth) /
      (formRef.value.$el.children[0].clientWidth + 32);
    maxItemNum.value = Math.floor(maxItemNum.value);
    tableHeight.value =
      window.innerHeight - formRef.value.$el.clientHeight - 230;
  });
};

//mounted周期函数
onMounted(async () => {
  const date = new Date();
  const month = date.getMonth() + 1;
  queryForm.value.month =
    date.getFullYear() + "-" + (month < 10 ? "0" + month.toString() : month);
  onSearch();
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  nextTick(() => {
    setTableHeight();
  });
});

// 窗口尺寸改变事件回调
window.onresize = function () {
  console.log("onresize");
  nextTick(() => {
    setTableHeight();
  });
};
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="queryForm"
      label-width="80px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="所属公司"
        prop="companyId"
      >
        <el-select
          v-model="queryForm.companyId"
          clearable
          placeholder="请选择"
          @change="dpname"
          ><el-option
            v-for="item in rootDepartment"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
        /></el-select>
        <!-- <el-cascader
          clearable
          v-model="queryForm.companyId"
          :options="rootDepartment"
          placeholder="请选择"
          class="w-100/100"
          :props="selProps"
          :show-all-levels="false"
          @change="dpname"
        >
          <template #default="{ data }">
            <span>{{ data.fullName }}</span>
          </template>
        </el-cascader> -->
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="部门"
        prop="deptId"
      >
        <el-cascader
          v-model="queryForm.deptId"
          clearable
          :options="treeData"
          placeholder="请选择"
          class="w-100/100"
          :props="selProps"
          :show-all-levels="false"
        >
          <template #default="{ data }">
            <span>{{ data.fullName }}</span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item v-show="maxItemNum >= 1" label="员工姓名" prop="staffName">
        <el-input
          v-model="queryForm.staffName"
          placeholder="请输入"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item v-show="maxItemNum >= 1" label="月份" prop="month">
        <el-date-picker
          v-model="queryForm.month"
          placeholder="请选择"
          format="YYYY-MM"
          value-format="YYYY-MM"
          type="month"
          :clearable="false"
          :disabled-date="disabledDate"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('search')"
          :loading="loading"
          @click="onSearch"
        >
          查询
        </el-button>
        <el-button :icon="useRenderIcon('refresh')" @click="resetForm(formRef)">
          重置
        </el-button>
        <el-button type="text" @click="handleFold">
          <span v-show="fold">展开</span>
          <span v-show="!fold">折叠</span>
          <IconifyIconOffline :icon="!fold ? 'arrow-up' : 'arrow-down'" />
        </el-button>
      </el-form-item>
    </el-form>

    <TableProBar
      title="打卡明细"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'AttendanceDetails.export'"
          type="primary"
          :icon="useRenderIcon('export')"
          :loading="exportLoading"
          @click="handleExport()"
        >
          导出
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          border
          :size="size"
          :height="tableHeight"
          :data="dataList"
          highlight-current-row
          :default-expand-all="false"
          row-key="path"
        >
          <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            :index="getIndex"
            label="序号"
            width="60"
            align="center"
          />
          <el-table-column
            label="员工编号"
            width="150"
            align="center"
            prop="attStaffCode"
            show-overflow-tooltip
          />
          <el-table-column
            label="身份证号"
            width="180"
            align="center"
            prop="attIDCard"
            show-overflow-tooltip
          />
          <el-table-column
            label="姓名"
            width="100"
            align="center"
            prop="attStaffName"
            show-overflow-tooltip
          />
          <el-table-column
            label="所属公司"
            width="180"
            align="center"
            prop="attCompanyName"
            show-overflow-tooltip
          />
          <el-table-column
            label="部门"
            width="100"
            align="center"
            prop="attDeptName"
            show-overflow-tooltip
          />
          <el-table-column
            label="岗位"
            width="120"
            align="center"
            prop="attJobTitleName"
            show-overflow-tooltip
          />
          <el-table-column
            v-for="(item, idx) in columnList"
            :key="item.id"
            :label="item.dateStr"
            width="180"
            align="center"
          >
            <el-table-column label="上班打卡" width="100" align="center">
              <template #default="{ row }">
                <span>{{ row.items[idx].attMorning }}</span>
              </template>
            </el-table-column>
            <el-table-column label="下班打卡" width="100" align="center">
              <template #default="{ row }">
                <span>{{ row.items[idx].attAfternoon }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <!-- <el-table-column fixed="right" label="操作" width="80" align="center">
            <template #default="scope">
              <el-button
                v-auth="'AttendanceDetails.query'"
                :size="size"
                @click="handleQuery(scope.row)"
                link
                type="primary"
              >
                查看
              </el-button>
            </template>
          </el-table-column> -->

          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
        <el-pagination
          v-model:current-page="queryForm.pageIndex"
          v-model:page-size="queryForm.pageSize"
          class="flex justify-end mt-4"
          :small="size === 'small' ? true : false"
          :page-sizes="[10, 20, 30, 50, 100, 200]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </TableProBar>
    <DialogForm ref="dialogFormRef" @search="onSearch" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
