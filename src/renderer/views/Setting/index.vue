<template>
    <div class="setting">
        <setting-download-folder />
        <setting-version />
    </div>
</template>

<script>
import SettingDownloadFolder from "./components/SettingDownloadFolder";
import SettingVersion from "./components/SettingVersion";
export default {
    name: "setting",
    data() {
        return {};
    },
    components: {
        SettingDownloadFolder,
        SettingVersion,
    },
};
</script>

<style lang="less" scoped></style>
