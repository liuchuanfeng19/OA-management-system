<script setup lang="ts">
// import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { ref, onMounted, nextTick } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import DialogForm from "./components/DialogForm.vue";
import { TableProBar } from "@/components/ReTable";
import { GetLeaveApplyStatus } from "@/api/personnel";
import { GetLesseeList, DeleteLessee } from "@/api/builds";
import { userStaffStoreHook } from "@/store/modules/staff";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

const { getStaffListNV } = userStaffStoreHook();
defineOptions({
  name: "Leaseholder"
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const allLeaveStatus = ref([]); //审核状态
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const { staffListNV } = storeToRefs(userStaffStoreHook());

const queryForm = ref({
  staffId: "",
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
//删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await DeleteLessee({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//编辑
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

// 查看表格行
function handleQuery(row) {
  dialogFormRef.value.show(row, "query");
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

//切换“折叠”与“展开”
// function handleFold() {
//   fold.value = !fold.value;
//   setTableHeight();
// }

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data } = await GetLesseeList(queryForm.value);
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
//   return dayjs(dt).format("YYYY-MM-DD HH:mm");
// }

async function getLeaveStatus() {
  const { data } = await GetLeaveApplyStatus({ includeAll: false });
  allLeaveStatus.value = data;
}

//加载所有审核状态;
getLeaveStatus();
//租赁人员列表

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
  getStaffListNV();
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
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="租赁人"
        prop="staffId"
      >
        <el-select v-model="queryForm.staffId" placeholder="请选择" clearable>
          <el-option
            v-for="item in staffListNV"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="关键词" prop="keyword">
        <el-input
          v-model="queryForm.keyword"
          placeholder="租赁人"
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
      title="租赁人管理"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'Leaseholder.add'"
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
            label="租赁人"
            prop="name"
            width="120"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="手机号"
            prop="mobile"
            width="120"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="身份证号"
            prop="idCard"
            min-width="150"
            show-overflow-tooltip
            align="right"
          />
          <el-table-column
            label="身份证正面"
            width="180"
            align="center"
            prop="idCardFront"
          >
            <template #default="{ row }">
              <el-image
                :preview-teleported="true"
                style="width: 30px; height: 30px"
                :src="row.idCardFront"
                :preview-src-list="[row.idCardFront]"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="身份证反面"
            width="180"
            align="center"
            prop="idCardBack"
          >
            <template #default="{ row }">
              <el-image
                :preview-teleported="true"
                style="width: 30px; height: 30px"
                :src="row.idCardBack"
                :preview-src-list="[row.idCardBack]"
              />
            </template>
          </el-table-column>
          <!-- <el-table-column
            min-width="120"
            label="租赁房屋"
            prop="leaveTypeExpr"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="租赁房间名称"
            width="150"
            prop="mobile"
            show-overflow-tooltip
            align="right"
          /> -->

          <!-- <el-table-column
            label="创建时间"
            prop="startTime"
            width="150"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDatetime(row.startTime) }}
            </template>
          </el-table-column> -->

          <el-table-column
            v-auth="'Leaseholder.query|Leaseholder.edit|Leaseholder.delete'"
            fixed="right"
            label="操作"
            width="160"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'Leaseholder.query'"
                :size="size"
                link
                type="primary"
                @click="handleQuery(scope.row)"
              >
                查看
              </el-button>
              <el-button
                v-auth="'Leaseholder.edit'"
                :size="size"
                link
                type="primary"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'Leaseholder.delete'"
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
