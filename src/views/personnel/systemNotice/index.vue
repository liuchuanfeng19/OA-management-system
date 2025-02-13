<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, nextTick, reactive, watch } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import {
  deleteSystemNotice,
  batchDeleteSystemNotice,
  getSystemNoticeList,
  markAllAsRead,
  markOneAsRead
} from "@/api/systemNotice";
import { emitter } from "@/utils/mitt";
import { getBNVList } from "@/api/noticeRule";
import { TableProBar } from "@/components/ReTable";
import { tableButtons, operationButtons } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { TableColumOperation } from "@/components/TableColumOperation";

const route = useRoute();

watch(
  () => route.name,
  newVal => {
    if (newVal == "SystemNotice") {
      nextTick(() => {
        setTimeout(() => {
          onSearch();
        }, 0);
      });
    }
  }
);

defineOptions({
  name: "SystemNotice"
});

//el-cascader props属性值
// const selProps = {
//   children: "children",
//   label: "name",
//   multiple: false,
//   emitPath: false,
//   value: "value",
//   checkStrictly: false
// };

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const form = reactive({
  keyword: "",
  pageIndex: 1,
  pageSize: 20,
  busiType: "",
  isRead: "",
  startTime: "",
  endTime: "",
  readStartTime: "",
  readEndTime: ""
});

const fold = ref(true);
const totalPage = ref(0);
const tableData = ref([]);
const loading = ref(true);
const maxItemNum = ref(1);
const auditTypes = ref([]);
const tableHeight = ref(0);
const tableSelection = ref([]); // 选中列表
const formRef = ref<FormInstance>();

//序号列
function getIndex(index) {
  const page = form.pageIndex;
  const pagesize = form.pageSize;
  return (page - 1) * pagesize + index + 1;
}
function handleCurrentChange(val: number) {
  console.log(`current page: ${val}`);
  onSearch();
}

function handleSizeChange(val: number) {
  console.log(`${val} items per page`);
  onSearch();
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data } = await getSystemNoticeList(form);
  const _data = data.data || [];
  tableData.value = _data.map(item => {
    item.disabled = {};
    item.title = {};
    //标记已读
    item.disabled["markOneRead"] = item.isRead;
    item.title["markOneRead"] = item.isRead ? "当前记录为已读" : "";
    //删除
    // item.disabled["handleDelete"] = !item.canDel;
    // item.title["handleDelete"] = !item.canDel ? "当前记录不可删除" : "";
    return item;
  });
  totalPage.value = data.totalCount;
  loading.value = false;
}

function getAuditTypes() {
  getBNVList()
    .then(({ data }) => {
      auditTypes.value = data || [];
    })
    .catch(() => {
      auditTypes.value = [];
    });
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    // case "handleAdd":
    //   handleAdd();
    //   break;
    // case "handleExport":
    //   handleExport();
    //   break;
    case "handleMarkAllRead":
      handleMarkAllRead();
      break;
    case "markOneRead":
      markOneRead(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
  }
}

//删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const ids = row ? [row.id] : tableSelection.value.map(item => item.id);
      if (ids.length > 1) {
        batchDeleteSystemNotice({ ids }).then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            onSearch();
          }
        });
      } else {
        const { code, message } = await deleteSystemNotice({
          id: ids.join()
        });
        if (code == 0) {
          ElMessage.success(message);
          onSearch();
        }
      }
    })
    .catch(() => {});
}

//标记全部已读
async function handleMarkAllRead() {
  const { code, message } = await markAllAsRead();
  if (code == 0) {
    ElMessage.success(message);
    onSearch();

    emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
  }
}

// 标记单条已读;
async function markOneRead(row) {
  const { code, message } = await markOneAsRead({ id: row.id });
  if (code == 0) {
    ElMessage.success(message);
    onSearch();

    emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
  }
}

function handleSelectionChange(selection) {
  // console.log("handleSelectionChange selection", selection);
  tableSelection.value = selection;
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

// 切换“折叠”与“展开”
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

onMounted(() => {
  onSearch();
  getAuditTypes();
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
      :model="form"
      label-width="96px"
      class="bg-bg_color w-[100%] pl-2 pt-4 mb-2"
      @keyup.enter="onSearch"
    >
      <!-- <el-form-item
        label="业务名称"
        prop="busiType"
        v-show="maxItemNum >= 1 || !fold"
      >
        <el-cascader
          v-model="form.busiType"
          ref="cascaderRef"
          :options="auditTypes"
          clearable
          filterable
          :show-all-levels="false"
          :props="selProps"
        />
      </el-form-item> -->
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="是否已读"
        prop="isRead"
      >
        <el-select v-model="form.isRead" clearable>
          <el-option label="全部" value="" />
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="通知开始时间"
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
        v-show="maxItemNum >= 3 || !fold"
        label="通知结束时间"
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
        v-show="maxItemNum >= 4 || !fold"
        label="阅读开始时间"
        prop="readStartTime"
      >
        <el-date-picker
          v-model="form.readStartTime"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 5 || !fold"
        label="阅读结束时间"
        prop="readEndTime"
      >
        <el-date-picker
          v-model="form.readEndTime"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 6 || !fold"
        label="关键字"
        prop="keyword"
      >
        <el-input v-model="form.keyword" placeholder="标题" clearable />
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
        <el-button type="text" @click="handleFold">
          <span v-show="fold">展开</span>
          <span v-show="!fold">折叠</span>
          <IconifyIconOffline :icon="!fold ? 'arrow-up' : 'arrow-down'" />
        </el-button>
      </el-form-item>
    </el-form>
    <TableProBar
      title="系统通知列表"
      :loading="loading"
      :dataList="tableData"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-for="(item, index) in tableButtons"
          :key="index"
          :disabled="
            item.buttonClick == 'handleDelete' && tableSelection.length < 1
              ? true
              : false
          "
          :title="
            item.buttonClick == 'handleDelete' && tableSelection.length < 1
              ? '至少勾选一行'
              : ''
          "
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
          :data="tableData"
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
          <el-table-column
            v-if="false"
            label="业务类型"
            align="left"
            show-overflow-tooltip
            prop="busiType"
            fixed="left"
            min-width="200"
          />
          <el-table-column
            label="标题"
            align="left"
            show-overflow-tooltip
            prop="title1"
            min-width="150"
          />
          <el-table-column
            label="内容"
            align="left"
            min-width="200"
            show-overflow-tooltip
            prop="content"
          >
            <template #default="{ row }">
              {{ row.content ? row.content : "-" }}
            </template>
          </el-table-column>
          <el-table-column
            label="是否已读"
            align="center"
            prop="isRead"
            width="90"
          >
            <template #default="{ row }">
              <el-tag :type="row.isRead ? 'info' : 'danger'" :size="size">
                {{ row.isRead ? "已读" : "未读" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="通知时间"
            align="center"
            prop="createTime"
            min-width="60"
            show-overflow-tooltip
          />
          <el-table-column
            label="阅读时间"
            align="center"
            prop="readTime"
            min-width="60"
            show-overflow-tooltip
          >
            <template #default="{ row }">{{
              row.readTime == "1900-01-01 00:00:00" ? "-" : row.readTime
            }}</template>
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
          v-model:current-page="form.pageIndex"
          v-model:page-size="form.pageSize"
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
  </div>
</template>
