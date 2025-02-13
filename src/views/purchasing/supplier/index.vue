<script setup lang="ts">
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import { ref, onMounted, nextTick } from "vue";

import { PreviewButton } from "@/components/PreviewButton";
import { DownloadButton } from "@/components/DownloadButton";
import { columns } from "./constant";
import DialogForm from "./components/DialogForm.vue";
import { TableProBar } from "@/components/ReTable";
import { GetList } from "@/api/purchasing";
import { getConfigListByKey } from "@/api/config";
import { getConfigNameValueListByKey } from "@/api/config";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { FormInstance } from "element-plus";
import { operationButtons } from "./constant";
import { TableColumOperation } from "@/components/TableColumOperation";
import ReadDialog from "@/components/ReadDialog";

defineOptions({
  name: "Supplier"
});

const title = useRoute().meta.title as string;

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const allSpplierTypes = ref([]); //所有供应商类型
const Spplierlevel = ref([]); //供应商级别
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const readDialogRef = ref(null); // 表单对话框组件实例

const queryForm = ref({
  keyword: "",
  catId: "",
  level: "",
  signStatus: "",
  pageIndex: 1,
  pageSize: 20
});
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 查看表格行
function handleQuery(row) {
  // dialogFormRef.value.show(row, "query");
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
  GetList(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        item.title = {};

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
  }
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

// function formatDatetime(dt) {
//   return dayjs(dt).format("YYYY-MM-DD");
// }

//获取所有供应商级别
function getspplierlevel() {
  getConfigNameValueListByKey({
    catalogKey: "OASupplyLevel"
  })
    .then(({ data }) => {
      Spplierlevel.value = data || [];
    })
    .catch(() => {
      Spplierlevel.value = [];
    });
}

getspplierlevel();

//供应商分类
async function getspplierTypes() {
  const { data } = await getConfigListByKey({
    catalogKey: "OASupplyCategory"
  });
  allSpplierTypes.value = data;
}

//加载所有供应商分类;
getspplierTypes();

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
      label-width="90px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="供应商类别"
        prop="catId"
      >
        <el-select v-model="queryForm.catId" placeholder="请选择" clearable
          ><el-option
            v-for="item in allSpplierTypes"
            :key="item.configKey"
            :label="item.configName"
            :value="item.configValue"
        /></el-select>
      </el-form-item>

      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="供应商级别"
        prop="level"
      >
        <el-select v-model="queryForm.level" placeholder="请选择" clearable
          ><el-option
            v-for="item in Spplierlevel"
            :key="item.value"
            :label="item.name"
            :value="item.value"
        /></el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="供应商名称"
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
          v-auth="'Supplier.add'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd"
        >
          添加
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
            label="供应商名称"
            prop="name"
            min-width="200"
            align="left"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <el-text
                type="primary"
                class="cursor-pointer"
                @click="handleQuery(row)"
              >
                {{ row.name }}
              </el-text>
            </template>
          </el-table-column>
          <el-table-column
            label="供应商类别"
            prop="catName"
            min-width="120"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="供应商级别"
            prop="level"
            width="100"
            show-overflow-tooltip
            align="center"
          />
          <el-table-column label="供应商销售员">
            <el-table-column
              label="姓名"
              prop="contact"
              width="100"
              align="left"
            />
            <el-table-column
              label="电话"
              prop="phone"
              width="150"
              align="center"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column label="供应商销售员领导">
            <el-table-column
              label="姓名"
              prop="contact2"
              width="100"
              align="left"
            />
            <el-table-column
              label="电话"
              prop="phone2"
              width="150"
              align="center"
              show-overflow-tooltip
            />
          </el-table-column>

          <!-- <el-table-column
            label="收款单位"
            prop="inCompany"
            min-width="150"
            show-overflow-tooltip
            align="left"
          /> -->
          <el-table-column
            min-width="120"
            label="收款开户行"
            prop="inBank"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="开户行账号"
            min-width="150"
            prop="inBankAccount"
            show-overflow-tooltip
            align="letf"
          />
          <el-table-column
            label="供应商备注"
            width="150"
            prop="comment"
            show-overflow-tooltip
            align="letf"
          />

          <el-table-column
            label="添加日期"
            prop="addDate"
            width="120"
            align="center"
            :formatter="
              ({ addDate }) => {
                return addDate ? dayjs(addDate).format('YYYY-MM-DD') : '-';
              }
            "
          />
          <el-table-column align="center" label="管理体系认证" min-width="120">
            <template #default="{ row }">
              <div v-if="row.authLicense && row.authLicense.length > 0">
                <PreviewButton :srcList="row.authLicense" :size="size" />
                <DownloadButton :srcList="row.authLicense" :size="size" />
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="营业执照" min-width="100">
            <template #default="{ row }">
              <div v-if="row.busiLicense && row.busiLicense.length > 0">
                <PreviewButton :srcList="row.busiLicense" :size="size" />
                <DownloadButton :srcList="row.busiLicense" :size="size" />
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="纳税人证明" min-width="100">
            <template #default="{ row }">
              <div v-if="row.taxLicense && row.taxLicense.length > 0">
                <PreviewButton :srcList="row.taxLicense" :size="size" />
                <DownloadButton :srcList="row.taxLicense" :size="size" />
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="企业信用公示" min-width="120">
            <template #default="{ row }">
              <div v-if="row.creditLicense && row.creditLicense.length > 0">
                <PreviewButton :srcList="row.creditLicense" :size="size" />
                <DownloadButton :srcList="row.creditLicense" :size="size" />
              </div>
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
    <ReadDialog ref="readDialogRef" :title="title" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
