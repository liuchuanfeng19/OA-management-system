import { computed } from "vue";
import bg from "@/assets/login/bg.mp4";
import avatar from "@/assets/login/avatar.svg?component";
import illustration from "@/assets/login/illustration.svg?component";

const currentWeek = computed(() => {
  return illustration;
});

export { bg, avatar, currentWeek };
