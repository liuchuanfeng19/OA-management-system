<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { TableProBar } from "@/components/ReTable";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import dayjs from "dayjs";
import { FormInstance } from "element-plus";
import DialogSetForm from "./components/DialogSetForm.vue";
import { exportExcel } from "@/api/exportAll";
import { getStaffLeaveBalanceList } from "@/api/attendance";
defineOptions({
  name: "LeaveBalance"
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const columnList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const maxItemNum = ref(1);
const formRef = ref<FormInstance>();
const dialogSetFormRef = ref(null);
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

function handleSet(typeId, staffId, staffName) {
  dialogSetFormRef.value.show(typeId, staffId, staffName);
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data } = await getStaffLeaveBalanceList(queryForm.value);
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
  const fileName = "员工假期余额";
  await exportExcel(
    "/api/StaffLeaveBalance/Export?",
    fileName,
    queryForm.value
  );
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
      label-width="80px"
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
      title="员工假期余额"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'LeaveBalance.export'"
          type="primary"
          :icon="useRenderIcon('export')"
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
            align="center"
            prop="companyName"
            show-overflow-tooltip
          />
          <el-table-column
            label="部门"
            width="120"
            align="center"
            prop="deptName"
            show-overflow-tooltip
          />
          <el-table-column
            label="岗位"
            min-width="120"
            align="center"
            prop="jobTitleName"
            show-overflow-tooltip
          />
          <el-table-column
            label="入职日期"
            min-width="120"
            align="center"
            prop="startDate"
            show-overflow-tooltip
            :formatter="
              ({ startDate }) => {
                return dayjs(startDate).format('YYYY-MM-DD');
              }
            "
          />
          <!-- <el-table-column
            label="首次工作时间"
            min-width="150"
            align="center"
            prop="startWorkDate"
            show-overflow-tooltip
            :formatter="
              ({ startWorkDate }) => {
                return dayjs(startWorkDate).format('YYYY-MM-DD');
              }
            "
          /> -->
          <el-table-column
            v-for="(item, idx) in columnList"
            :key="item.id"
            :label="item.leaveTypeName + '(天)'"
          >
            <el-table-column label="总共" width="100" align="center">
              <template #default="{ row }">
                <span
                  v-if="
                    row.items[idx].isLimit && row.items[idx].totalValue >= 0
                  "
                  >{{ row.items[idx].totalValue }}</span
                >
                <span v-else>无限制</span>
              </template>
            </el-table-column>
            <el-table-column label="剩余" width="100" align="center">
              <template #default="{ row }">
                <el-button
                  v-if="row.items[idx].isLimit && row.items[idx].leftValue >= 0"
                  type="text"
                  @click="
                    handleSet(
                      row.items[idx].leaveTypeId,
                      row.attStaffId,
                      row.attStaffName
                    )
                  "
                  >{{ row.items[idx].leftValue }}</el-button
                >
                <el-button
                  v-else
                  type="text"
                  @click="
                    handleSet(
                      row.items[idx].leaveTypeId,
                      row.attStaffId,
                      row.attStaffName
                    )
                  "
                  >无限制</el-button
                >
              </template>
            </el-table-column>
          </el-table-column>
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
    <DialogSetForm ref="dialogSetFormRef" @search="onSearch" />
  </div>
</template>
