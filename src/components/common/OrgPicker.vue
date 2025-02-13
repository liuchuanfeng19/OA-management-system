<script setup lang="ts">
import { ref, computed } from "vue";
import { isAllEmpty } from "@pureadmin/utils";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { useRenderIcon } from "../ReIcon/src/hooks";

import { getOrgTree } from "@/api/org";

defineOptions({
  name: "OrgPicker"
});

const emit = defineEmits(["ok", "close"]);

const props = defineProps({
  title: {
    default: "请选择",
    type: String
  },
  type: {
    default: "org", //org选择部门/人员  user-选人  dept-选部门 role-选角色
    type: String
  },
  multiple: {
    //是否多选
    default: false,
    type: Boolean
  },
  selected: {
    default: () => {
      return [];
    },
    type: Array
  }
});

const nodes = ref([]);
const select = ref([]);
const deptStack = ref([]);
const visible = ref(false);
const loading = ref(false);
const checkAll = ref(false);
const nowDeptId = ref(null);
const searchUsers = ref([]);
const searchValue = ref("");
const showSearchBtn = ref(false);

const deptStackStr = computed(() => {
  return String(deptStack.value.map(v => v.name)).replaceAll(",", " > ");
});
const orgs = computed(() => {
  return !searchValue.value ? nodes.value : searchUsers.value;
});

function show() {
  visible.value = true;
  init();
  getOrgList();
}
function close() {
  emit("close");
  recover();
}
defineExpose({ show, close });

function orgItemClass(org) {
  return {
    "org-item": true,
    "org-dept-item": org.type === "dept",
    "org-user-item": org.type === "user",
    "org-role-item": org.type === "role"
  };
}
function disableDept(node) {
  return props.type === "user" && "dept" === node.type;
}
function getOrgList() {
  loading.value = true;
  getOrgTree({ deptId: nowDeptId.value, query: props.type, keyword: "" })
    .then(({ data }) => {
      loading.value = false;
      nodes.value = data || [];
      selectToLeft();
    })
    .catch(err => {
      loading.value = false;
      message(err.response.data, { customClass: "el", type: "error" });
    });
}
function getShortName(name) {
  if (name) {
    return name.length > 2 ? name.substring(1, 3) : name;
  }
  return "**";
}
function searchUser(val) {
  searchUsers.value = [];
  loading.value = true;
  getOrgTree({
    deptId: nowDeptId.value,
    query: props.type,
    keyword: val
  })
    .then(rsp => {
      loading.value = false;
      searchUsers.value = rsp.data || [];
      selectToLeft();
    })
    .catch(_err => {
      loading.value = false;
      searchUsers.value = [];
      message("接口异常", { customClass: "el", type: "error" });
    });
}
function selectToLeft() {
  const _nodes = !searchValue.value ? nodes.value : searchUsers.value;
  _nodes.forEach(node => {
    for (let i = 0; i < select.value.length; i++) {
      if (select.value[i].id === node.id) {
        node.selected = true;
        break;
      } else {
        node.selected = false;
      }
    }
  });
}
function selectChange(node) {
  if (node.selected) {
    checkAll.value = false;
    for (let i = 0; i < select.value.length; i++) {
      if (select.value[i].id === node.id) {
        select.value.splice(i, 1);
        break;
      }
    }
    node.selected = false;
  } else if (!disableDept(node)) {
    node.selected = true;
    const _nodes = !searchValue.value ? nodes.value : searchUsers.value;
    if (!props.multiple) {
      _nodes.forEach(nd => {
        if (node.id !== nd.id) {
          nd.selected = false;
        }
      });
    }
    if (node.type === "dept") {
      if (!props.multiple) {
        select.value = [node];
      } else {
        select.value.unshift(node);
      }
    } else {
      if (!props.multiple) {
        select.value = [node];
      } else {
        select.value.push(node);
      }
    }
  }
}
function noSelected(index) {
  let _nodes = nodes.value;
  for (let i = 0; i < _nodes.length; i++) {
    if (_nodes[i].id === select.value[index].id) {
      _nodes[i].selected = false;
      checkAll.value = false;
      break;
    }
  }
  _nodes = searchUsers.value;
  select.value.splice(index, 1);
}
function handleCheckAllChange() {
  nodes.value.forEach(node => {
    if (checkAll.value) {
      if (!node.selected && !disableDept(node)) {
        node.selected = true;
        select.value.push(node);
      }
    } else {
      node.selected = false;
      for (let i = 0; i < select.value.length; i++) {
        if (select.value[i].id === node.id) {
          select.value.splice(i, 1);
          break;
        }
      }
    }
  });
}
function nextNode(node) {
  nowDeptId.value = node.id;
  deptStack.value.push(node);
  getOrgList();
}
function beforeNode() {
  if (deptStack.value.length === 0) {
    return;
  }
  if (deptStack.value.length < 2) {
    nowDeptId.value = null;
  } else {
    nowDeptId.value = deptStack.value[deptStack.value.length - 2].id;
  }
  deptStack.value.splice(deptStack.value.length - 1, 1);
  getOrgList();
}
function recover() {
  select.value = [];
  nodes.value.forEach(nd => (nd.selected = false));
}
function selectOk() {
  emit(
    "ok",
    Object.assign(
      [],
      select.value.map(v => {
        v.avatar = undefined;
        return v;
      })
    )
  );
  visible.value = false;
  recover();
}
function clearSelected() {
  ElMessageBox.confirm("您确定要清空已选中的项?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    recover();
  });
}

