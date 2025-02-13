<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, nextTick, reactive, watch } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import {
  deleteNoticeReceiver,
  getNoticeReceiverList,
  MarkAllNoticeReceiverAsRead,
  MarkOneNoticeReceiverAsRead
} from "@/api/noticeReceiver";
import { useDetail } from "./hooks";
import { emitter } from "@/utils/mitt";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { PreviewButton } from "@/components/PreviewButton";
import { useEditorStoreHook } from "@/store/modules/editor";
import { DownloadButton } from "@/components/DownloadButton";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import DialogFormleave from "../attendance/leave/components/DialogForm.vue";
import DialogFormBTravel from "../attendance/businessTravel/components/DialogForm.vue";
import DialogFormlist from "../../administration/qualifications/list/components/DialogForm.vue";
import DialogFormpersonal from "../../administration/qualifications/personal/components/DialogForm.vue";
import DialogFormhouse from "../../administration/housing/list/components/DialogForm.vue";
import DialogFormlease from "../../administration/housing/LeaseList/components/DialogForm.vue";

const route = useRoute();
const { toDetail } = useDetail();
const { setOpenType, setContent, setTitle } = useEditorStoreHook();

watch(
  () => route.name,
  newVal => {
    if (newVal == "StaffNoticeList") {
      nextTick(() => {
        setTimeout(() => {
          onSearch();
        }, 0);
      });
    }
  }
);

defineOptions({
  name: "StaffNoticeList"
});

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const form = reactive({
  keyword: "",
  pageIndex: 1,
  pageSize: 20,
  startTime: "",
  endTime: "",
  readStartTime: "",
  readEndTime: ""
});

const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const tableHeight = ref(0);
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const leaveFormRef = ref(null);
const btravelFormRef = ref(null);
const listFormRef = ref(null);
const personalFormRef = ref(null);
const houseFormRef = ref(null);
const leaseFormRef = ref(null);
// const contentFormRef = ref(null);
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

function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data } = await getNoticeReceiverList(form);
  dataList.value = data.data;
  totalPage.value = data.totalCount;
  loading.value = false;
}

//点击附件查看改变状态
async function handlePreview(row) {
  const { code } = await MarkOneNoticeReceiverAsRead({
    id: row.id
  });
  if (code == 0) {
    onSearch();
    emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
  }
}

//点击附件下载改变状态
async function handleDownload(row) {
  const { code } = await MarkOneNoticeReceiverAsRead({
    id: row.id
  });
  if (code == 0) {
    onSearch();

    emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
  }
}

//查看
async function handleDetail(row) {
  setOpenType("query");
  setContent(row.content);
  setTitle(row.title1);
  toDetail(row);
  const { code } = await MarkOneNoticeReceiverAsRead({
    id: row.id
  });
  if (code == 0) {
    onSearch();

    emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
  }
}

//处理
// function handle(row) {
//   if (row.busiType == "请假") {
//     leaveFormRef.value.show({ id: row.busiId }, "audit");
//   } else if (row.busiType == "出差") {
//     btravelFormRef.value.show({ id: row.busiId }, "audit");
//   } else if (row.busiType == "公司资质") {
//     listFormRef.value.show({ id: row.busiId }, "query");
//   } else if (row.busiType == "个人资质") {
//     personalFormRef.value.show({ id: row.busiId }, "query");
//   } else if (row.busiType == "外部房屋租入") {
//     houseFormRef.value.show({ id: row.busiId }, "query");
//   } else if (row.busiType == "内部房屋租出") {
//     leaseFormRef.value.show({ id: row.busiId }, "query");
//   }
// }
//删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteNoticeReceiver({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//标记全部已读
async function markAllRead() {
  const { code, message } = await MarkAllNoticeReceiverAsRead();
  if (code == 0) {
    ElMessage.success(message);
    onSearch();

    emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
  }
}

//标记单条已读
// async function markOneRead(row) {
//   const { code,message } = await MarkOneNoticeReceiverAsRead({ id: row.id });
//   if (code==0) {
//     ElMessage.success(message);
//     onSearch();

