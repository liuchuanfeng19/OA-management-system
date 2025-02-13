<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, nextTick, onBeforeMount } from "vue";

import { columns } from "./constant";
import DialogForm from "./components/DialogForm.vue";
import { TableProBar } from "@/components/ReTable";
import { GetAccList } from "@/api/joinSignItem";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { FormInstance } from "element-plus";
import { GetListNVForApp } from "@/api/projectWinBid";
import { GetSupplyListNV } from "@/api/purchasing";
import { exportExcel } from "@/api/exportAll";
import { useGlobal } from "@pureadmin/utils";
import { getUserListByRoleCodeNew } from "@/api/user";
import { tableButtons, operationButtons } from "./constant";
import { TableColumOperation } from "@/components/TableColumOperation";
import ReadDialog from "@/components/ReadDialog";

const { $config } = useGlobal<GlobalPropertiesApi>();
const roleCodeStaffListMap = {
  purchasingSpeciaList: $config.RoleCodePurchasingSpecialist
};

defineOptions({
  name: "RecvDetail"
});

const title = useRoute().meta.title as string;

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const supplyList = ref([]); //申请状态
const formRef = ref<FormInstance>();
const readDialogRef = ref(null); // 表单对话框组件实例
const dialogFormRef = ref(null);
const projectList = ref([]);
const staffList = ref({
  purchasingSpeciaList: []
});

const queryForm = ref({
  projectId: "",
  supplyId: "",
  staffId: "",
  keyword: "",
  supplyContractCode: "",
  pageIndex: 1,
  pageSize: 20
});
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 查看表格行
function handleQuery(row) {
  readDialogRef.value.show(row, columns);
}

//导出
async function handleExport() {
  const fileName = "项目明细台账";
  exportExcel("/api/JoinSignItem/ExportAccList?", fileName, queryForm.value);
}

// current-change 改变时触发
function handleCurrentChange() {
  onSearch();
}

// pageSize 改变时触发
function handleSizeChange() {
  onSearch();
}

// 表格行选中回调
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  GetAccList(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        item.title = {};

        return item;
      });

      totalPage.value = data.totalCount;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
      dataList.value = [];
    });
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleExport":
      handleExport();
      break;
    case "handleQuery": //选择采购项
      handleQuery(row);
      break;
  }
}

// 根据部门Id获取员工列表
const getStaffListByDeptId = async (roleCode, staffType) => {
  const { data = {} } = await getUserListByRoleCodeNew({
    roleCode
  });
  staffList.value[staffType] = data || [];
};
function handlepurchasingSpeciachange(val) {
  const staff = staffList.value.purchasingSpeciaList.find(
    item => item.staffId == val
  );
  queryForm.value.staffId = staff.staffId;
  formRef.value.validateField("staffId", () => null);
}

onBeforeMount(() => {
  Object.keys(roleCodeStaffListMap).forEach(item => {
    getStaffListByDeptId(roleCodeStaffListMap[item], item);
  });
});

// //切换“折叠”与“展开”
// function handleFold() {
//   fold.value = !fold.value;
//   setTableHeight();
// }

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

//供应商NV;
async function getSupply() {
  const { data } = await GetSupplyListNV();
  supplyList.value = data;
}

getSupply();

// 获取中标项目NV数据
function getProjectList() {
  GetListNVForApp()
    .then(({ data }) => {
      projectList.value = data || [];
    })
    .catch(() => {
      projectList.value = [];
    });
}

getProjectList();

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
      label-width="90px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="项目名称"
        prop="projectId"
      >
        <el-select
          v-model="queryForm.projectId"
          placeholder="请选择"
          filterable
          style="width: 100%"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="供应商名称"
        prop="supplyId"
      >
        <el-select v-model="queryForm.supplyId" clearable placeholder="请选择"
          ><el-option
            v-for="item in supplyList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
        /></el-select>
      </el-form-item>

      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="采购负责人"
        prop="staffId"
      >
        <el-select
          v-model="queryForm.staffId"
          clearable
          placeholder="请选择"
          @change="handlepurchasingSpeciachange"
          ><el-option
            v-for="item in staffList.purchasingSpeciaList"
            :key="item.staffId"
            :label="item.staffName"
            :value="item.staffId"
        /></el-select>
      </el-form-item>

      <!-- <el-form-item
        label="合同编号"
        prop="supplyContractCode"
        v-show="maxItemNum >= 4 || !fold"
      >
        <el-input
          placeholder="请输入"
          v-model="queryForm.supplyContractCode"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item> -->
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
        <!-- <el-button type="text" @click="handleFold">
          <span v-show="fold">展开</span>
          <span v-show="!fold">折叠</span>
          <IconifyIconOffline :icon="!fold ? 'arrow-up' : 'arrow-down'" />
        </el-button> -->
      </el-form-item>
    </el-form>

    <TableProBar
      :title="title"
      :loading="loading"
      :dataList="dataList"
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
          :data="dataList"
          highlight-current-row
          :default-expand-all="false"
          row-key="path"
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
            :index="getIndex"
            label="序号"
            width="60"
            align="center"
          />

          <el-table-column
            label="项目名称"
            prop="projectFullName"
            min-width="150"
            align="letf"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <el-text
                type="primary"
                class="cursor-pointer"
                @click="handleQuery(row)"
              >
                {{ row.projectFullName }}
              </el-text>
            </template>
          </el-table-column>
          <el-table-column
            label="设备名称"
            prop="materialName"
            min-width="150"
            align="letf"
            show-overflow-tooltip
          />
          <el-table-column
            min-width="150"
            label="型号"
            prop="materialSpec"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="单位"
            prop="materialUnit"
            width="80"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            label="数量"
            prop="materialQty"
            width="80"
            align="right"
            show-overflow-tooltip
          />
          <el-table-column
            label="单价"
            prop="materialPrice"
            width="80"
            align="right"
            show-overflow-tooltip
          />
          <el-table-column
            label="小计"
            prop="subTotal"
            width="100"
            align="right"
            show-overflow-tooltip
          />
          <el-table-column
            label="供应商名称"
            prop="supplyName"
            width="120"
            align="left"
            show-overflow-tooltip
          />
          <!-- <el-table-column
            label="合计"
            prop="qty"
            width="120"
            align="right"
            show-overflow-tooltip
          /> -->
          <el-table-column
            label="采购负责人"
            prop="handStaffName"
            width="100"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="备注"
            prop="remark"
            min-width="150"
            align="left"
            show-overflow-tooltip
          />
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
    <ReadDialog ref="readDialogRef" :title="title" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