function init() {
  checkAll.value = false;
  nowDeptId.value = null;
  deptStack.value = [];
  nodes.value = [];
  select.value = Object.assign([], props.selected);
  selectToLeft();
}
</script>

<template>
  <WDialog
    v-model="visible"
    :border="false"
    closeFree
    width="600px"
    :title="title"
    @ok="selectOk"
  >
    <div class="picker">
      <div v-loading="loading" class="candidate">
        <div v-if="type !== 'role'">
          <div class="serch-content">
            <el-input
              v-model.trim="searchValue"
              style="width: 95%"
              clearable
              placeholder="搜索人员，支持拼音、姓名"
              :prefix-icon="useRenderIcon('search')"
              @change="searchUser"
              @focus="showSearchBtn = true"
              @blur="showSearchBtn = false"
            />
            <el-button
              v-show="showSearchBtn && searchValue"
              class="search-btn"
              type="primary"
              :loading="loading"
              :icon="useRenderIcon('search')"
              >搜索</el-button
            >
          </div>
          <div v-show="!searchValue">
            <Ellipsis
              hoverTip
              style="height: 18px; padding: 5px 0 0; color: #8c8c8c"
              :row="1"
              :content="deptStackStr"
            >
              <template #pre>
                <component :is="useRenderIcon('office-building')" />
              </template>
            </Ellipsis>
            <div style="margin-top: 5px">
              <el-checkbox
                v-model="checkAll"
                :disabled="!multiple"
                @change="handleCheckAllChange"
                >全选</el-checkbox
              >
              <span
                v-show="deptStack.length > 0"
                class="top-dept"
                @click="beforeNode"
                >上一级</span
              >
            </div>
          </div>
        </div>
        <div v-else class="role-header">
          <div>系统角色</div>
        </div>
        <div class="org-items" :style="type === 'role' ? 'height: 350px' : ''">
          <el-empty
            v-show="orgs.length === 0"
            :image-size="100"
            :description="
              showSearchBtn ? '点击“搜索”按钮开始搜索' : '似乎没有数据'
            "
          />
          <div
            v-for="(org, index) in orgs"
            :key="index"
            :class="orgItemClass(org)"
            @click.prevent="selectChange(org)"
          >
            <el-checkbox v-model="org.selected" :disabled="disableDept(org)" />
            <div v-if="org.type === 'dept'">
              <component :is="useRenderIcon('folder-opened')" />
              <span class="name">{{ org.name }}</span>
              <span
                :class="`next-dept${org.selected ? '-disable' : ''}`"
                @click.stop="nextNode(org)"
              >
                <i class="iconfont icon-map-site" />下级
              </span>
            </div>
            <div
              v-else-if="org.type === 'user'"
              style="display: flex; align-items: center"
            >
              <el-avatar
                v-if="!isAllEmpty(org.avatar)"
                :size="35"
                :src="org.avatar"
              />
              <span v-else class="avatar">{{ getShortName(org.name) }}</span>
              <span class="name">{{ org.name }}</span>
            </div>
            <div v-else style="display: inline-block">
              <i class="iconfont icon-bumen" />
              <span class="name">{{ org.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="selected">
        <div class="count">
          <span>已选 {{ select.length }} 项</span>
          <span @click="clearSelected">清空</span>
        </div>
        <div class="org-items" style="height: 350px">
          <el-empty
            v-show="select.length === 0"
            :image-size="100"
            description="请点击左侧列表选择数据"
          />
          <div
            v-for="(org, index) in select"
            :key="index"
            :class="orgItemClass(org)"
          >
            <div v-if="org.type === 'dept'">
              <component :is="useRenderIcon('folder-opened')" />
              <span style="position: static" class="name">{{ org.name }}</span>
            </div>
            <div
              v-else-if="org.type === 'user'"
              style="display: flex; align-items: center"
            >
              <el-avatar
                v-if="!isAllEmpty(org.avatar)"
                :size="35"
                :src="org.avatar"
              />
              <span v-else class="avatar">{{ getShortName(org.name) }}</span>
              <span class="name">{{ org.name }}</span>
            </div>
            <div v-else>
              <i class="iconfont icon-bumen" />
              <span class="name">{{ org.name }}</span>
            </div>
            <component
              :is="useRenderIcon('close')"
              class="el-icon-close"
              @click="noSelected(index)"
            />
          </div>
        </div>
      </div>
    </div>
  </WDialog>
</template>

<style lang="scss" scoped>
$containWidth: 278px;

.serch-content {
  display: flex;

  .search-btn {
    margin-left: 4px;
  }
}

.candidate,
.selected {
  position: absolute;
  display: inline-block;
  width: $containWidth;
  height: 400px;
  border: 1px solid #e8e8e8;
}

.picker {
  position: relative;
  height: 402px;
  text-align: left;

  .candidate {
    top: 0;
    left: 0;

    .role-header {
      padding: 10px !important;
      margin-bottom: 5px;
      border-bottom: 1px solid #e8e8e8;
    }

    .top-dept {
      margin-left: 20px;
      color: #38adff;
      cursor: pointer;
    }

    .next-dept {
      float: right;
      color: $menuHover;
      cursor: pointer;
    }

    .next-dept-disable {
      float: right;
      color: #8c8c8c;
      cursor: not-allowed;
    }

    & > div:first-child {
      padding: 5px 10px;
    }
  }

  .selected {
    top: 0;
    right: 0;
  }

  .org-items {
    height: 310px;
    overflow-y: auto;

    .el-icon-close {
      position: absolute;
      right: 5px;
      font-size: larger;
      cursor: pointer;
    }

    .org-dept-item {
      padding: 10px 5px;

      & > div {
        display: inline-block;

        & > span:last-child {
          position: absolute;
          right: 5px;
        }
      }
    }

    .org-role-item {
      display: flex;
      align-items: center;
      padding: 10px 5px;
    }

    :deep(.org-user-item) {
      display: flex;
      align-items: center;
      padding: 5px;

      & > div {
        display: inline-block;
      }

      .avatar {
        width: 35px;
        line-height: 35px;
        color: white;
        text-align: center;
        background: $menuHover;
        border-radius: 50%;
      }
    }

    :deep(.org-item) {
      position: relative;
      margin: 0 5px;
      border-radius: 5px;

      .el-checkbox {
        margin-right: 10px;
      }

      .name {
        margin-left: 5px;
      }

      &:hover {
        background: #f1f1f1;
      }
    }
  }
}

.selected {
  border-left: none;

  .count {
    display: inline-block;
    width: calc($containWidth - 20px);
    padding: 10px;
    margin-bottom: 5px;
    border-bottom: 1px solid #e8e8e8;

    & > span:nth-child(2) {
      float: right;
      color: #c75450;
      cursor: pointer;
    }
  }
}

:deep(.el-dialog__body) {
  padding: 10px 20px;
}

.disabled {
  color: #8c8c8c !important;
  cursor: not-allowed !important;
}

::-webkit-scrollbar {
  float: right;
  width: 4px;
  height: 4px;
  background-color: white;
}

::-webkit-scrollbar-thumb {
  background-color: #efefef;
  border-radius: 16px;
}
</style>
