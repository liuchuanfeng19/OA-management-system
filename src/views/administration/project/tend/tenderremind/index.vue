<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, nextTick, reactive, watch } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import {
  GetInList,
  DeleteIn,
  getBiddingBuyMethod,
  getBiddingNoticeType,
  GetTreeList,
  GetBiddingStatus,
  UpdateBiddingStatus
} from "@/api/bidding";
import { exportExcel } from "@/api/exportAll";
import ReadDialog from "@/components/ReadDialog";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { regionData } from "element-plus-china-area";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { tableButtons, operationButtons, columns } from "./constant";
import { TableColumOperation } from "@/components/TableColumOperation";
import { useGlobal } from "@pureadmin/utils";
import { getUserListByRoleCodeNew } from "@/api/user";

const route = useRoute();
const title = useRoute().meta.title as string;

const { $config } = useGlobal<GlobalPropertiesApi>();
const roleCodeStaffListMap = {
  busiStaffList: $config.RoleCodeBusinessAssistant
};

watch(
  () => route.name,
  newVal => {
    if (newVal == "TenderRemind") {
      nextTick(() => {
        setTimeout(() => {
          onSearch();
        }, 0);
      });
    }
  }
);

defineOptions({
  name: "TenderRemind"
});

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const form = reactive({
  keyword: "",
  areaCode: [],
  startTime: "",
  endTime: "",
  buyMethod: "",
  noticeType: "",
  buySubjectId: "",
  qualiTypeIdExpr: "",
  biddingStatus: "",
  startAmount: 0,
  endAmount: 500000000,
  busiStaffId: "",
  pageIndex: 1,
  pageSize: 20
});

const staffList = ref({
  busiStaffList: []
});
const dataList = ref([]);
const totalPage = ref(0);
const fold = ref(true);
const maxItemNum = ref(1);
// const INITIAL_DATA = {};
// const addVisible = ref(false);
const tableHeight = ref(0);
// const formData = ref({ ...INITIAL_DATA });
const formRef = ref<FormInstance>();
const requestLoading = ref(true); // 请求加载状态
const dialogFormRef = ref(null);
const readDialogRef = ref(null); // 表单对话框组件实例
const noticeTypeList = ref([]);
const buyMethodList = ref([]);
const biddingStatusType = ref([]);
const treeData = ref([]); //采购主体树
//el-cascader props属性值
const selProps = {
  children: "children",
  label: "subjectName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

//省市区三级联动
function handleChange(_value) {}

function handleSelectionChange(_val) {}

// 搜索获取表格数据
async function onSearch() {
  requestLoading.value = true;
  const { areaCode, ...params } = form;
  (params as any).areaCode = areaCode != null ? areaCode.join() : "";
  // let { data } = await GetInList(params);
  GetInList(params)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        item.title = {};
        //编辑
        item.disabled["handleEdit"] = !item.isInOnly;
        item.title["handleEdit"] = "";
        //删除
        item.disabled["handleDelete"] = !item.canDel;
        item.title["handleDelete"] = "";
        //投标
        item.disabled["handleStatus1"] = item.biddingStatus != 1;
        item.title["handleStatus1"] =
          item.biddingStatus != 1 ? "已投标或不投标" : "";
        //不投标
        item.disabled["handleStatus2"] = item.biddingStatus != 1;
        item.title["handleStatus2"] =
          item.biddingStatus != 1 ? "已投标或不投标" : "";
        return item;
      });

      totalPage.value = data.totalCount;
      requestLoading.value = false;
    })
    .catch(() => {
      dataList.value = [];
      requestLoading.value = false;
    });
}
//序号列
function getIndex(index) {
  const page = form.pageIndex;
  const pagesize = form.pageSize;
  return (page - 1) * pagesize + index + 1;
}
function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handleExport":
      handleExport();
      break;
    case "handleRead":
      readDialogRef.value.show(row, columns);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleStatus1":
      handleStatus1(row.id, 2);
      break;
    case "handleStatus2":
      handleStatus2(row.id, 3);
      break;
  }
}

// 获取采购方式NV列表数据
async function getBuyMethod() {
  const { data } = await getBiddingBuyMethod({});
  buyMethodList.value = data || [];
}

// 获取公告类型NV列表数据
async function getNoticeType() {
  const { data } = await getBiddingNoticeType({});
  noticeTypeList.value = data || [];
}
// 获取所有投标状态
async function getBiddingStatus() {
  const { data } = await GetBiddingStatus({});
  biddingStatusType.value = data || [];
}

// 根据部门Id获取员工列表
const getStaffListByDeptId = async (roleCode, staffType) => {
  const { data = {} } = await getUserListByRoleCodeNew({
    roleCode
  });
  staffList.value[staffType] = data || [];
};

onMounted(async () => {
  Object.keys(roleCodeStaffListMap).forEach(item => {
    getStaffListByDeptId(roleCodeStaffListMap[item], item);
  });
  onSearch();
  getBuyMethod();
  getNoticeType();
  getBiddingStatus();
  nextTick(() => {
    setTableHeight();
  });

  //采购主体树
  const { data } = await GetTreeList();
  treeData.value = data || [];
});

