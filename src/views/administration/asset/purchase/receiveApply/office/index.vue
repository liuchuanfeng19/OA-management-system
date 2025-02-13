<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessageBox, ElMessage } from "element-plus";
import dayjs from "dayjs";
import { exportExcel } from "@/api/exportAll";
import { TableProBar } from "@/components/ReTable";
import FormDialog from "./components/FormDialog.vue";
import {
  getListOfficeStuff,
  OfficeStuffDelete,
  ReturnBackOfficeStuff,
  getOfficeStuff
} from "@/api/officeStuff";
import { emitter } from "@/utils/mitt";
import { getListNVV2 } from "@/api/officeObject";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { TableColumOperation } from "@/components/TableColumOperation";
import { tableButtons, operationButtons, columns } from "./constant";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { storeToRefs } from "pinia";
import ReadDialog from "@/components/ReadDialog";

defineOptions({
  name: "officeApply"
});
const route = useRoute();
const title = route.meta.title as string;

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  ayDeptId: "",
  officeObjectId: ""
});

const { departmentTree } = storeToRefs(userDepartmentStoreHook());
const { getDepartmentTree } = userDepartmentStoreHook();
//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: false
};

const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const dialogFormRef = ref(null); // 表单对话框组件实例
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例
const officeList = ref([]);
const readDialogRef = ref(null); // 表单对话框组件实例

// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  getListOfficeStuff(queryForm)
    .then(({ data }) => {
      const list = data.data || [];
      tableData.value = list.map(item => {
        item.disabled = {};
        item.title = {};
        //归还
        item.disabled["handleReturn"] = !item.canReturn;
        item.title["handleReturn"] = !item.canReturn ? "当前数据不可归还" : "";
        //编辑
        item.disabled["handleEdit"] = !item.canEdit;
        item.title["handleEdit"] = !item.canEdit ? "当前数据不可编辑" : "";
        //删除
        item.disabled["handleDelete"] = !item.canDel;
        item.title["handleDelete"] = !item.canDel ? "当前数据不可删除" : "";
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
  onSearch();
};

//操作按钮
function handleOperation(functionName, row?) {
  switch (functionName) {
    case "handleApply":
      handleApply();
      break;
    case "handleExport":
      handleExport();
      break;
    case "handleRead":
      getOfficeStuff({
        id: row.id
      }).then(({ data }) => {
        readDialogRef.value.show(data, columns);
      });
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleAudit":
      handleAudit(row);
      break;
    case "handleReturn":
      handleReturn(row);
      break;
  }
}

//申请操作
const handleApply = () => {
  dialogFormRef.value.show(null, "apply");
};

// 审批
function handleAudit(row) {
  dialogFormRef.value.show(row, "audit");
}

// 修改表格行
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

//设备NV列表
async function getOfficeList() {
  const { data } = await getListNVV2();
  officeList.value = data || [];
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await OfficeStuffDelete({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// 归还
async function handleReturn(row) {
  ElMessageBox.confirm("确定要归还吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await ReturnBackOfficeStuff({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//导出
function handleExport() {
  const fileName = "办公设备领用";
  exportExcel("/api/OfficeStuff/Export?", fileName, queryForm);
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
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  onSearch();
  getOfficeList();
  setTableHeight();
});

// 窗口尺寸改变事件回调
window.onresize = function () {
  nextTick(() => {
    setTableHeight();
  });
};

emitter.on("onAuditStatusEmitter", menuName => {
  if (menuName.find(item => item == route.name)) {
    onSearch();
  }
});
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
        label="设备名称"
        prop="officeObjectId"
      >
        <el-select
          v-model="queryForm.officeObjectId"
          filterable
          :style="{ width: '100%' }"
        >
          <el-option
            v-for="item in officeList"
            :key="item.id"
            :label="item.assetsName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 2 || !queryFold"
        label="领用部门"
        prop="ayDeptId"
      >
        <el-cascader
          v-model="queryForm.ayDeptId"
          clearable
          :options="departmentTree"
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
            fixed="left"
            label="设备名称"
            align="left"
            prop="assetsName"
            min-width="120"
            show-overflow-tooltip
          />
          <el-table-column
            label="设备编号"
            width="150"
            align="left"
            prop="assetsCode"
            show-overflow-tooltip
          />
          <el-table-column
            label="型号/参数"
            align="left"
            prop="assetsSpec"
            width="120"
            show-overflow-tooltip
          />
          <el-table-column
            label="价值"
            align="right"
            prop="assetsValue"
            width="100"
            show-overflow-tooltip
          />
          <el-table-column
            label="数量"
            align="right"
            prop="qty"
            width="80"
            show-overflow-tooltip
          />
          <el-table-column
            label="管理员"
            align="center"
            prop="adminStaffName"
            width="100"
            show-overflow-tooltip
          />

          <el-table-column
            label="存放位置"
            align="left"
            prop="ayPlace"
            min-width="150"
            show-overflow-tooltip
          />

          <el-table-column
            label="领用人"
            width="100"
            align="center"
            prop="ayStaffName"
            show-overflow-tooltip
          />
          <el-table-column
            label="领用部门"
            width="120"
            align="left"
            prop="ayDeptName"
            show-overflow-tooltip
          />

          <el-table-column
            label="领用时间"
            prop="ayTime"
            width="120"
            align="center"
            show-overflow-tooltip
            :formatter="
              ({ ayTime }) => {
                return ayTime ? dayjs(ayTime).format('YYYY-MM-DD') : '-';
              }
            "
          />
          <el-table-column
            label="归还时间"
            prop="ayReturnTime"
            width="120"
            align="center"
            show-overflow-tooltip
            :formatter="
              ({ ayReturnTime }) => {
                return ayReturnTime
                  ? dayjs(ayReturnTime).format('YYYY-MM-DD')
                  : '-';
              }
            "
          />
          <el-table-column
            label="状态"
            align="center"
            prop="stateName"
            min-width="80"
            show-overflow-tooltip
          />
          <el-table-column
            label="备注"
            align="center"
            prop="remark"
            min-width="150"
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
    <ReadDialog ref="readDialogRef" :title="title" :column="2" :width="640" />
  </div>
</template>
