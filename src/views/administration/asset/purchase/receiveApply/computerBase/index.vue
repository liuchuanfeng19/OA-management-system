<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessageBox, ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { exportExcel } from "@/api/exportAll";
import { TableProBar } from "@/components/ReTable";
import FormDialog from "./components/FormDialog.vue";
import { ComputerGetList, ComputerDelete, ComputerGet } from "@/api/computer";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { TableColumOperation } from "@/components/TableColumOperation";
import { tableButtons, operationButtons, columns } from "./constant";
import { userDepartmentStoreHook } from "@/store/modules/department";
import ReadDialog from "@/components/ReadDialog";

defineOptions({
  name: "computerBase"
});

const title = useRoute().meta.title as string;

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  name: "",
  belongCompanyId: ""
});

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: false
};

const { getRootDeptList } = userDepartmentStoreHook();
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());

const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const dialogFormRef = ref(null); // 表单对话框组件实例

const requestLoading = ref(true); // 请求加载状态
const readDialogRef = ref(null); // 表单对话框组件实例
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例

// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  ComputerGetList(queryForm)
    .then(({ data }) => {
      const list = data.data || [];
      tableData.value = list.map(item => {
        item.disabled = {};
        item.title = {};

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
    case "handleExport":
      handleExport();
      break;
    case "handleExportOne":
      handleExportOne(row);
      break;
    case "handleRead":
      ComputerGet({
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
  }
}

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
      const { code, message } = await ComputerDelete({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//导出
function handleExport() {
  const fileName = "计算机列表";
  exportExcel("/api/Computer/Export?", fileName, queryForm);
}

//导出单条
function handleExportOne(row) {
  const fileName = "计算机基本数据";
  const rowid = row.id;
  const id = ref({
    id: rowid
  });
  exportExcel("/api/Computer/ExportOne?", fileName, id.value);
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
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  onSearch();
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
        label="设备归属"
        prop="belongCompanyId"
      >
        <el-cascader
          v-model="queryForm.belongCompanyId"
          clearable
          :options="rootDepartment"
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
        v-show="queryItemMaxNum >= 2 || !queryFold"
        label="设备名称"
        prop="name"
      >
        <el-input v-model.trim="queryForm.name" placeholder="请输入" />
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
            label="设备归属"
            prop="belongCompanyName"
            min-width="170"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            fixed="left"
            label="设备名称"
            prop="name"
            width="100"
            show-overflow-tooltip
            align="left"
          />

          <el-table-column
            fixed="left"
            label="设备编号"
            min-width="170"
            prop="code"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column label="详细参数">
            <el-table-column
              width="120"
              label="设备品牌"
              prop="brand"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              label="型号"
              width="100"
              prop="spec"
              show-overflow-tooltip
              align="left"
            />
            <el-table-column
              label="类型"
              width="100"
              prop="deviceType"
              show-overflow-tooltip
              align="left"
            />
            <el-table-column label="详细配置">
              <el-table-column
                label="机箱"
                width="100"
                prop="box"
                show-overflow-tooltip
                align="left"
              />
              <el-table-column
                width="100"
                label="主板"
                prop="board"
                align="left"
                show-overflow-tooltip
              />
              <el-table-column
                label="内存"
                prop="memory"
                width="100"
                align="left"
                show-overflow-tooltip
              />
              <el-table-column
                label="硬盘"
                prop="hardDisk"
                width="100"
                align="left"
                show-overflow-tooltip
              />
              <el-table-column
                width="100"
                label="显示器"
                prop="screen"
                align="left"
                show-overflow-tooltip
              />
              <el-table-column
                label="键盘"
                prop="keyboard"
                width="100"
                align="left"
                show-overflow-tooltip
              />
              <el-table-column
                label="鼠标"
                prop="mouse"
                width="100"
                align="left"
                show-overflow-tooltip
              />
              <el-table-column
                width="100"
                label="MAC"
                prop="mac"
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
            </el-table-column>
          </el-table-column>

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
