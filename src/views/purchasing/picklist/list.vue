<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessage } from "element-plus";

import {
  GetMyProjectListNV,
  GetUnCartList,
  BatchSaveOrUpdate
} from "@/api/reqCartItem";
import router from "@/router";
import { TableProBar } from "@/components/ReTable";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "PurchasList"
});

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  projectId: "",
  keyword: ""
}); //
const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const columnList = ref([]);
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例
const multipleSelection = ref([]); //列表选中数据存放
const IdData = ref([]);
const projectWinBidNV = ref([]); //中标项目NV
//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  GetUnCartList(queryForm)
    .then(({ data }) => {
      tableData.value = data.data || [];
      if (tableData.value.length > 0) {
        const item = tableData.value[0];
        columnList.value = item.items || [];
      }
      totalPage.value = data.totalCount;
      requestLoading.value = false;
    })
    .catch(() => {
      requestLoading.value = false;
      tableData.value = [];
    });
}

//获取中标项目列表NV;
function getProjectWinBidNV() {
  GetMyProjectListNV(queryForm)
    .then(({ data }) => {
      projectWinBidNV.value = data || [];
      if (projectWinBidNV.value.length > 0) {
        const item = projectWinBidNV.value[0];
        queryForm.projectId = item.id;
        onSearch();
      } else {
        requestLoading.value = false;
      }
    })
    .catch(() => {
      projectWinBidNV.value = [];
      requestLoading.value = false;
    });
  // if (data) {
  //   projectWinBidNV.value = data;
  // }
}
//切换“折叠”与“展开”
function handleFold() {
  queryFold.value = !queryFold.value;
  setTableHeight();
}

// 重置查询条件表单
const handleReset = () => {
  let projectId = "";
  if (projectWinBidNV.value.length > 0) {
    projectId = projectWinBidNV.value[0].id;
  }
  queryFormRef.value.resetFields();
  queryForm.projectId = projectId;
  onSearch();
};

//返回采购
function handleBack() {
  router.push("/purchasing/picklist");
}

//批量添加到下采单
async function handleAdd() {
  const param = {};
  param["projectId"] = queryForm.projectId;
  const sellContractItems = [];
  multipleSelection.value.forEach(item => {
    const obj = {};
    obj["id"] = item.id;
    const siteItems = [];
    if (item.items != null) {
      item.items.forEach(sitem => {
        const sobj = {};
        sobj["id"] = sitem.id;
        sobj["siteId"] = sitem.siteId;
        sobj["tmpQty"] = sitem.availableQty;
        sobj["receiveTime"] = "";
        siteItems.push(sobj);
      });
    }
    obj["siteItems"] = siteItems;
    sellContractItems.push(obj);
  });
  param["sellContractItems"] = sellContractItems;
  const { code, message } = await BatchSaveOrUpdate(param);
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
    handleBack();
  }
}

//单条添加到下采单
async function handleEdit(row) {
  console.log("row", row);
  const param = {};
  param["projectId"] = row.projectId;
  const sellContractItems = [];
  const obj = {};
  obj["id"] = row.id;
  const siteItems = [];
  if (row.items != null) {
    row.items.forEach(sitem => {
      const sobj = {};
      sobj["id"] = sitem.id;
      sobj["siteId"] = sitem.siteId;
      sobj["tmpQty"] = sitem.availableQty;
      sobj["receiveTime"] = "";
      siteItems.push(sobj);
    });
  }
  obj["siteItems"] = siteItems;
  sellContractItems.push(obj);

  param["sellContractItems"] = sellContractItems;
  const { code, message } = await BatchSaveOrUpdate(param);
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
  // let id = row.id.split(",");
  // const { code, message } = await BatchSaveOrUpdate(id);
  // if (code == 0) {
  //   ElMessage.success(message);
  //   onSearch();
  // }
}

// // 查看表格行
// function handleRead(row) {
//   formDialogref.value.show(row, "read");
// }

// 表格行选中回调resetForm
function handleSelectionChange(val) {
  multipleSelection.value = val;

  IdData.value = multipleSelection.value.map(item => {
    return item.id;
  });
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
  getProjectWinBidNV();
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
      label-width="90px"
    >
      <el-form-item
        v-show="queryItemMaxNum >= 1 || !queryFold"
        label="项目名称"
        prop="projectId"
      >
        <el-select
          v-model="queryForm.projectId"
          placeholder="请选择"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in projectWinBidNV"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        v-show="queryItemMaxNum >= 3 || !queryFold"
        label="关键字"
        prop="keyword"
      >
        <el-input
          v-model.trim="queryForm.keyword"
          placeholder="设备名称,规格参数"
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
      title="物资列表"
      :loading="requestLoading"
      :dataList="tableData"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          :disabled="multipleSelection.length <= 0"
          type="primary"
          :icon="useRenderIcon('shopping-cart')"
          @click="handleAdd"
        >
          加至下采项列表
        </el-button>
        <el-button type="primary" @click="handleBack()"> 返回 </el-button>
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
            type="selection"
            align="center"
            width="60"
            :selectable="({ materialQty, buyQty }) => materialQty - buyQty > 0"
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
            prop="projectFullName"
            min-width="300"
            show-overflow-tooltip
          />
          <el-table-column
            label="设备名称"
            min-width="200"
            align="left"
            prop="materialName"
          />
          <el-table-column
            label="规格型号"
            align="left"
            prop="materialSpec"
            min-width="200"
          />
          <!-- <el-table-column
            label="参数要求"
            min-width="150"
            align="left"
            prop="columnRight"
          /> -->
          <el-table-column
            label="单位"
            align="center"
            prop="materialUnit"
            width="150"
          />
          <el-table-column
            label="合同数量"
            align="right"
            prop="materialQty"
            width="150"
          />
          <el-table-column
            label="已采数量"
            align="right"
            prop="approvedQty"
            width="150"
          />
          <el-table-column
            label="中标单位"
            align="left"
            prop="winBidCompanyName"
            min-width="200"
          />
          <el-table-column
            v-for="(item, idx) in columnList"
            :key="item.id"
            :label="item.siteName"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <span>{{ row.items[idx].materialQty }}</span>
            </template>
          </el-table-column>
          <el-table-column label="采购状态" align="center" min-width="120">
            <template #default="{ row }">
              {{ row.materialQty - row.buyQty == 0 ? "已采完" : "未采完" }}
            </template>
          </el-table-column>

          <el-table-column fixed="right" label="操作" width="80" align="center">
            <template #default="scope">
              <!-- <el-button
                :size="size"
                @click="handleRead(scope.row)"
                link
                type="primary"
              >
                查看
              </el-button> -->
              <el-button
                :disabled="scope.row.materialQty - scope.row.buyQty == 0"
                link
                type="primary"
                :size="size"
                @click="handleEdit(scope.row)"
              >
                添加
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
    <FormDialog ref="formDialogref" @search="onSearch" />
  </div>
</template>
