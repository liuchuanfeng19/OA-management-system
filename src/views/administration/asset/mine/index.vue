<script setup lang="ts">
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import { ref, onMounted, nextTick } from "vue";
import DialogForm from "./components/DialogForm.vue";
import { TableProBar } from "@/components/ReTable";
import {
  MyAssetsList,
  ReturnBack,
  // GetAssetsStatusNV,
  GetTree,
  GetMyAssetsStatusNV
} from "@/api/asset";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { FormInstance, ElMessage } from "element-plus";
import { TableColumOperation } from "@/components/TableColumOperation";
import { operationButtons, columns } from "./constant";
import ReadDialog from "@/components/ReadDialog";

defineOptions({
  name: "MyAsset"
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
const treeData = ref([]);
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const readDialogRef = ref(null); // 表单对话框组件实例

const queryForm = ref({
  myAssetsStatus: "",
  catId: "",
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
//el-cascader props属性值
const selProps = {
  children: "children",
  label: "name",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

//归还
// function handleReturn(row) {
//   dialogFormRef.value.show(row, "return");
// }

async function handleReturn(row) {
  const { code, message } = await ReturnBack({ id: row.id });
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
}
//删除
// function handleDelete(row) {
//   dialogFormRef.value.show(row);
// }

// 查看表格行
function handleQuery(row) {
  readDialogRef.value.show(row, columns);
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
  MyAssetsList(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        item.title = {};

        //编辑
        item.disabled["handleReturn"] = !item.canReturnBack;
        item.title["handleReturn"] = !item.canReturnBack
          ? "当前物品不可归还"
          : "";

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
    case "handleQuery":
      handleQuery(row);
      break;
    case "handleReturn":
      handleReturn(row);
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
  return dayjs(dt).format("YYYY-MM-DD HH:mm");
}

//类别选项接口
async function assetsname() {
  const { data } = await GetTree();
  treeData.value = data || [];
}

async function getAssetsStatus() {
  // let { data } = await GetAssetsStatusNV({ includeAll: false });
  const { data } = await GetMyAssetsStatusNV({ includeAll: false });
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
  assetsname();
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
        label="资产状态"
        prop="myAssetsStatus"
      >
        <el-select
          v-model="queryForm.myAssetsStatus"
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
        <!-- <el-button
          v-auth="'MyAsset.add'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd"
        >
          入库
        </el-button> -->
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
            prop="assetsName"
            min-width="120"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="资产编号"
            prop="code"
            min-width="120"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="所属分类"
            width="150"
            prop="catName"
            show-overflow-tooltip
            align="left"
          />
          <!-- <el-table-column
            label="规格型号"
            width="150"
            prop="staffName"
            show-overflow-tooltip
            align="left"
          /> -->
          <el-table-column
            label="领用资产数量"
            width="120"
            prop="qty"
            show-overflow-tooltip
            align="right"
          />
          <el-table-column
            label="领用时间"
            prop="userTime"
            width="150"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDatetime(row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column
            label="是否需要归还"
            width="120"
            prop="isNeedReturn"
            show-overflow-tooltip
            align="center"
          >
            <template #default="{ row }">
              {{ row.isNeedReturn == true ? "需要" : "不需要" }}
            </template>
          </el-table-column>
          <el-table-column
            label="资产状态"
            width="100"
            prop="statusExpr"
            show-overflow-tooltip
            align="center"
          />
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
    <ReadDialog ref="readDialogRef" :title="title" :column="2" :width="640" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
