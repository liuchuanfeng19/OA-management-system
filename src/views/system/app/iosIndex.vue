<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";

import { getiOSAppUrls, importIOSUrl, deleteIOSUrl } from "@/api/appFile";
import { TableProBar } from "@/components/ReTable";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import DialogiOSForm from "./components/DialogiOSForm.vue";
defineOptions({
  name: "AppManageiOS"
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const queryForm = ref({
  isUsed: -1,
  pageIndex: 1,
  pageSize: 20
});
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const importLoading = ref(false);
const tableHeight = ref(0);
const dialogiOSFormRef = ref(null);
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteIOSUrl({ ids: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
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

function handleAdd() {
  dialogiOSFormRef.value.show(null, "add");
}
//导入
async function handleImport(options) {
  const data = new FormData();
  data.append("file", options.file);
  importLoading.value = true;
  await importIOSUrl(data).then(({ code, message }) => {
    if (code == 0) {
      ElMessage.success(message);
      onSearch();
    }
  });
  importLoading.value = false;
}

function handleEdit(row) {
  dialogiOSFormRef.value.show(row, "edit");
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data } = await getiOSAppUrls(queryForm.value);
  dataList.value = data.data || [];
  totalPage.value = data.totalCount;
  loading.value = false;
}
// 设置表格组件高度
const setTableHeight = () => {
  tableHeight.value = window.innerHeight - 230;
};
//mounted周期函数
onMounted(() => {
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
    <TableProBar
      title="APP列表"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-form
          ref="queryFormRef"
          :inline="true"
          :model="queryForm"
          class="bg-white dark:bg-bg_color w-100/100 simple-query-form"
          @keyup.enter="onSearch"
          @submit.prevent
        >
          <el-form-item label="是否已使用" prop="isUsed" class="!mr-5">
            <el-select
              v-model="queryForm.isUsed"
              filterable
              placeholder="全部"
              value-key=""
              style="width: 192px"
            >
              <el-option :key="-1" label="全部" :value="-1" />
              <el-option :key="1" label="已使用" :value="1" />
              <el-option :key="0" label="未使用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item class="!mr-1">
            <el-button
              plain
              type="primary"
              :icon="useRenderIcon('search')"
              :loading="loading"
              title="查询"
              @click="onSearch"
            />
          </el-form-item>
          <el-divider direction="vertical" />
        </el-form>
        <el-button
          v-auth="'AppManageiOS.add'"
          type="primary"
          :icon="useRenderIcon('add')"
          style="margin-right: 10px"
          @click="handleAdd"
        >
          添加
        </el-button>
        <el-upload
          action="#"
          accept=".xls,.xlsx"
          :http-request="handleImport"
          :multiple="false"
          name="file"
          :show-file-list="false"
          :loading="importLoading"
        >
          <el-button
            v-auth="'AppManageiOS.import'"
            :icon="useRenderIcon('import')"
            type="primary"
            >导入</el-button
          >
        </el-upload>
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
            align="left"
            width="60"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            type="index"
            :index="getIndex"
            label="序号"
            align="left"
            width="60"
          />
          <el-table-column
            align="left"
            label="软件名称"
            min-width="120px"
            prop="appName"
          />
          <el-table-column
            align="center"
            label="升级包的代码"
            min-width="120px"
            prop="downloadCode"
          />
          <el-table-column
            align="center"
            label="升级包的路径"
            min-width="120px"
            prop="downloadUrl"
            show-overflow-tooltip
          />
          <el-table-column align="center" label="是否使用" min-width="120px">
            <template #default="{ row }">
              <span v-if="row.isUsed == 1">已使用</span>
              <span v-else>未使用</span>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="备注"
            min-width="120px"
            prop="remark"
          />
          <el-table-column
            fixed="right"
            label="操作"
            width="150"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'AppManageiOS.edit'"
                :size="size"
                link
                type="primary"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'AppManageiOS.delete'"
                :size="size"
                link
                type="danger"
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
    <DialogiOSForm ref="dialogiOSFormRef" @search="onSearch" />
  </div>
</template>
