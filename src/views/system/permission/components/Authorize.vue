<script lang="ts" setup>
import { ElMessage } from "element-plus";
import { ref, watch, computed } from "vue";

import { getMeunTree } from "@/api/menu";
import MenuTree from "../../components/MenuTree.vue";
import { saveForRole, saveForUser } from "@/api/menuButton";
import { getListByRoleId, getListByUserId } from "@/api/button";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible"]);

// vue3 在 <script setup> 中使用 defineProps API 来声明 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  role: {
    type: Object,
    default: () => {
      return {};
    }
  },
  user: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const treeList = ref([]);
const authList = ref([]);
const scrollBox = ref([]); //vue3中不在自动创建数组，需要自己定义变量，并且手动push数组，dom上使用变量去绑定
const checkAll = ref(false);
const indeterminate = ref(false);
const dialogVisible = ref(false);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return props.role.roleId
    ? "授权-" + props.role.roleName
    : props.user.userId
      ? "授权-" + props.user.staffName
      : "";
});

// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => dialogVisible.value,
  val => {
    emit("update:visible", val);
  }
);
watch(
  () => props.visible,
  val => {
    dialogVisible.value = val;
    if (val) {
      getDatas();
      getRouterList();
    }
  }
);
watch(
  () => props.role.roleId,
  () => {
    // getDatas();
  }
);
watch(
  () => props.user.userId,
  () => {
    // getDatas();
  }
);

//vue3中不在自动创建数组，需要自己定义变量，并且手动push数组，dom上使用变量去绑定
const setItemRef = el => {
  if (el) {
    scrollBox.value.push(el);
  }
};

//获取树形结构菜单
const getRouterList = async () => {
  let data = [];
  const res = await getMeunTree();
  data = res.data || [];
  treeList.value = data || [];
};

//获取树形结构菜单
const getDatas = async () => {
  let data = [];
  if (props.role.roleId) {
    const res = await getListByRoleId({ roleId: props.role.roleId });
    data = res.data || [];
  } else {
    const res = await getListByUserId({ userId: props.user.userId });
    data = res.data || [];
  }
  authList.value = data || [];
  setCheckAll();
};

//处理树节点点击事件
const handleNodeClick = data => {
  for (let i = 0; i < scrollBox.value.length; i++) {
    const top = scrollBox.value[i].children[0];
    const label = top.children[0];
    const span = label.children[1];
    const spanId = span.children[0];
    const id = spanId.innerText;
    if (data == id) {
      scrollBox.value[i].scrollIntoView({ behavior: "smooth" });
    }
  }
};

function setCheckAll() {
  const unCheckedAuth = authList.value.find(item => {
    const unCheckedItem = item.funItems.find(ele => ele.isSelected == false);
    return unCheckedItem || item.menuItem.isSelected == false;
  });
  if (unCheckedAuth) {
    checkAll.value = false;
  } else {
    checkAll.value = true;
  }
}

function handleAll(val) {
  for (let index = 0; index < authList.value.length; index++) {
    const element = authList.value[index];
    element.menuItem.isSelected = val;
    const funItems = element.funItems;
    for (let i = 0; i < funItems.length; i++) {
      const func = funItems[i];
      func.isSelected = val;
    }
  }
}

//处理全选事件
const handleCheckAll = val => {
  val.funItems.forEach(item => {
    if (val.menuItem.isSelected) {
      item.isSelected = true;
    } else {
      item.isSelected = false;
    }
  });
  setCheckAll();
};

const handleCheckItem = val => {
  val.funItems.some(item => {
    return item.isSelected
      ? (val.menuItem.isSelected = true)
      : (val.menuItem.isSelected = false);
  });
  setCheckAll();
};

//确定
const handleSure = () => {
  const list = [];
  const menuList = [];
  authList.value.forEach(item => {
    if (item.menuItem.isSelected) {
      menuList.push(item.menuItem.menuId);
    }
    item.funItems.forEach(ele => {
      if (ele.isSelected) {
        list.push(ele.funcItemId);
      }
    });
  });
  if (props.role.roleId) {
    saveForRole({
      id: props.role.roleId,
      funItems: list,
      menuItems: menuList
    }).then(res => {
      ElMessage.success(res.message || "操作成功");
      dialogVisible.value = false;
    });
  } else {
    saveForUser({
      id: props.user.userId,
      funItems: list,
      menuItems: menuList
    }).then(res => {
      ElMessage.success(res.message || "操作成功");
      dialogVisible.value = false;
    });
  }
};

//关闭对话框
const closeDialog = () => {
  checkAll.value = false;
  dialogVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="1000"
    :before-close="closeDialog"
  >
    <div class="dialog-content flex">
      <MenuTree
        style="width: 260px"
        :height="550"
        :treeData="treeList"
        @nodeClick="handleNodeClick"
      />
      <div
        class="flex-1 ml-2 min-h-200px bg-bg_color right"
        :style="{
          height: '550px'
        }"
      >
        <div class="flex items-center h-[50px] pl-5">
          <el-checkbox
            v-model="checkAll"
            :indeterminate="indeterminate"
            @change="handleAll"
            >全选</el-checkbox
          >
        </div>
        <el-divider />
        <div class="tree">
          <el-scrollbar height="499px">
            <div
              v-for="item in authList"
              :key="item.id"
              :ref="setItemRef"
              class="cardBox border-[1px] border-solid border-[#f0f0f0] dark:border-[#262727]"
            >
              <div
                class="top border-b-[1px] border-solid border-[#f0f0f0] dark:border-[#262727]"
              >
                <el-checkbox
                  v-model="item.menuItem.isSelected"
                  class="check"
                  @change="handleCheckAll(item)"
                >
                  <span hidden>{{ item.menuItem.menuId }}</span>
                  <span>{{ item.menuItem.menuName }}</span>
                </el-checkbox>
              </div>
              <div class="footer">
                <el-checkbox
                  v-for="ele in item.funItems"
                  :key="ele.id"
                  v-model="ele.isSelected"
                  class="check"
                  @change="handleCheckItem(item)"
                >
                  {{ ele.displayName }}
                </el-checkbox>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
    <template #footer>
      <span>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSure">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
.dialog-content {
  height: 550px;

  .right {
    width: calc(100% - 260px);

    .cardBox:nth-child(1) {
      margin-top: 0;
    }

    .cardBox {
      width: 98%;
      min-height: 120px;
      margin-top: 50px;

      .check {
        margin-left: 20px;
        line-height: 50px;
      }

      .top {
        width: 100%;
        height: 50px;
        line-height: 50px;
        background-color: var(--el-fill-color-light);
      }

      .footer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        width: 100%;
        padding: 10px 0;
      }
    }
  }
}

.tree {
  box-sizing: border-box;
  height: calc(100% - 51px);
  padding: 10px 0;
  overflow: hidden;
}

:deep(.el-divider) {
  margin: 0;
}
</style>
