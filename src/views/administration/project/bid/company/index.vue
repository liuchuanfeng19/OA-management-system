<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { columns } from "./constant";
import { exportExcel } from "@/api/exportAll";
import { TableProBar } from "@/components/ReTable";
import FormDialog from "./components/FormDialog.vue";
import { getBidCompanyList, deleteBidCompany } from "@/api/bidCompany";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import ReadDialog from "@/components/ReadDialog";

defineOptions({
  name: "BidCompany"
});

const title = useRoute().meta.title as string;

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  keyword: ""
});
const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const dialogFormRef = ref(null); // 表单对话框组件实例
const readDialogRef = ref(null); // 表单对话框组件实例
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例

// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  getBidCompanyList(queryForm)
    .then(({ data }) => {
      tableData.value = data.data || [];
      totalPage.value = data.totalCount;
    })
    .catch(() => {
      tableData.value = [];
    })
    .finally(() => {
      requestLoading.value = false;
    });
}
//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
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
  dialogFormRef.value.show(null, "add");
};

// 查看表格行
function handleRead(row) {
  // dialogFormRef.value.show(row, "read");
  readDialogRef.value.show(row, columns);
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
      const { code, message } = await deleteBidCompany({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//更多操作1
const handleMore1 = _row => {};

//更多操作2
const handleMore2 = _row => {};

//导出
function handleExport() {
  const fileName = "员工导出";
  exportExcel("/api/Staff/Export?", fileName, queryForm);
}

// 表格行选中回调resetForm
function handleSelectionChange(_val) {}

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
    >
      <el-form-item
        v-show="queryItemMaxNum >= 1 || !queryFold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model.trim="queryForm.keyword"
          placeholder="单位名称"
          clearable
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
          v-auth="'BidCompany.add'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd"
        >
          添加
        </el-button>
        <el-button
          v-auth="'BidCompany.export'"
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
            label="单位名称"
            align="left"
            prop="bidCompanyName"
            min-width="200"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <el-text
                type="primary"
                class="cursor-pointer"
                @click="handleRead(row)"
              >
                {{ row.bidCompanyName }}
              </el-text>
            </template>
          </el-table-column>
          <el-table-column
            label="排序"
            width="150"
            align="right"
            prop="sortOrder"
          />
          <el-table-column
            label="备注"
            align="left"
            prop="remark"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            v-auth="
              'BidCompany.delete|BidCompany.edit|BidCompany.more1|BidCompany.more2'
            "
            fixed="right"
            label="操作"
            width="110"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'BidCompany.edit'"
                link
                type="primary"
                :size="size"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'BidCompany.delete'"
                link
                type="danger"
                :size="size"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
              <el-dropdown v-auth="'BidCompany.more1|BidCompany.more2'">
                <el-button
                  class="ml-3"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon('more')"
                />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button
                        v-auth="'BidCompany.more1'"
                        :disabled="scope.row.jobStatus < 4"
                        class="reset-margin !h-20px !text-gray-500"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon('menu')"
                        @click="handleMore1(scope.row)"
                      >
                        更多1
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button
                        v-auth="'BidCompany.more2'"
                        :disabled="scope.row.jobStatusExpr == '离职'"
                        class="reset-margin !h-20px !text-gray-500"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon('menu')"
                        @click="handleMore2(scope.row)"
                      >
                        更多2
                      </el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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
    <ReadDialog ref="readDialogRef" :title="title" :width="632" :column="3" />
    <FormDialog ref="dialogFormRef" @search="onSearch" />
  </div>
</template>
