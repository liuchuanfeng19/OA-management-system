<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import Search from "../search/index.vue";
import Notice from "../notice/index.vue";
import { ref, watch, nextTick } from "vue";
import SidebarItem from "./sidebarItem.vue";
import avatars from "@/assets/avatars.jpg";
import { useNav } from "../../hooks/useNav";
import { useUserStoreHook } from "@/store/modules/user";
import { useTranslationLang } from "../../hooks/useTranslationLang";
import { usePermissionStoreHook } from "@/store/modules/permission";
// import globalization from "@/assets/svg/globalization.svg?component";

const menuRef = ref();

const {
  t,
  route
  // locale, translationCh, translationEn
} = useTranslationLang(menuRef);
const router = useRouter();
const {
  title,
  routers,
  logout,
  backHome,
  onPanel,
  menuSelect,
  avatarsStyle
  // getDropdownItemStyle,
  // getDropdownItemClass,
} = useNav();

const { avatarUrl, staffName } = storeToRefs(useUserStoreHook());

nextTick(() => {
  menuRef.value?.handleResize();
});

watch(
  () => route.path,
  () => {
    menuSelect(route.path, routers);
  }
);

const toPersonalCenter = () => {
  router.push("/personalCenter");
};
</script>

<template>
  <div class="horizontal-header">
    <div class="horizontal-header-left" @click="backHome">
      <FontIcon class="icon" icon="icon-a-ziyuan2" svg />
      <span>{{ title }}</span>
    </div>
    <el-menu
      ref="menuRef"
      router
      mode="horizontal"
      menu-trigger="hover"
      class="horizontal-header-menu"
      :default-active="route.path"
      @select="indexPath => menuSelect(indexPath, routers)"
    >
      <sidebar-item
        v-for="route in usePermissionStoreHook().wholeMenus"
        :key="route.path"
        :item="route"
        :base-path="route.path"
      />
    </el-menu>
    <div class="horizontal-header-right">
      <!-- 菜单搜索 -->
      <Search />
      <!-- 通知 -->
      <Notice id="header-notice" />
      <!-- 国际化 -->
      <!-- <el-dropdown id="header-translation" trigger="click">
        <globalization
          class="navbar-bg-hover w-[40px] h-[48px] p-[11px] cursor-pointer outline-none"
        />
        <template #dropdown>
          <el-dropdown-menu class="translation">
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'zh')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'zh')]"
              @click="translationCh"
            >
              <span class="check-zh" v-show="locale === 'zh'">
                <IconifyIconOffline icon="check" />
              </span>
              简体中文
            </el-dropdown-item>
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'en')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'en')]"
              @click="translationEn"
            >
              <span class="check-en" v-show="locale === 'en'">
                <IconifyIconOffline icon="check" />
              </span>
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown> -->
      <!-- 退出登录 -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover">
          <img v-if="avatarUrl" :src="avatarUrl" :style="avatarsStyle" />
          <img v-else :src="avatars" :style="avatarsStyle" />
          <p v-if="staffName" class="dark:text-white">{{ staffName }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="toPersonalCenter">
              <IconifyIconOffline icon="epUser" style="margin: 5px" />
              {{ t("buttons.hsPersonalCenter") }}</el-dropdown-item
            >
            <el-dropdown-item @click="logout">
              <IconifyIconOffline
                icon="logout-circle-r-line"
                style="margin: 5px"
              />
              {{ t("buttons.hsLoginOut") }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span
        class="set-icon navbar-bg-hover"
        :title="t('buttons.hssystemSet')"
        @click="onPanel"
      >
        <IconifyIconOffline icon="setting" />
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}

.logout {
  max-width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}
</style>
