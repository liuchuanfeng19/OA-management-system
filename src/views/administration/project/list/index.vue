<script setup lang="ts">
// import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { ref, onMounted, nextTick } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import router from "@/router";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { GetList, Delete, GetProjStatusNV } from "@/api/project";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();
defineOptions({
  name: "ProjectList"
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const ProStatusData = ref([]); //项目状态
const dialogFormRef = ref(null);
const { staffListNV } = storeToRefs(userStaffStoreHook());

const formRef = ref<FormInstance>();
const queryForm = ref({
  keyword: "",
  status: 1,
  dutyStaffId: "",
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
  dialogFormRef.value.show();
};

// 查看表格行
function handleQuery(row) {
  dialogFormRef.value.show(row, "query");
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
      const { code, message } = await Delete({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// 项目明细
function handledetails(row) {
  // dialogFormRef.value.show(row, "edit");
  router.push("/administration/project/details?id=" + row.id);
}

// 人员明细
function handleperson(row) {
  router.push("/administration/project/personal?id=" + row.id);
  // dialogFormRef.value.show(row, "edit");
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
  const { data } = await GetList(queryForm.value);
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

//获取项目状态
async function GetProStatus() {
  const { data } = await GetProjStatusNV({ includeAll: false });
  ProStatusData.value = data || {};
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
  getStaffListNV();
  GetProStatus();
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
      <!-- <el-form-item label="项目状态" prop="status">
        <el-select
          clearable
          v-model="queryForm.status"
          placeholder="请选择项目状态"
        >
          <el-option
            v-for="item in ProStatusData"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="负责人"
        prop="dutyStaffId"
      >
        <el-select
          v-model="queryForm.dutyStaffId"
          placeholder="请选择"
          clearable
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
        v-show="maxItemNum >= 2 || !fold"
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
      title="项目列表"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'ProjectList.add'"
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
            prop="name"
            width="120"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="负责人"
            width="120"
            prop="dutyStaffName"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="工程造价(万元)"
            min-width="120"
            prop="projAmount"
            show-overflow-tooltip
            align="center"
          />
          <el-table-column
            label="工程地点"
            prop="projAddress"
            width="120"
            show-overflow-tooltip
            align="center"
          />
          <el-table-column
            label="工程性质"
            prop="projNature"
            width="120"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="项目状态"
            width="120"
            prop="statusExpr"
            show-overflow-tooltip
            align="center"
          />

          <!-- <el-table-column
            label="合同开工日期"
            prop="htStartTime"
            width="180"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDatetime(row.htStartTime) }}
            </template>
          </el-table-column> -->

          <!-- <el-table-column
            label="合同竣工日期"
            prop="htEndTime"
            width="180"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDatetime(row.htEndTime) }}
            </template>
          </el-table-column> -->

          <el-table-column
            fixed="right"
            label="快捷跳转"
            width="180"
            align="center"
          >
            <template #default="scope">
              <el-button
                :size="size"
                link
                type="primary"
                @click="handledetails(scope.row)"
              >
                项目明细
              </el-button>
              <el-button
                :size="size"
                link
                type="primary"
                @click="handleperson(scope.row)"
              >
                人员明细
              </el-button>
            </template>
          </el-table-column>

          <el-table-column
            v-auth="'ProjectList.query|ProjectList.edit|ProjectList.delete'"
            fixed="right"
            label="操作"
            width="160"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'ProjectList.query'"
                :size="size"
                link
                type="primary"
                @click="handleQuery(scope.row)"
              >
                查看
              </el-button>
              <el-button
                v-auth="'ProjectList.edit'"
                :size="size"
                link
                type="primary"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'ProjectList.delete'"
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
