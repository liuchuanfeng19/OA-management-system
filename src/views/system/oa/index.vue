<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import draggable from "vuedraggable/src/vuedraggable";

import {
  getFormGroups,
  groupItemsSort,
  createGroup,
  updateGroup,
  deleteGroup,
  stopForm,
  deleteForm
} from "@/api/design";
import { useOAStoreHook } from "@/store/modules/oa";
import { message as Message } from "@/utils/message";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "FormsPanel"
});

const router = useRouter();

const groups = ref([]);
const moveSelect = ref("");
const groupsSort = ref(false);
const { isEdit } = storeToRefs(useOAStoreHook());

function getGroups() {
  getFormGroups()
    .then(({ data }) => {
      const _groups = data.data || [];
      groups.value = _groups.map(item => {
        item.groupId = item.id;
        item.id = item.sort;
        return item;
      });
    })
    .catch(_err => {
      Message("获取分组异常", { customClass: "el", type: "error" });
      groups.value = [];
    });
}
function newProcess(groupId) {
  isEdit.value = false;
  console.log("groupId", groupId);
  router.push("/oa/design/index?groupId=" + groupId);
}
function groupSort() {
  groupsSort.value = false;
  const _groups = JSON.parse(JSON.stringify(groups.value));
  _groups.map(item => {
    item.sort = item.id;
    item.id = item.groupId;
    return item;
  });
  groupItemsSort(_groups)
    .then(({ code, message }) => {
      code == 0 && Message(message, { customClass: "el", type: "success" });
      getGroups();
    })
    .catch(_err => {
      getGroups();
      Message(_err.response.message, { customClass: "el", type: "error" });
    });
}
function addGroup() {
  ElMessageBox.prompt("请输入要添加的组名", "新的分组名", {
    confirmButtonText: "提交",
    cancelButtonText: "取消",
    inputPattern: /^[\u4E00-\u9FA5A-Za-z0-9\\-]{1,30}$/,
    inputErrorMessage: "分组名不能为空且长度小于30",
    inputPlaceholder: "请输入分组名"
  }).then(({ value }) => {
    createGroup({ name: value })
      .then(({ code, message }) => {
        code == 0 && Message(message, { customClass: "el", type: "success" });
        getGroups();
      })
      .catch(_err => {
        // Message(_err.response.message, { customClass: "el", type: "error" })
      });
  });
}
function delGroup(group) {
  ElMessageBox.confirm("确定要删除分组 " + group.name + "?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteGroup({ id: group.groupId })
      .then(({ code, message }) => {
        code == 0 && Message(message, { customClass: "el", type: "success" });
        getGroups();
      })
      .catch(_err => {
        // Message(_err.response.message, { customClass: "el", type: "error" })
      });
  });
}
function editGroup(group) {
  ElMessageBox.prompt("请输入新的组名", "修改分组名", {
    confirmButtonText: "提交",
    cancelButtonText: "取消",
    inputPattern: /^[\u4E00-\u9FA5A-Za-z0-9\\-]{1,30}$/,
    inputErrorMessage: "分组名不能为空且长度小于30",
    inputPlaceholder: "请输入分组名",
    inputValue: group.name
  }).then(({ value }) => {
    updateGroup({ id: group.groupId, name: value })
      .then(({ code, message }) => {
        code == 0 && Message(message, { customClass: "el", type: "success" });
        getGroups();
      })
      .catch(_err => {
        // Message(_err.response.message, { customClass: "el", type: "error" })
      });
  });
}
function editFrom(item, _group) {
  router.push("/oa/design/index?code=" + item.formId);
}
function stopFrom(item) {
  const tip = item.isStop
    ? " 是否启用 " + item.formName + " ？"
    : " 是否停用 " + item.formName + " ？";
  ElMessageBox.confirm(tip, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    stopForm({ ...item, isStop: !item.isStop })
      .then(({ code, message }) => {
        code == 0 && Message(message, { customClass: "el", type: "success" });
        getGroups();
      })
      .catch(_err => {
        // Message(_err.response.message, { customClass: "el", type: "error" })
      });
  });
}
function moveFrom(item) {
  if (item.isStop) {
    ElMessageBox.confirm(
      "您确定要删除表单 " + item.formName + " 吗，删除后无法恢复，是否继续？",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    ).then(() => {
      deleteForm({ id: item.formId })
        .then(({ code, message }) => {
          code == 0 && Message(message, { customClass: "el", type: "success" });
          getGroups();
        })
        .catch(_err => {
          // Message(_err.response.message, { customClass: "el", type: "error" })
        });
    });
  } else {
    // if (moveSelect.value === null || moveSelect.value === "") {
    //   message.error("请选择分组");
    //   return;
    // }
    // updateForm({ templateId: item.id, type: "move", groupId: moveSelect.value })
    //   .then(({ code, message }) => {
    //     success && Message(message, { customClass: "el", type: "success" });
    //     getGroups();
    //     moveSelect.value = null;
    //   })
    //   .catch(err => message.error(err.response.data));
  }
}

