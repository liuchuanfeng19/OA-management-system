<script setup lang="ts">
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import { ref, onMounted, nextTick, reactive } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { emitter } from "@/utils/mitt";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
// import ContentForm from "./components/Content.vue";
import { PreviewButton } from "@/components/PreviewButton";
import { DownloadButton } from "@/components/DownloadButton";
import { deleteNoticeSender, getNoticeSenderList } from "@/api/noticeSender";
import ReadDialog from "@/components/ReadDialog";
import { columns } from "./constant";

defineOptions({
  name: "StaffAnnounceList"
});

const title = useRoute().meta.title as string;

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const form = reactive({
  keyword: "",
  pageIndex: 1,
  pageSize: 20
});

const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const tableHeight = ref(0);
// const formData = ref({ ...INITIAL_DATA });
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
// const contentFormRef = ref(null);
const readDialogRef = ref(null); // 表单对话框组件实例

function formatDatetime(dt) {
  return dayjs(dt).format("YYYY-MM-DD HH:mm");
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
//序号列
function getIndex(index) {
  const page = form.pageIndex;
  const pagesize = form.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data } = await getNoticeSenderList(form);
  dataList.value = data.data;
  totalPage.value = data.totalCount;
  loading.value = false;
}

//点击附件查看改变状态
function handlePreview() {
  emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
}

//点击附件下载改变状态
function handleDownload() {
  emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
}

//添加
function handleAdd() {
  dialogFormRef.value.show();
}

//查看

function handleDetail(row) {
  readDialogRef.value.show(row, columns);
}

// //编辑
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
      const { code, message } = await deleteNoticeSender({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

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
      label-width="70px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      @keyup.enter="onSearch"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
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
      :title="title"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <!--
        <el-button
          v-auth="'QualificationsList.export'"
          type="primary"
          :icon="useRenderIcon('export')"
          @click="handleExport()"
        >
          导出
        </el-button> -->
        <!-- <el-button
          v-auth="'QualificationsList.delete'"
          type="danger"
          :icon="useRenderIcon('delete')"
          @click="handleMoreDelete()"
        >
          删除
        </el-button> -->
        <el-button
          v-auth="'StaffAnnounceList.add'"
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
          <!-- <el-table-column
            label="类型"
            align="left"
            width="100px"
            show-overflow-tooltip
            prop="noticeType"
          >
            <template #default="{ row }">
              <span v-if="row.noticeType == 1" style="margin-left: 10px"
                >通知</span
              ><span v-if="row.noticeType == 2" style="margin-left: 10px"
                >公告</span
              >
            </template>
          </el-table-column> -->
          <el-table-column
            label="标题"
            align="left"
            min-width="150"
            show-overflow-tooltip
            prop="title1"
          />
          <!-- <el-table-column
            label="内容"
            align="left"
            min-width="150"
            show-overflow-tooltip
            prop="content"
          /> -->

          <el-table-column
            label="接收部门"
            align="center"
            prop="recvDeptNames"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column
            label="发布部门"
            align="center"
            prop="sendDeptName"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column
            label="发布人员"
            align="center"
            prop="sendStaffName"
            width="100"
            show-overflow-tooltip
          />
          <el-table-column
            label="发布时间"
            align="center"
            prop="publishTime"
            width="150"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.publishTime ? formatDatetime(row.publishTime) : "-" }}
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            align="center"
            prop="createTime"
            width="150"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.createTime ? formatDatetime(row.createTime) : "-" }}
            </template>
          </el-table-column>
          <el-table-column
            label="是否已发送"
            align="center"
            prop="isSendName"
            width="100"
          >
            <!-- <template #default="{ row }">{{
              row.isSendName ? "已发" : "未发"
            }}</template> -->
          </el-table-column>
          <el-table-column align="center" label="附件" width="120">
            <template #default="{ row }">
              <div v-if="row.attachment">
                <PreviewButton
                  :srcList="[row.attachment]"
                  :size="size"
                  @preview="handlePreview"
                />
                <DownloadButton
                  :srcList="[row.attachment]"
                  :size="size"
                  @download="handleDownload"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-auth="
              'StaffAnnounceList.delete|StaffAnnounceList.query|StaffAnnounceList.edit'
            "
            fixed="right"
            label="操作"
            width="160"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'StaffAnnounceList.edit'"
                :disabled="scope.row.canEdit == false"
                link
                type="primary"
                :size="size"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>

              <el-button
                v-auth="'StaffAnnounceList.query'"
                link
                type="primary"
                :size="size"
                @click="handleDetail(scope.row)"
              >
                查看
              </el-button>
              <el-button
                v-auth="'StaffAnnounceList.delete'"
                link
                type="primary"
                :size="size"
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
    <ReadDialog ref="readDialogRef" :title="title" :column="1" :width="640" />
    <!-- <ContentForm @search="onSearch" ref="contentFormRef" /> -->
  </div>
</template>
<style lang="scss" scoped>
:deep() {
  .el-input__wrapper {
    width: 220px;
  }
}
</style>
