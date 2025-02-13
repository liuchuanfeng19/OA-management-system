<script setup lang="ts">
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import { ref, onMounted, nextTick } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import DialogBroken from "./components/DialogBroken.vue";
import { tableButtons, operationButtons } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { TableColumOperation } from "@/components/TableColumOperation";
import { GetList, DeleteAsset, GetAssetsStatusNV, GetTree } from "@/api/asset";
import ReadDialog from "@/components/ReadDialog";
import { columns } from "./constant";

defineOptions({
  name: "AssetList"
});

const title = useRoute().meta.title as string;

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const allAssetsStatus = ref([]); //资产状态
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const dialogBrokenRef = ref(null);
const treeData = ref([]);
const readDialogRef = ref(null); // 表单对话框组件实例

const queryForm = ref({
  keyword: "",
  catId: "",
  assetsStatus: "",
  pageIndex: 1,
  pageSize: 20
});
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//el-cascader props属性值
const selProps = {
  children: "children",
  label: "name",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

//类别选项接口
async function assetsname() {
  const { data } = await GetTree();
  treeData.value = data || [];
}

//添加
function handleAdd() {
  dialogFormRef.value.show();
}

//编辑
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
      const { code, message } = await DeleteAsset({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}
//申请
function handleApproval(row) {
  dialogFormRef.value.show(row, "apply");
}
// 查看表格行
function handleQuery(row) {
  readDialogRef.value.show(row, columns);
}

// 报废
function handleBroke(row) {
  dialogBrokenRef.value.show(row, "broke");
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
  GetList(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        item.title = {};

        //申请
        item.disabled["handleApproval"] = item.finalQty == "0";
        item.title["handleApproval"] =
          item.finalQty == "0" ? "当前数据不可申请" : "";

        return item;
      });

      totalPage.value = data.totalCount;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
      dataList.value = [];
    });
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handleBroke":
      handleBroke(row);
      break;
    case "handleQuery":
      handleQuery(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleApproval":
      handleApproval(row);
      break;
  }
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

//切换“折叠”与“展开”
// function handleFold() {
//   fold.value = !fold.value;
//   setTableHeight();
// }

function formatDatetime(dt) {
  return dayjs(dt).format("YYYY-MM-DD");
}

async function getAssetsStatus() {
  // let { data } = await GetAssetsStatusNV({ includeAll: false });
  const { data } = await GetAssetsStatusNV({ includeAll: false });
  allAssetsStatus.value = data;
}

//加载所有资产状态;
getAssetsStatus();

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
  assetsname();
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
        label="资产状态"
        prop="assetsStatus"
      >
        <el-select
          v-model="queryForm.assetsStatus"
          clearable
          placeholder="请选择"
          ><el-option
            v-for="item in allAssetsStatus"
            :key="item.value"
            :label="item.name"
            :value="item.value"
        /></el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="资产类别"
        prop="catId"
      >
        <el-cascader
          v-model="queryForm.catId"
          clearable
          :options="treeData"
          placeholder="请选择"
          class="w-100/100"
          :props="selProps"
          :show-all-levels="false"
        >
          <template #default="{ data }">
            <span>{{ data.name }}</span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="资产名称"
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
      :title="title"
      :loading="loading"
      :dataList="dataList"
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
            label="资产名称"
            prop="name"
            min-width="100"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="资产编号"
            prop="code"
            width="150"
            show-overflow-tooltip
            align="left"
          >
            <template #default="{ row }">
              {{ row.code ? row.code : "-" }}
            </template>
          </el-table-column>
          <el-table-column
            label="资产类别"
            width="120"
            prop="catName"
            show-overflow-tooltip
            align="left"
          />
          <!-- <el-table-column
            width="120"
            label="规格型号"
            prop="specExpr"
            align="left"
            show-overflow-tooltip
          /> -->
          <el-table-column
            label="库存数量"
            width="100"
            prop="finalQty"
            show-overflow-tooltip
            align="right"
          />
          <el-table-column
            label="已使用数量"
            width="100"
            prop="usedQty"
            show-overflow-tooltip
            align="right"
          />
          <el-table-column
            label="总库存量"
            width="100"
            prop="qty"
            show-overflow-tooltip
            align="right"
          />
          <el-table-column
            width="100"
            label="责任人"
            prop="dutyStaffName"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="存放地点"
            prop="storeAddress"
            min-width="150"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="状态"
            prop="statusExpr"
            width="80"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            label="购买时间"
            prop="buyTime"
            width="100"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ formatDatetime(row.buyTime) }}
            </template>
          </el-table-column>
          <el-table-column
            label="资产图片"
            width="100"
            align="center"
            prop="img"
          >
            <template #default="{ row }">
              <el-image
                :preview-teleported="true"
                style="width: 30px; height: 30px"
                :src="row.img[0]"
                :preview-src-list="row.img"
                :initial-index="4"
                fit="cover"
              />
            </template>
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
    <DialogBroken ref="dialogBrokenRef" @search="onSearch" />
    <ReadDialog ref="readDialogRef" :title="title" :column="2" :width="640" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
