<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import OrgPicker from "@/components/common/OrgPicker.vue";

defineOptions({
  name: "OAHome"
});

type USER = {
  id: number;
  name: string;
  type: string;
  selected: boolean;
};

const router = useRouter();

const select = ref([]);
const orgPicker = ref();
const loginUser = ref<USER>(null);

onMounted(() => {
  const user = sessionStorage.getItem("user");
  if (user !== null && user !== "") {
    loginUser.value = JSON.parse(user);
    select.value.push(loginUser.value);
  }
});
function selected(select) {
  select.value = select;
  loginUser.value = select.length > 0 ? select[0] : null;
  sessionStorage.setItem("user", JSON.stringify(loginUser.value));
}
function to(path) {
  if (loginUser.value === null) {
    message("请先选择一个人员身份进行登录", {
      customClass: "el",
      type: "warning"
    });
  } else {
    router.push(path);
  }
}
</script>

<template>
  <div style="text-align: center">
    <h4>先选择本次登录人员的身份，再进入相应的系统 😅</h4>

    <div class="work-panel">
      <div class="user">
        <el-button
          type="primary"
          round
          :icon="useRenderIcon('user')"
          @click="orgPicker.show()"
          >选择本次登录者</el-button
        >
        <div v-if="loginUser !== null">
          <span>{{ loginUser.name }}</span>
        </div>
      </div>
      <div class="panel">
        <div class="panel-item" @click="to('/oa/workSpace/index')">
          <div class="flex items-center">
            <IconifyIconOffline
              icon="ep-platform"
              svg
              class="el-icon-s-platform"
            />
            <span>进入工作区</span>
          </div>
          <p>您可以发起、处理及查看审批，进行日常工作任务</p>
        </div>
        <div class="panel-item" @click="to('/system/oa')">
          <div class="flex items-center">
            <IconifyIconOffline
              icon="ep-user-filled"
              class="el-icon-s-custom"
            />
            <span>进入管理后台</span>
          </div>
          <p>审批工作流创建 、编辑及其他设置操作，均可以在后台进行</p>
        </div>
      </div>
    </div>
    <OrgPicker ref="orgPicker" type="user" :selected="select" @ok="selected" />
  </div>
</template>

<style lang="scss" scoped>
h4 {
  margin: 0 auto;
  margin-top: 150px;
  color: #38adff;
}

.user {
  position: absolute;
  left: 20%;
  margin-top: 20px;

  div {
    display: inline-block;
    margin-left: 20px;
  }
}

.work-panel {
  position: relative;
  display: flex;
  justify-content: center;
  text-align: left;

  .panel {
    display: flex;
    justify-content: center;
    max-width: 700px;
    margin-top: 80px;

    .panel-item {
      display: inline-block;
      width: 250px;
      padding: 10px;
      margin: 0 40px;
      cursor: pointer;
      background: #fff;
      border: 1px solid #fff;
      border-radius: 10px;
      box-shadow: 1px 1px 8px 0 #b0b0b1;

      &:hover {
        border: 1px solid #2594ff;
        box-shadow: 1px 1px 13px 0 #a4a4a5;
      }

      div:nth-child(1) {
        height: 60px;
        font-size: large;
        font-weight: bold;
        line-height: 60px;
        color: #7a7a7a;
        border-bottom: 1px solid #cccdcd;

        span {
          margin-left: 30px;
        }
      }

      .el-icon-s-custom {
        padding: 8px;
        font-size: 25px;
        color: #fff;
        background: #2594ff;
        border-radius: 5px;
      }

      .el-icon-s-platform {
        color: #fff;
        background: rgb(255 148 62);
      }

      p {
        padding: 10px 0;
        font-size: medium;
        color: #7a7a7a;
      }
    }
  }
}
</style>
