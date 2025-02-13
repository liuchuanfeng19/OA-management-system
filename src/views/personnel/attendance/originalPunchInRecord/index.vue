<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { TableProBar } from "@/components/ReTable";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { FormInstance } from "element-plus";
import { getStaffAttendanceList } from "@/api/attendance";
import { exportExcel } from "@/api/exportAll";
defineOptions({
  name: "OriginalPunchInRecord"
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const maxItemNum = ref(1);
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const queryForm = ref({
  staffName: "",
  pageIndex: 1,
  pageSize: 20
});
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
const exportLoading = ref(false);
// current-change 改变时触发
function handleCurrentChange() {
  onSearch();
}

// pageSize 改变时触发
function handleSizeChange() {
  onSearch();
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data } = await getStaffAttendanceList(queryForm.value);
  dataList.value = data.data || [];
  totalPage.value = data.totalCount;
  loading.value = false;
}

//导出
async function handleExport() {
  exportLoading.value = true;
  const fileName = "原始打卡记录";
  await exportExcel("/api/Attendance/ExportList?", fileName, queryForm.value);
  exportLoading.value = false;
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
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
  onSearch();
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
      label-width="100px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item v-show="maxItemNum >= 1" label="员工姓名" prop="staffName">
        <el-input
          v-model="queryForm.staffName"
          placeholder="请输入"
          clearable
          @keyup.enter="onSearch"
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
      </el-form-item>
    </el-form>

    <TableProBar
      title="原始打卡记录"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'OriginalPunchInRecord.export'"
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
            label="姓名"
            width="100"
            align="center"
            prop="attStaffName"
            show-overflow-tooltip
          />
          <el-table-column
            label="公司"
            width="200"
            align="left"
            prop="attCompanyName"
            show-overflow-tooltip
          />
          <el-table-column
            label="部门"
            width="120"
            align="center"
            prop="attDeptName"
            show-overflow-tooltip
          />
          <el-table-column
            label="岗位"
            min-width="100"
            align="center"
            prop="attJobTitleName"
            show-overflow-tooltip
          />
          <el-table-column
            label="编号"
            min-width="120"
            align="center"
            prop="attStaffCode"
            show-overflow-tooltip
          />
          <el-table-column
            label="打卡时间"
            min-width="200"
            align="center"
            prop=""
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span v-if="row.attType == 1">上班-{{ row.attTime }}</span>
              <span v-else-if="row.attType == 2">下班-{{ row.attTime }}</span>
              <span v-else />
            </template>
          </el-table-column>
          <el-table-column
            label="打卡地址"
            min-width="300"
            align="center"
            prop="attAddress"
            show-overflow-tooltip
          />
          <el-table-column
            label="IP地址"
            min-width="120"
            align="center"
            prop="attIP"
            show-overflow-tooltip
          />
          <el-table-column
            label="数据来源"
            min-width="150"
            align="center"
            prop="attFrom"
            show-overflow-tooltip
          />
          <el-table-column
            label="设备标识码"
            min-width="150"
            align="center"
            prop="attDeviceCode"
            show-overflow-tooltip
          />
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
