<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { TableProBar } from "@/components/ReTable";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { FormInstance } from "element-plus";
import { exportExcel } from "@/api/exportAll";
import { getStaffLeaveBalanceList } from "@/api/attendance";
defineOptions({
  name: "LeaveBalance"
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
  const { data } = await getStaffLeaveBalanceList(queryForm.value);
  dataList.value = data.data || [];
  totalPage.value = data.totalCount;
  loading.value = false;
}

//导出
async function handleExport() {
  const fileName = "员工假期余额";
  exportExcel("/api/StaffLeaveBalance/Export?", fileName, queryForm.value);
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
      title="员工假期余额"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'AttendanceGroup.add'"
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
            width="150"
            align="center"
            prop="attStaffName"
            show-overflow-tooltip
          />
          <el-table-column
            label="公司"
            width="150"
            align="center"
            prop="companyName"
            show-overflow-tooltip
          />
          <el-table-column
            label="部门"
            width="150"
            align="center"
            prop="deptName"
            show-overflow-tooltip
          />
          <el-table-column
            label="岗位"
            min-width="150"
            align="center"
            prop=""
            show-overflow-tooltip
          />
          <el-table-column
            label="入职时间"
            min-width="150"
            align="center"
            prop=""
            show-overflow-tooltip
          />
          <el-table-column
            label="首次工作时间"
            min-width="150"
            align="center"
            prop=""
            show-overflow-tooltip
          />
          <el-table-column
            label="年假(天)"
            min-width="180"
            show-overflow-tooltip
          >
            <el-table-column
              label="总共"
              min-width="100"
              align="center"
              prop="annualDays"
              show-overflow-tooltip
            />
            <el-table-column
              label="剩余"
              min-width="100"
              align="center"
              prop="leftAnnualDays"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column
            label="事假(天)"
            min-width="150"
            align="center"
            show-overflow-tooltip
          >
            <el-table-column
              label="总共"
              min-width="100"
              align="center"
              prop="busiDays"
              show-overflow-tooltip
            />
            <el-table-column
              label="剩余"
              min-width="100"
              align="center"
              prop="leftBusiDays"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column
            label="病假(天)"
            min-width="150"
            align="center"
            show-overflow-tooltip
          >
            <el-table-column
              label="总共"
              min-width="100"
              align="center"
              prop="illDays"
              show-overflow-tooltip
            />
            <el-table-column
              label="剩余"
              min-width="100"
              align="center"
              prop="leftIllDays"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column
            label="调休(天)"
            min-width="150"
            align="center"
            show-overflow-tooltip
          >
            <el-table-column
              label="总共"
              min-width="100"
              align="center"
              prop="alterDays"
              show-overflow-tooltip
            />
            <el-table-column
              label="剩余"
              min-width="100"
              align="center"
              prop="leftAlterDays"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column
            label="产假(天)"
            min-width="150"
            align="center"
            show-overflow-tooltip
          >
            <el-table-column
              label="总共"
              min-width="100"
              align="center"
              prop="babyDays"
              show-overflow-tooltip
            />
            <el-table-column
              label="剩余"
              min-width="100"
              align="center"
              prop="leftBabyDays"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column
            label="陪产假(天)"
            min-width="150"
            align="center"
            show-overflow-tooltip
          >
            <el-table-column
              label="总共"
              min-width="100"
              align="center"
              prop="careDays"
              show-overflow-tooltip
            />
            <el-table-column
              label="剩余"
              min-width="100"
              align="center"
              prop="leftCareDays"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column
            label="婚假(天)"
            min-width="150"
            align="center"
            show-overflow-tooltip
          >
            <el-table-column
              label="总共"
              min-width="100"
              align="center"
              prop="marryDays"
              show-overflow-tooltip
            />
            <el-table-column
              label="剩余"
              min-width="100"
              align="center"
              prop="leftMarryDays"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column
            label="例假(天)"
            min-width="150"
            align="center"
            show-overflow-tooltip
          >
            <el-table-column
              label="总共"
              min-width="100"
              align="center"
              prop="girlDays"
              show-overflow-tooltip
            />
            <el-table-column
              label="剩余"
              min-width="100"
              align="center"
              prop="leftGirlDays"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column
            label="丧假(天)"
            min-width="150"
            align="center"
            show-overflow-tooltip
          >
            <el-table-column
              label="总共"
              min-width="100"
              align="center"
              prop="deadDays"
              show-overflow-tooltip
            />
            <el-table-column
              label="剩余"
              min-width="100"
              align="center"
              prop="leftDeadDays"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column
            label="哺乳假(小时)"
            min-width="150"
            align="center"
            show-overflow-tooltip
          >
            <el-table-column
              label="总共"
              min-width="100"
              align="center"
              prop="feedDays"
              show-overflow-tooltip
            />
            <el-table-column
              label="剩余"
              min-width="100"
              align="center"
              prop="leftFeedDays"
              show-overflow-tooltip
            />
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
    <DialogForm ref="dialogFormRef" @search="onSearch" />
  </div>
</template>