onMounted(() => {
  getGroups();
});
</script>

<template>
  <el-card shadow="hover" :body-style="{ padding: '20px' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <el-button
            v-show="false"
            :icon="useRenderIcon('back')"
            type="info"
            circle
            plain
            style="margin-right: 15px"
            @click="router.push('/')"
          />
          <span v-show="false">流程面板</span>
          <span v-show="false" style=" margin-left: 20px;color: #c75450"
            >📢 审批工作流创建
            、编辑及其他设置操作，均可以在流程面板进行❤</span
          >
        </div>
        <div>
          <el-button
            v-auth="'OAFormsPanel.addForm'"
            :icon="useRenderIcon('plus')"
            @click="addGroup"
            >新建分组</el-button
          >
          <el-button
            v-auth="'OAFormsPanel.addGroup'"
            type="primary"
            :icon="useRenderIcon('plus')"
            @click="newProcess('')"
            >新建表单</el-button
          >
        </div>
      </div>
    </template>
    <draggable
      v-if="groups.length > 0"
      v-model="groups"
      group="group"
      item-key="id"
      handle=".el-icon-rank"
      filter=".undrag"
      chosenClass="chosen"
      animation="300"
      forceFallback="true"
      :options="{
        animation: 300,
        sort: true,
        scroll: true,
        chosenClass: 'choose'
      }"
      @start="groupsSort = true"
      @end="groupSort"
    >
      <template #item="{ element }">
        <div
          v-show="true"
          :key="element.id"
          :class="{
            'form-group': true,
            undrag: false
          }"
        >
          <div class="form-group-title">
            <span>{{ element.name }}</span>
            <span>({{ element.items.length }})</span>
            <IconifyIconOffline
              icon="rank"
              class="el-icon-rank"
              title="长按拖动可对分组排序"
            />
            <div v-if="true">
              <el-dropdown>
                <el-button text :icon="useRenderIcon('setting')"
                  >编辑分组</el-button
                >
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      :icon="useRenderIcon('edit')"
                      @click="editGroup(element)"
                      >修改名称</el-dropdown-item
                    >
                    <el-dropdown-item
                      :icon="useRenderIcon('delete')"
                      @click="delGroup(element)"
                      >删除分组</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <draggable
            v-show="!groupsSort"
            v-model="element.items"
            style="width: 100%; min-height: 25px"
            group="from"
            item-key="formId"
            filter=".undrag"
            :options="{
              animation: 300,
              delay: 200,
              chosenClass: 'choose',
              scroll: true,
              sort: true
            }"
            @end="groupSort"
          >
            <template #item="scope">
              <div
                class="flex flex-wrap items-center"
                :class="{
                  'form-group-item': true,
                  undrag: scope.element.isStop
                }"
                title="长按0.5S后可拖拽表单进行排序"
              >
                <div class="flex-1">
                  <!-- scope.element.logo.icon -->
                  <component
                    :is="useRenderIcon(scope.element.logo.icon)"
                    :style="'background: ' + scope.element.logo.background"
                  />
                  <span>{{ scope.element.formName }}</span>
                  <br />
                </div>
                <div class="flex-1 desp">{{ scope.element.remark }}</div>
                <div class="flex-1">
                  <span>最后更新时间：{{ scope.element.updateTime }}</span>
                </div>
                <div class="flex-1">
                  <el-button
                    text
                    :icon="useRenderIcon('edit')"
                    @click="editFrom(scope.element, element)"
                    >编辑</el-button
                  >
                  <el-button
                    text
                    :icon="
                      useRenderIcon(scope.element.isStop ? 'check' : 'close')
                    "
                    @click="stopFrom(scope.element)"
                  >
                    {{ scope.element.isStop ? "启用" : "停用" }}
                  </el-button>

                  <el-button
                    v-if="scope.element.isStop"
                    text
                    :icon="useRenderIcon('delete')"
                    @click="moveFrom(scope.element)"
                    >删除
                  </el-button>
                  <el-popover
                    v-if="false"
                    placement="left"
                    trigger="click"
                    width="400"
                    style="margin-left: 10px"
                    @show="moveSelect === null"
                  >
                    <el-radio-group v-model="moveSelect">
                      <el-radio
                        v-for="g in groups"
                        v-show="g.id > 1"
                        :key="g.id"
                        :label="g.id"
                        border
                        :disabled="g.id === element.id"
                        style="margin: 10px"
                        >{{ g.name }}</el-radio
                      >
                    </el-radio-group>
                    <div style=" margin: 0;text-align: right">
                      <el-button type="primary" @click="moveFrom(scope.element)"
                        >提交</el-button
                      >
                    </div>
                    <template #reference>
                      <el-button text :icon="useRenderIcon('promotion')"
                        >移动</el-button
                      >
                    </template>
                  </el-popover>
                </div>
              </div>
            </template>
          </draggable>
          <div
            v-if="element.items === undefined || element.items.length === 0"
            style="text-align: center"
          >
            <el-button
              style="padding-top: 0"
              text
              :icon="useRenderIcon('plus')"
              @click="newProcess(element.groupId)"
              >创建新表单</el-button
            >
          </div>
        </div>
      </template>
    </draggable>
  </el-card>
