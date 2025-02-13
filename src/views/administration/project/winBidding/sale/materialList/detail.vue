<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance } from "element-plus";

import { emitter } from "@/utils/mitt";
import { exportExcel } from "@/api/exportAll";
import { TableProBar } from "@/components/ReTable";
import FormDialog from "./components/FormDialog.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { getListForAttachDetail } from "@/api/sellContractItem";

defineOptions({
  name: "ExamplePage"
});

const route = useRoute();
// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  ...route.query,
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
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例

// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  getListForAttachDetail({ ...route.query, ...queryForm })
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
  dialogFormRef.value.show(row, "read");
}

// 修改表格行
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

// // 删除表格行
async function handleDelete(_row) {
  // ElMessageBox.confirm("确定要删除吗?", "提示", {
  //   confirmButtonText: "确定",
  //   cancelButtonText: "取消",
  //   type: "warning"
  // })
  //   .then(async () => {
  //     const { code, message } = await deleteExample({ id: _row.id });
  //     if (code==0) {
  //       ElMessage.success(message);
  //       onSearch();
  //     }
  //   })
  //   .catch(() => {});
}

//更多操作1
const handleMore1 = _row => {};

//更多操作2
const handleMore2 = _row => {};

//导出
function handleExport() {
  const fileName = "物资合同清单明细";
  exportExcel("/api/SellContractItem/Export?", fileName, queryForm);
}

// 表格行选中回调resetForm
function handleSelectionChange(_val) {}

const handleBack = () => {
  emitter.emit("closeTag", {
    routeName: route.name as string,
    query: route.query,
    targetPath: "/administration/project/winBidding/sale/materialList"
  });
};

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
        label="物资名称"
        prop="keyword"
      >
        <el-input v-model.trim="queryForm.keyword" placeholder="" clearable />
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
      title="物资明细列表"
      :loading="requestLoading"
      :dataList="tableData"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'ExamplePage.add'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd"
        >
          添加
        </el-button>
        <el-button
          type="primary"
          :icon="useRenderIcon('export')"
          @click="handleExport()"
        >
          导出
        </el-button>
        <el-button
          type="primary"
          :icon="useRenderIcon('arrow-left-line')"
          @click="handleBack()"
        >
          返回
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
            label="序号"
            align="center"
            width="60"
          />
          <el-table-column
            label="物资名称"
            align="left"
            prop="materialName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="规格型号"
            align="left"
            prop="materialSpec"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="单位"
            align="center"
            prop="materialUnit"
            width="150"
          />
          <el-table-column
            label="销售单价"
            width="150"
            align="right"
            prop="materialPrice"
          />
          <el-table-column
            label="数量"
            width="150"
            align="right"
            prop="materialQty"
          />
          <el-table-column
            v-if="false"
            label="下采单申请中数量"
            width="150"
            align="right"
            prop="approvingQty"
          />
          <el-table-column
            v-if="false"
            label="下采单审核通过数量"
            width="160"
            align="right"
            prop="approvedQty"
          />
          <el-table-column
            label="已采数量"
            width="150"
            align="right"
            prop="buyQty"
          />
          <el-table-column
            label="未采数量"
            width="150"
            align="right"
            prop="unBuyQty"
          />
          <el-table-column
            v-if="false"
            label="开票申请中数量"
            width="150"
            align="right"
            prop="invoApprovingQty"
          />
          <el-table-column
            label="已开票数量"
            width="150"
            align="right"
            prop="invoApprovedQty"
          />
          <el-table-column
            label="未开票数量"
            width="150"
            align="right"
            prop="unInvoApprovedQty"
          />
          <el-table-column
            label="已开票金额"
            width="150"
            align="right"
            prop="invoApprovedTotal"
          />
          <el-table-column
            label="未开票金额"
            width="150"
            align="right"
            prop="unInvoApprovedTotal"
          />
          <el-table-column
            v-auth="
              'ExamplePage.delete|ExamplePage.edit|ExamplePage.more1|ExamplePage.more2'
            "
            fixed="right"
            label="操作"
            width="200"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'ExamplePage.query'"
                :size="size"
                link
                type="primary"
                @click="handleRead(scope.row)"
              >
                查看
              </el-button>
              <el-button
                v-auth="'ExamplePage.edit'"
                link
                type="primary"
                :size="size"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'ExamplePage.delete'"
                link
                type="primary"
                :size="size"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
              <el-dropdown v-auth="'ExamplePage.more1|ExamplePage.more2'">
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
                        v-auth="'ExamplePage.more1'"
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
                        v-auth="'ExamplePage.more2'"
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
    <FormDialog ref="dialogFormRef" @search="onSearch" />
  </div>
</template>
