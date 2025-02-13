<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { getRoleListNv } from "@/api/role";
import { setRole, getUserRole } from "@/api/userRole";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 在 <script setup> 中使用 defineProps API 来声明 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    default: ""
  },
  list: {
    type: Array,
    default: () => {
      return [];
    }
  }
});

const dialogVisible = ref(false);
const checkList = ref([]);
const userList = ref([]);

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
  }
);
watch(
  () => props.userId,
  val => {
    getUserRoleList(val);
  }
);

// 获取角色列表
const getRoleList = async () => {
  const { data } = await getRoleListNv();
  userList.value = data || [];
};

const getUserRoleList = async userId => {
  checkList.value = [];
  const { data } = await getUserRole({ userId });
  const list = data || [];
  userList.value.forEach(item => {
    list.forEach(ele => {
      if (item.value == ele.roleId) {
        checkList.value.push(ele.roleId);
      }
    });
  });
};

// 保存
const submitForm = () => {
  const roleIds = checkList.value.join(",");
  setRole({ userId: props.userId, roleIds }).then(res => {
    ElMessage.success(res.message);
    dialogVisible.value = false;
    emit("search");
  });
};

//关闭对话框
const closeDialog = () => {
  dialogVisible.value = false;
};

getRoleList();
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :close-on-click-modal="false"
    title="角色列表"
    width="600px"
    :before-close="closeDialog"
  >
    <div class="userList">
      <el-checkbox-group v-model="checkList">
        <el-checkbox
          v-for="item in userList"
          :key="item.value"
          class="check"
          :label="item.value"
        >
          {{ item.name }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