</template>

<style lang="scss" scoped>
body {
  background: #fff !important;
}

.undrag {
  background: #ebecee !important;
}

.from-panel {
  min-width: 500px;
  padding: 20px;
  background: #fff;

  :deep(.from-title) {
    div {
      float: right;

      .el-button {
        border-radius: 15px;
      }
    }
  }

  //height: 100vh;
}

.choose {
  background: #e9ebee;
}

.form-group {
  padding: 5px 0;
  margin: 0 0 20px;
  border-radius: 10px;
  box-shadow: 1px 1px 4px 0 #d2d2d2;

  &:hover {
    box-shadow: 1px 1px 8px 0 #b3b3b3;
  }

  .form-group-title {
    height: 40px;
    padding: 5px 20px;
    line-height: 40px;
    border-bottom: 1px solid #d3d3d3;

    .el-icon-rank {
      display: none;
      cursor: move;
    }

    &:hover {
      .el-icon-rank {
        display: inline-block;
      }
    }

    div {
      display: inline-block;
      float: right;
    }

    span:first-child {
      margin-right: 5px;
      font-size: 15px;
      font-weight: bold;
    }

    span:nth-child(2) {
      margin-right: 10px;
      font-size: small;
      color: #656565;
    }

    :deep(.el-button) {
      margin-left: 20px;
      color: #404040;

      &:hover {
        color: #2b2b2b;
      }
    }
  }

  .form-group-item:nth-child(1) {
    border-top: none !important;
  }

  .form-group-item {
    // height: 40px;
    position: relative;
    box-sizing: content-box;
    padding: 10px 0;
    margin: 0 20px;
    font-size: small;
    color: #3e3e3e;
    // line-height: 40px;
    border-top: 1px solid #d3d3d3;

    div {
      display: flex;
      align-items: center;
    }

    i {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 6px;
      margin-right: 10px;
      // font-size: 14px;
      color: #fff;
      border-radius: 10px;
    }

    div:nth-child(2) {
      left: 200px;
      max-width: 300px;
      overflow: hidden;
      font-size: 12px;
      color: #7a7a7a;
    }
  }
}

@media screen and (width <= 1000px) {
  .desp {
    display: none !important;
  }
}

@media screen and (width <= 800px) {
  .from-panel {
    padding: 20px 10px;
  }
}
</style>
