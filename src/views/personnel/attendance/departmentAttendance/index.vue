<script setup lang="ts">
import { storeToRefs } from "pinia";
import { FormInstance } from "element-plus";
import { ref, onMounted, nextTick, watch } from "vue";

import { exportExcel } from "@/api/exportAll";
import { GetListV2 } from "@/api/attendAccRecord";
import { TableProBar } from "@/components/ReTable";
import { GetTreeByDeptId } from "@/api/department";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { userDepartmentStoreHook } from "@/store/modules/department";

defineOptions({
  name: "DepartmentAttendance"
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
const leaveList = ref([]);
const queryForm = ref({
  month: "",
  staffName: "",
  pageIndex: 1,
  pageSize: 20,
  companyId: "",
  socialCompanyId: "",
  deptId: "",
  keyword: ""
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

watch(
  () => queryForm.value.companyId,
  val => {
    if (val == "") {
      queryForm.value.deptId = "";
    }
  }
);

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
function onSearch() {
  loading.value = true;
  GetListV2(queryForm.value)
    .then(({ data }) => {
      const list = data.data || [];
      dataList.value = list.map(item => {
        item.disabled = {};
        item.title = {};

        return item;
      });
      if (dataList.value.length > 0) {
        dataList.value.map(aitem => {
          columnList.value = aitem.dateItems || [];
          leaveList.value = aitem.leaveItems || [];
        });
      }
      totalPage.value = data.totalCount;
    })
    .catch(() => {
      dataList.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
}

//导出
async function handleExport() {
  exportLoading.value = true;
  const fileName = "部门考勤登记";
  await exportExcel(
    "/api/AttendAccRecord/ExportV2?",
    fileName,
    queryForm.value
  );
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
      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="社保关系"
        prop="socialCompanyId"
      >
        <el-select
          v-model="queryForm.socialCompanyId"
          clearable
          placeholder="请选择"
          ><el-option
            v-for="item in rootDepartment"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
        /></el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 4 || !fold"
        label="员工姓名"
        prop="staffName"
      >
        <el-input
          v-model="queryForm.staffName"
          placeholder="请输入"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item v-show="maxItemNum >= 5 || !fold" label="月份" prop="month">
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

      <el-form-item
        v-show="maxItemNum >= 6 || !fold"
        label="关键字"
        prop="keyword"
      >
        <el-input v-model="queryForm.keyword" placeholder="部门" clearable />
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
      title="部门考勤登记表"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'DepartmentAttendance.export'"
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
            fixed="left"
            label="姓名"
            width="80"
            align="center"
            prop="attStaffName"
            show-overflow-tooltip
          />
          <el-table-column
            label="员工编号"
            width="120"
            align="center"
            prop="attStaffCode"
            show-overflow-tooltip
          />
          <el-table-column
            label="所属公司"
            width="150"
            align="left"
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
            width="100"
            align="center"
            prop="attJobTitleName"
            show-overflow-tooltip
          />
          <el-table-column
            label="社保关系"
            width="150"
            align="left"
            prop="attSocialCompanyName"
            show-overflow-tooltip
          />
          <el-table-column
            v-for="(item, idx) in columnList"
            :key="item.id"
            :label="item.dateName"
            width="45"
            align="center"
          >
            <el-table-column
              :label="item.weekDayName"
              width="45"
              align="center"
            >
              <template #default="{ row }">
                <span>{{ row.dateItems[idx].mark }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            label="实际出勤"
            width="45"
            align="center"
            prop="realWorkDays"
            show-overflow-tooltip
          />
          <el-table-column
            label="公差"
            width="45"
            align="center"
            prop="busiTripDays"
            show-overflow-tooltip
          />

          <el-table-column
            label="项目出勤天数"
            width="60"
            align="center"
            prop="projWorkDays"
            show-overflow-tooltip
          />
          <el-table-column label="加班">
            <el-table-column
              label="工作日"
              width="45"
              align="center"
              prop="normalExtraHours"
              show-overflow-tooltip
            />
            <el-table-column
              label="周末"
              width="45"
              align="center"
              prop="weekendExtraHours"
              show-overflow-tooltip
            />
            <el-table-column
              label="节假日"
              width="45"
              align="center"
              prop="festivalExtraHours"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column label="缺勤天数">
            <el-table-column
              label="法定休息日"
              width="45"
              align="center"
              prop="legalRestDays"
              show-overflow-tooltip
            />
            <el-table-column
              label="旷工"
              width="45"
              align="center"
              prop="skipWorkDays"
              show-overflow-tooltip
            />
            <el-table-column
              v-for="(item, idx) in leaveList"
              :key="item.id"
              :label="item.leaveTypeName"
              width="45"
              align="center"
            >
              <template #default="{ row }">
                <span>{{ row.leaveItems[idx].totalValue }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column
            label="忘记打卡次数"
            width="60"
            align="center"
            prop="forgotAttCount"
            show-overflow-tooltip
          />
          <el-table-column label="迟到早退">
            <el-table-column
              label="迟到/早退≤5分钟次数"
              width="75"
              align="center"
              prop="attIn5Count"
              show-overflow-tooltip
            />
            <el-table-column
              label="迟到/早退＞5分钟，≤30分钟次数"
              width="75"
              align="center"
              prop="attIn30Count"
              show-overflow-tooltip
            />
            <el-table-column
              label="迟到/早退＞30分钟，≤1h次数"
              width="75"
              align="center"
              prop="attOver30Count"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column
            label="备注"
            min-width="150"
            align="left"
            prop="remark2"
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

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
