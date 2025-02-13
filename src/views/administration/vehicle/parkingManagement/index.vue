<script setup lang="ts">
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { TableProBar } from "@/components/ReTable";
import { GetTreeByDeptId } from "@/api/department";
import FormDialog from "./components/FormDialog.vue";
import { GetList, Delete } from "@/api/parkingPlace";
import { userStaffStoreHook } from "@/store/modules/staff";
import { tableButtons, operationButtons, columns } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { TableColumOperation } from "@/components/TableColumOperation";
import { DownloadButton } from "@/components/DownloadButton";
import { PreviewButton } from "@/components/PreviewButton";
import ReadDialog from "@/components/ReadDialog";

const { getRootDeptList } = userDepartmentStoreHook();
const { getStaffListNV } = userStaffStoreHook();
defineOptions({
  name: "ParkingManagement"
});

const title = useRoute().meta.title as string;

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  KeyWord: "",
  DeptId: "",
  CompanyId: "",
  StaffId: "",
  StartDate: "",
  EndDate: ""
});
const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const dialogFormRef = ref(null); // 表单对话框组件实例
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例
const departmentList = ref([]); //部门
const { staffListNV } = storeToRefs(userStaffStoreHook());
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
const readDialogRef = ref(null); // 表单对话框组件实例

const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  GetList(queryForm)
    .then(({ data }) => {
      const list = data.data || [];
      tableData.value = list.map(item => {
        item.disabled = {};
        item.title = {};
        // //编辑
        // item.disabled["handleEdit"] = !item.canEdit;
        // item.title["handleEdit"] = !item.canEdit ? "当前数据不可编辑" : "";
        // //删除
        // item.disabled["handleDelete"] = !item.canDel;
        // item.title["handleDelete"] = !item.canDel ? "当前数据不可删除" : "";
        return item;
      });
      totalPage.value = data.totalCount;
    })
    .catch(() => {
      tableData.value = [];
    })
    .finally(() => {
      requestLoading.value = false;
    });
}

//切换“折叠”与“展开”
function handleFold() {
  queryFold.value = !queryFold.value;
  setTableHeight();
}

// 重置查询条件表单
const handleReset = () => {
  queryFormRef.value.resetFields();
  departmentList.value = [];
  onSearch();
};

//操作按钮
function handleOperation(functionName, row?) {
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    // case "handleExport":
    //   handleExport();
    //   break;
    case "handleRead":
      readDialogRef.value.show(row, columns);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
  }
}

//新增操作
const handleAdd = () => {
  dialogFormRef.value.show(null, "add");
};

// 修改表格行
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

// 删除表格行