//     emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
//   }
// }

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
      label-width="100px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      @keyup.enter="onSearch"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="发布开始时间"
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
        v-show="maxItemNum >= 2 || !fold"
        label="发布结束时间"
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
        v-show="maxItemNum >= 3 || !fold"
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
        v-show="maxItemNum >= 4 || !fold"
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
        v-show="maxItemNum >= 5 || !fold"
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
        <!-- <el-button type="text" @click="handleFold">
          <span v-show="fold">展开</span>
          <span v-show="!fold">折叠</span>
          <IconifyIconOffline :icon="!fold ? 'arrow-up' : 'arrow-down'" />
        </el-button> -->
      </el-form-item>
    </el-form>
    <TableProBar
      title="通知列表"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'StaffNoticeList.markAllRead'"
          type="primary"
          @click="markAllRead()"
        >
          一键已读
        </el-button>
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
          <el-table-column
            label="标题"
            align="left"
            show-overflow-tooltip
            prop="title1"
            min-width="90"
          />
          <el-table-column
            label="内容"
            align="left"
            min-width="150"
            show-overflow-tooltip
            prop="content"
            ><template #default="{ row }">{{
              row.content ? row.content : "-"
            }}</template></el-table-column
          >
          <el-table-column
            label="是否已读"
            align="center"
            prop="isRead"
            width="90"
            ><template #default="{ row }">{{
              row.isRead ? "已读" : "未读"
            }}</template></el-table-column
          >
          <el-table-column
            label="发布时间"
            align="center"
            prop="publishTime"
            min-width="80"
            show-overflow-tooltip
          />
          <el-table-column
            label="阅读时间"
            align="center"
            prop="readTime"
            min-width="80"
            show-overflow-tooltip
          >
            <template #default="{ row }">{{
              row.readTime == "1900-01-01 00:00:00" ? "-" : row.readTime
            }}</template>
          </el-table-column>
          <el-table-column align="center" label="附件" width="100">
            <template #default="{ row }">
              <div v-if="row.attachment">
                <PreviewButton
                  :srcList="[row.attachment]"
                  :size="size"
                  @preview="handlePreview(row)"
                />
                <DownloadButton
                  :srcList="[row.attachment]"
                  :size="size"
                  @download="handleDownload(row)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-auth="'StaffNoticeList.delete|StaffNoticeList.query'"
            fixed="right"
            label="操作"
            width="100"
            align="center"
          >
            <template #default="scope">
              <div class="flex items-center">
                <!-- <el-button
                v-if="false"
                :disabled="scope.row.isProcessed == true"
                v-auth="'StaffNoticeList.query'"
                link
                type="primary"
                :size="size"
                @click="handle(scope.row)"
              >
                处理
              </el-button> -->
                <!-- <el-button
                v-auth="'StaffNoticeList.markOneRead'"
                link
                type="primary"
                :size="size"
                @click="markOneRead(scope.row)"
              >
                已读
              </el-button> -->
                <el-button
                  v-if="scope.row.content"
                  v-auth="'StaffNoticeList.query'"
                  link
                  type="primary"
                  :size="size"
                  @click="handleDetail(scope.row)"
                >
                  查看
                </el-button>

                <PreviewButton
                  v-else
                  style="margin-right: 12px"
                  :srcList="[scope.row.attachment]"
                  :size="size"
                  title="查看"
                  @preview="handlePreview(scope.row)"
                />
                <el-button
                  v-auth="'StaffNoticeList.delete'"
                  link
                  type="primary"
                  :size="size"
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
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
    <DialogForm ref="dialogFormRef" @search="onSearch" />
    <DialogFormleave ref="leaveFormRef" @search="onSearch" />
    <DialogFormBTravel ref="btravelFormRef" @search="onSearch" />
    <DialogFormlist ref="listFormRef" @search="onSearch" />
    <DialogFormpersonal ref="personalFormRef" @search="onSearch" />
    <DialogFormhouse ref="houseFormRef" @search="onSearch" />
    <DialogFormlease ref="leaseFormRef" @search="onSearch" />
  </div>
</template>
<style lang="scss" scoped>
:deep() {
  .el-input__wrapper {
    width: 220px;
  }
}
</style>
