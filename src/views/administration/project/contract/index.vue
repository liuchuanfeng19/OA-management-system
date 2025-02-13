<script setup lang="ts">
import dayjs from "dayjs";
import { ref, onMounted, nextTick } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { GetContractList, DeleteContract, GetListNV } from "@/api/project";

defineOptions({
  name: "ProjectPersonBudget"
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const ProData = ref([]); //项目列表
const dialogFormRef = ref(null);

const formRef = ref<FormInstance>();
const queryForm = ref({
  keyword: "",
  pageIndex: 1,
  pageSize: 20
});
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//新增操作
const handleAdd = () => {
  dialogFormRef.value.show(null, "add");
};

// 查看表格行
function handleQuery(row) {
  if (row.type == "1") {
    dialogFormRef.value.show(row, "query");
  } else {
    dialogFormRef.value.show(row, "querySecond");
  }
}

// 修改表格行
function handleEdit(row) {
  if (row.type == "1") {
    dialogFormRef.value.show(row, "edit");
  } else {
    dialogFormRef.value.show(row, "editSecond");
  }
}

// 添加补充合同
function handleCreat(row) {
  dialogFormRef.value.show(row, "create");
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await DeleteContract({ id: row.id });
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

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data } = await GetContractList(queryForm.value);
  dataList.value = data.data || [];
  totalPage.value = data.totalCount;
  loading.value = false;
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

// function formatDatetime(dt) {
//   return dayjs(dt).format("YYYY-MM-DD");
// }

//获取项目名称
async function GetPro() {
  const { data } = await GetListNV();
  ProData.value = data || {};
}

//切换“折叠”与“展开”
// function handleFold() {
//   fold.value = !fold.value;
//   setTableHeight();
// }

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
onMounted(() => {
  GetPro();
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
      label-width="70px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <!-- <el-form-item label="项目名称" prop="projId">
        <el-select
          clearable
          v-model="queryForm.projId"
          placeholder="请选择项目名称"
        >
          <el-option
            v-for="item in ProData"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item> -->

      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="合同名称"
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
          搜索
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
      title="合同管理"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'ProjectContract.add'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd"
        >
          添加
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
            width="60"
            align="center"
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
            prop="projName"
            min-width="120"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="合同名称"
            min-width="120"
            prop="name"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="合同编号"
            min-width="120"
            prop="code"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="合同类型"
            width="120"
            prop="typeExpr"
            show-overflow-tooltip
            align="left"
          />

          <el-table-column
            label="工程造价(万元)"
            width="120"
            prop="projAmount"
            show-overflow-tooltip
            align="right"
          />
          <el-table-column
            label="拟派总监"
            width="120"
            prop="bidStaffName"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="合同金额(万元)"
            width="120"
            prop="contractAmount"
            show-overflow-tooltip
            align="right"
          />

          <el-table-column
            label="开工日期"
            prop="htStartTime	"
            width="120"
            align="center"
            :formatter="
              ({ htStartTime }) => {
                return htStartTime
                  ? dayjs(htStartTime).format('YYYY-MM-DD')
                  : '-';
              }
            "
          />
          <el-table-column
            label="竣工日期"
            prop="htEndTime	"
            width="120"
            align="center"
            :formatter="
              ({ htEndTime }) => {
                return htEndTime ? dayjs(htEndTime).format('YYYY-MM-DD') : '-';
              }
            "
          />

          <el-table-column
            v-auth="
              'ProjectContract.query|ProjectContract.edit|ProjectContract.delete|ProjectContract.addchild'
            "
            fixed="right"
            label="操作"
            width="230"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-if="scope.row.type == '1'"
                v-auth="'ProjectContract.addchild'"
                :size="size"
                link
                type="primary"
                @click="handleCreat(scope.row)"
              >
                补充合同
              </el-button>
              <el-button
                v-auth="'ProjectContract.query'"
                :size="size"
                link
                type="primary"
                @click="handleQuery(scope.row)"
              >
                查看
              </el-button>
              <el-button
                v-auth="'ProjectContract.edit'"
                :size="size"
                link
                type="primary"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'ProjectContract.delete'"
                :size="size"
                link
                type="primary"
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

    <DialogForm ref="dialogFormRef" @search="onSearch" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
