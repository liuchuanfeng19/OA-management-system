<script setup lang="ts">
import dayjs from "dayjs";
import { ref, onMounted, nextTick } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { DeleteApply, GetApplyList } from "@/api/project";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "ProjIncApply"
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);

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
//添加
function handleAdd() {
  dialogFormRef.value.show();
}

// //审批
function handleApproval(row) {
  dialogFormRef.value.show(row, "audit");
}
// 查看表格行
function handleQuery(row) {
  dialogFormRef.value.show(row, "read");
}

//编辑
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

//删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await DeleteApply({ id: row.id });
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
  const { data } = await GetApplyList(queryForm.value);
  dataList.value = data.data || [];
  totalPage.value = data.totalCount;
  loading.value = false;
}

//切换“折叠”与“展开”
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

function formatDatetime(dt) {
  return dayjs(dt).format("YYYY-MM-DD");
}

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
      label-width="70px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <!-- <el-form-item label="采购状态" prop="applyStatus">
        <el-select
          clearable
          v-model="queryForm.applyStatus"
          placeholder="请选择采购状态"
          ><el-option
            v-for="item in allapplyStatus"
            :key="item.value"
            :label="item.name"
            :value="item.value"
        /></el-select>
      </el-form-item> -->

      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="项目名称"
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
      title="收入申请列表"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'ProjIncApply.apply'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd"
        >
          申请
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
            label="申请人姓名"
            prop="staffName"
            width="120"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="申请部门"
            prop="deptName"
            width="150"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="项目名称"
            width="120"
            prop="projName"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            min-width="150"
            label="合同名称"
            prop="projContractName"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="本次收款金额"
            prop="amount"
            width="120"
            align="right"
          />
          <el-table-column
            label="收款进度"
            prop="progress"
            width="150"
            align="letf"
            show-overflow-tooltip
          />
          <el-table-column
            label="累计开票"
            prop="invoiceAmount"
            width="100"
            align="right"
          />
          <el-table-column
            label="收款内容"
            prop="content"
            width="100"
            align="left"
          />
          <el-table-column
            label="累计到款"
            prop="receiveAmount"
            width="150"
            align="right"
            show-overflow-tooltip
          />
          <el-table-column
            label="剩余合同金额"
            prop="leftContractAmout"
            width="150"
            align="right"
            show-overflow-tooltip
          />
          <el-table-column
            label="申请状态"
            prop="applyStatusExpr"
            width="150"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            label="申请时间"
            prop="applyTime"
            width="150"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDatetime(row.applyTime) }}
            </template>
          </el-table-column>

          <el-table-column
            v-auth="
              'ProjIncApply.query|ProjIncApply.edit|ProjIncApply.audi|ProjIncApply.delete'
            "
            fixed="right"
            label="操作"
            width="200"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'ProjIncApply.query'"
                :size="size"
                link
                type="primary"
                @click="handleQuery(scope.row)"
              >
                查看
              </el-button>
              <el-button
                v-auth="'ProjIncApply.edit'"
                :size="size"
                link
                type="primary"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'ProjIncApply.delete'"
                :size="size"
                link
                type="primary"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
              <el-button
                v-auth="'ProjIncApply.audit'"
                :size="size"
                link
                type="primary"
                :disabled="scope.row.canApprove == false"
                @click="handleApproval(scope.row)"
              >
                审批
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