async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await Delete({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

/**
 * 根据公司Id获取部门列表
 * @param companyId 公司Id
 */
async function getDepartmentList(companyId) {
  if (companyId != null && companyId != "") {
    const { data } = await GetTreeByDeptId({ deptId: companyId });
    departmentList.value = data || [];
  } else {
    departmentList.value = [];
  }
}

// 表格行选中回调resetForm
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

// 设置表格组件高度
const setTableHeight = () => {
  nextTick(() => {
    queryItemMaxNum.value =
      (queryFormRef.value.$el.clientWidth -
        8 -
        32 -
        queryFormRef.value.$el.children[
          queryFormRef.value.$el.children.length - 1
        ].clientWidth) /
      (queryFormRef.value.$el.children[0].clientWidth + 32);
    queryItemMaxNum.value = Math.floor(queryItemMaxNum.value);
    tableHeight.value =
      window.innerHeight - queryFormRef.value.$el.clientHeight - 230;
  });
};

// mounted周期函数
onMounted(async () => {
  onSearch();
  getStaffListNV();
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  setTableHeight();
});

// 窗口尺寸改变事件回调
window.onresize = function () {
  nextTick(() => {
    setTableHeight();
  });
};
</script>

<template>
  <div class="main">
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryForm"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      label-width="90px"
    >
      <el-form-item
        v-show="queryItemMaxNum >= 1 || !queryFold"
        label="所属公司"
        prop="CompanyId"
      >
        <el-cascader
          v-model="queryForm.CompanyId"
          filterable
          :options="rootDepartment"
          placeholder="请选择"
          class="w-100/100"
          clearable
          :props="selProps"
          :show-all-levels="false"
          @change="getDepartmentList"
        >
          <template #default="{ data }">
            <span>{{ data.fullName }}</span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 2 || !queryFold"
        label="部门"
        prop="DeptId"
      >
        <el-cascader
          v-model="queryForm.DeptId"
          clearable
          :options="departmentList"
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
        v-show="queryItemMaxNum >= 3 || !queryFold"
        label="姓名"
        prop="StaffId"
      >
        <el-select
          v-model="queryForm.StaffId"
          clearable
          placeholder="请选择"
          filterable
        >
          <el-option
            v-for="item in staffListNV"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 4 || !queryFold"
        label="开始时间"
        prop="StartDate"
      >
        <el-date-picker
          v-model="queryForm.StartDate"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 5 || !queryFold"
        label="结束时间"
        prop="EndDate"
      >
        <el-date-picker
          v-model="queryForm.EndDate"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 6 || !queryFold"
        label="关键词"
        prop="KeyWord"
      >
        <el-input
          v-model="queryForm.KeyWord"
          placeholder="车位号、车牌号"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('search')"
          :loading="requestLoading"
          @click="onSearch"
        >
          查询
        </el-button>
        <el-button :icon="useRenderIcon('refresh')" @click="handleReset">
          重置
        </el-button>
        <el-button type="text" @click="handleFold">
          <span v-show="queryFold">展开</span>
          <span v-show="!queryFold">折叠</span>
          <IconifyIconOffline :icon="!queryFold ? 'arrow-up' : 'arrow-down'" />
        </el-button>
      </el-form-item>
    </el-form>
    <TableProBar
      :title="title"
      :loading="requestLoading"
      :dataList="tableData"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-for="(item, index) in tableButtons"
          :key="index"
          :type="item.buttonType"
          :icon="useRenderIcon(item.buttonIcon)"
          @click="handleOperation(item.buttonClick)"
        >
          {{ item.buttonName }}
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          border
          :size="size"
          :height="tableHeight"
          highlight-current-row
          :data="tableData"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            align="center"
            width="60"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            label="序号"
            align="center"
            width="60"
          />
          <el-table-column
            label="公司名称"
            align="left"
            prop="companyName"
            min-width="120"
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
            label="姓名"
            width="100"
            align="center"
            prop="staffName"
            show-overflow-tooltip
          />
          <el-table-column
            label="车牌号"
            align="center"
            prop="carNumber"
            width="120"
            show-overflow-tooltip
          />
          <el-table-column
            label="车位号"
            align="left"
            prop="parkingSpaceNumber"
            width="120"
            show-overflow-tooltip
          />
          <el-table-column
            label="租赁开始日期"
            align="center"
            width="150"
            prop="startDate"
            :formatter="
              ({ startDate }) => {
                return startDate ? dayjs(startDate).format('YYYY-MM-DD') : '-';
              }
            "
          />
          <el-table-column
            label="租赁结束日期"
            align="center"
            width="150"
            prop="endDate"
            :formatter="
              ({ endDate }) => {
                return endDate ? dayjs(endDate).format('YYYY-MM-DD') : '-';
              }
            "
          />
          <el-table-column
            label="备注"
            align="center"
            prop="remark"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column
            label="附件"
            prop="leaseFile"
            width="120"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div v-if="row.leaseFile">
                <PreviewButton :srcList="[row.leaseFile]" :size="size" />
                <DownloadButton :srcList="[row.leaseFile]" :size="size" />
              </div> </template
          ></el-table-column>
          <TableColumOperation
            v-if="operationButtons().length > 0"
            :size="size"
            :operationButtons="operationButtons()"
            @operation="handleOperation"
          />
          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
        <el-pagination
          v-model:page-size="queryForm.pageSize"
          v-model:current-page="queryForm.pageIndex"
          class="flex justify-end mt-4"
          :small="size === 'small' ? true : false"
          :page-sizes="[10, 20, 30, 50, 100, 200]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalPage"
          @size-change="onSearch"
          @current-change="onSearch"
        />
      </template>
    </TableProBar>
    <FormDialog ref="dialogFormRef" @search="onSearch" />
    <ReadDialog ref="readDialogRef" :title="title" :width="771" :column="2" />
  </div>
</template>
