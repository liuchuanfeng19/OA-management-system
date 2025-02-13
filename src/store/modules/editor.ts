import { store } from "@/store";
import type { editorType } from "./types";
import { defineStore } from "pinia";

import { storageLocal } from "@pureadmin/utils";

export const useEditorStore = defineStore({
  id: "pure-editor",
  state: (): editorType => ({
    openType:
      storageLocal().getItem<StorageConfigs>("editor-open-type")
        ?.editorOpenType ?? "add",
    content:
      storageLocal().getItem<StorageConfigs>("editor-content")?.editorContent ??
      "",
    title:
      storageLocal().getItem<StorageConfigs>("editor-title")?.editorTitle ?? ""
  }),
  getters: {
    getOpenType() {
      return this.openType;
    },
    getContent() {
      return this.content;
    },
    getTitle() {
      return this.title;
    }
  },
  actions: {
    setOpenType(openType) {
      this.openType = openType;
      storageLocal().setItem("editor-open-type", openType);
    },
    setContent(content) {
      this.content = content;
      storageLocal().setItem("editor-content", content);
    },
    setTitle(title) {
      this.title = title;
      storageLocal().setItem("editor-title1", title);
    }
  }
});

export function useEditorStoreHook() {
  return useEditorStore(store);
}