//添加
function handleAdd() {
  dialogFormRef.value.show(null, "add");
}
//导出
async function handleExport() {
  const fileName = "参与项目";
  exportExcel("/api/Bidding/ExportInList?", fileName, form);
}
//批量删除
// function handleMoreDelete() {}
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
      const { code, message } = await DeleteIn({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//投标
const handleStatus1 = async (id, biddingStatus) => {
  const { code, message } = await UpdateBiddingStatus({
    id,
    biddingStatus: biddingStatus
  });
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
};
//不投标
const handleStatus2 = async (id, biddingStatus) => {
  const { code, message } = await UpdateBiddingStatus({
    id,
    biddingStatus: biddingStatus
  });
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

//切换“折叠”与“展开”
function handleFold() {
  fold.value = !fold.value;
  setTableHeight();
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
      ref="formRef"
      :inline="true"
      :model="form"
      label-width="100px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      @keyup.enter="onSearch"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="投标状态"
        prop="biddingStatus"
      >
        <el-select
          v-model="form.biddingStatus"
          clearable
          placeholder="请选择"
          :style="{ width: '100%' }"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="item in biddingStatusType"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          /> </el-select
      ></el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="采购方式"
        prop="buyMethod"
      >
        <el-select
          v-model="form.buyMethod"
          clearable
          placeholder="请选择"
          :style="{ width: '100%' }"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="item in buyMethodList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="公告类型"
        prop="noticeType"
      >
        <el-select
          v-model="form.noticeType"
          clearable
          placeholder="请选择"
          :style="{ width: '100%' }"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="item in noticeTypeList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 4 || !fold"
        label="采购主体"
        prop="buySubjectId"
      >
        <el-cascader
          v-model="form.buySubjectId"
          clearable
          :options="treeData"
          placeholder="请选择"
          class="w-100/100"
          :props="selProps"
          :show-all-levels="false"
        >
          <template #default="{ data }">
            <span>{{ data.subjectName }}</span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 5 || !fold"
        label="省份地区"
        prop="areaCode"
      >
        <el-cascader
          v-model="form.areaCode"
          placeholder="请选择"
          :options="regionData"
          :props="{
            checkStrictly: true
          }"
          clearable
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item
        v-show="maxItemNum >= 6 || !fold"
        label="报名开始日期"
        prop="startTime"
      >
        <el-date-picker
          v-model="form.startTime"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item
        v-show="maxItemNum >= 7 || !fold"
        label="报名截止日期"
        prop="endTime"
      >
        <el-date-picker
          v-model="form.endTime"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 8 || !fold"
        label="中标金额(起)"
        prop="startAmount"
      >
        <el-input
          v-model="form.startAmount"
          type="number"
          placeholder="请输入"
          clearable
        >
          <template #suffix>
            <p>{{ "元" }}</p>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 9 || !fold"
        label="中标金额(止)"
        prop="endAmount"
        type="number"
      >
        <el-input v-model="form.endAmount" placeholder="请输入" clearable>
          <template #suffix>
            <p>{{ "元" }}</p>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 10 || !fold"
        label="商务专员"
        prop="busiStaffId"
      >
        <el-select v-model="form.busiStaffId" style="width: 100%" filterable>
          <el-option
            v-for="item in staffList.busiStaffList"
            :key="item.staffId"
            :label="item.staffName"
            :value="item.staffId"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 11 || !fold"
        label="关键字"
        prop="keyword"
      >
        <el-input v-model="form.keyword" placeholder="招标标题" clearable />
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
        <el-button :icon="useRenderIcon('refresh')" @click="resetForm(formRef)">
          重置
        </el-button>
        <el-button type="text" @click="handleFold">
          <span v-show="fold">展开</span>
          <span v-show="!fold">折叠</span>
          <IconifyIconOffline :icon="!fold ? 'arrow-up' : 'arrow-down'" />
        </el-button>
      </el-form-item>
    </el-form>
    <TableProBar
      :title="title"
      :loading="requestLoading"
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
        <!-- <el-button
          v-auth="'TenderRemind.add'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd()"
        >
          添加
        </el-button>
        <el-button
          v-auth="'TenderRemind.export'"
          type="primary"
          :icon="useRenderIcon('export')"
          @click="handleExport()"
        >
          导出
        </el-button> -->
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          border
          :size="size"
          :height="tableHeight"
          :data="dataList"
          highlight-current-row
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
            type="index"
            :index="getIndex"
            label="序号"
            align="center"
            fixed="left"
            width="60"
          />

          <template v-for="column in columns" :key="column.prop">
            <el-table-column
              v-if="column.read"
              :label="column.label"
              :prop="column.prop"
              :align="column.align"
              :min-width="column.width"
              :fixed="column.fixed"
              :show-overflow-tooltip="column.showOverflowTooltip"
            >
              <template #default="{ row }">
                <el-text
                  type="primary"
                  class="cursor-pointer"
                  @click="handleOperation('handleRead', row)"
                >
                  {{ row[column.prop] }}
                </el-text>
              </template>
            </el-table-column>
            <el-table-column
              v-else
              :align="column.align"
              :label="column.label"
              :prop="column.prop"
              :show-overflow-tooltip="column.showOverflowTooltip"
              :min-width="column.width"
              :formatter="column.formatter"
            >
              <template #default="{ row }">
                <template v-if="column.tableColumnSlot">
                  <component :is="column.tableColumnSlot(row)" />
                </template>
                <template v-else-if="column.formatter">
                  {{ column.formatter(row) }}
                </template>
                <template v-else>
                  {{ row[column.prop] }}
                </template>
              </template>
            </el-table-column>
          </template>
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
          v-model:page-size="form.pageSize"
          v-model:current-page="form.pageIndex"
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
    <DialogForm ref="dialogFormRef" @search="onSearch" />
    <ReadDialog ref="readDialogRef" :title="title" :column="2" :width="640" />
  </div>
</template>
<style lang="scss" scoped>
:deep() {
  .el-input__wrapper {
    width: 220px;
  }
}
</style>
