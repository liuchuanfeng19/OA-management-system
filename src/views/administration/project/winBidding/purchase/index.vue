<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessage } from "element-plus";

import { exportExcel } from "@/api/exportAll";
import { TableProBar } from "@/components/ReTable";
import FormDialog from "./components/FormDialog.vue";
import { getExampleList, deleteExample } from "@/api/example";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "PurchasingModule"
});

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  projectName: ""
});
const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const projectOptions = ref([]); // 项目列表数据
const formDialogRef = ref(null); // 表单对话框组件实例
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例

// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  getExampleList(queryForm)
    .then(data => {
      tableData.value = data.data || [];
      totalPage.value = data.totalCount;
      requestLoading.value = false;
    })
    .catch(() => {
      requestLoading.value = false;
      tableData.value = [
        {
          projectName: "项目1",
          projectShortName: "项目立项简称1",
          file1: "",
          file2: "",
          file3: "",
          file4: ""
        },
        {
          projectName: "项目2",
          projectShortName: "项目立项简称2",
          file1: "",
          file2: "",
          file3: "",
          file4: ""
        }
      ];
    });
}
//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 获取项目列表数据
function getProjectList() {
  setTimeout(() => {
    projectOptions.value = [
      {
        projectId: 1,
        projectName: "项目1",
        projectShortName: "项目立项简称1"
      },
      {
        projectId: 2,
        projectName: "项目2",
        projectShortName: "项目立项简称2"
      }
    ];
  }, 2000);
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

//新增操作
const handleAdd = () => {
  formDialogRef.value.show(null, "add");
};

// 查看表格行
function handleRead(row) {
  formDialogRef.value.show(row, "read");
}

// 修改表格行
function handleEdit(row) {
  formDialogRef.value.show(row, "edit");
}

// 删除表格行
async function handleDelete(row) {
  const { code, message } = await deleteExample({ id: row.id });
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
}

//导出
function handleExport() {
  const fileName = "员工导出";
  exportExcel("/api/Staff/Export?", fileName, queryForm);
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
  getProjectList();
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
      label-width="68px"
    >
      <el-form-item
        v-show="queryItemMaxNum >= 1 || !queryFold"
        label="项目名称"
        prop="projectName"
      >
        <el-select
          v-model="queryForm.projectName"
          placeholder="请选择"
          clearable
          filterable
          :style="{ width: '100%' }"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.projectId"
            :label="item.projectName"
            :value="item.projectName"
          />
        </el-select>
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
      title="投标项目信息表"
      :loading="requestLoading"
      :dataList="tableData"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'PurchasingModule.add'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd"
        >
          添加
        </el-button>
        <el-button
          v-auth="'PurchasingModule.export'"
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
          :data="tableData"
          highlight-current-row
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
            align="center"
            width="60"
          />
          <el-table-column
            label="项目名称"
            align="left"
            prop="projectName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="项目立项简称"
            align="left"
            prop="projectShortName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="下采单"
            align="center"
            prop="file1"
            min-width="150"
          >
            <template #default>
              <el-button link type="primary" :size="size">预览</el-button>
              <el-button link type="primary" :size="size">下载</el-button>
            </template>
          </el-table-column>
          <el-table-column
            label="合同"
            align="center"
            prop="file2"
            min-width="150"
          >
            <template #default>
              <el-button link type="primary" :size="size">预览</el-button>
              <el-button link type="primary" :size="size">下载</el-button>
            </template>
          </el-table-column>
          <el-table-column
            label="发票、入库单"
            align="center"
            prop="file3"
            min-width="150"
          >
            <template #default>
              <el-button link type="primary" :size="size">预览</el-button>
              <el-button link type="primary" :size="size">下载</el-button>
            </template>
          </el-table-column>
          <el-table-column
            label="发货签收单"
            align="center"
            prop="file4"
            min-width="200"
          >
            <template #default>
              <el-button link type="primary" :size="size">预览</el-button>
              <el-button link type="primary" :size="size">下载</el-button>
            </template>
          </el-table-column>
          <el-table-column
            v-auth="
              'PurchasingModule.delete|PurchasingModule.edit|PurchasingModule.more1|PurchasingModule.more2'
            "
            fixed="right"
            label="操作"
            width="160"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'PurchasingModule.query'"
                :size="size"
                link
                type="primary"
                @click="handleRead(scope.row)"
              >
                查看
              </el-button>
              <el-button
                v-auth="'PurchasingModule.edit'"
                link
                type="primary"
                :size="size"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'PurchasingModule.delete'"
                link
                type="primary"
                :size="size"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
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
    <FormDialog
      ref="formDialogRef"
      :projectOptions="projectOptions"
      @search="onSearch"
    />
  </div>
</template>
