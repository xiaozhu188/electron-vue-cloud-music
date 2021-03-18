<template>
    <div class="frame-actions">
        <a-icon type="shrink" class="item" @click="setFrame('mini')" />
        <a-icon
            type="minus"
            class="item"
            @click="setFrame('min')"
            v-if="platform === 'win32'"
        />
        <z-icon
            :type="isMax ? 'tuichuquanping' : 'juxing'"
            class="item"
            @click.native="setFrame('plus')"
            v-if="platform === 'win32'"
        />
        <a-icon
            type="close"
            class="item"
            @click="setFrame('close')"
            v-if="platform === 'win32'"
        />
    </div>
</template>

<script>
import { mapState } from "vuex";
import ZIcon from "@/components/ZIcon";
export default {
    data() {
        this.currentWindow = this.$electron.remote.getCurrentWindow();
        return {
            isMax: this.currentWindow.isMaximized(),
        };
    },
    computed: {
        ...mapState("App", ["platform"]),
    },
    components: {
        ZIcon,
    },
    methods: {
        setFrame(action) {
            switch (action) {
                case "min":
                    this.$electron.ipcRenderer.send("window-min");
                    break;
                case "plus":
                    this.$electron.ipcRenderer.send("window-max");
                    break;
                case "close":
                    this.$electron.ipcRenderer.send("window-close");
                    break;
                case "mini":
                    this.$electron.ipcRenderer.send("toggle-mini", {
                        value: true,
                    });
                    break;
            }
            this.isMax = this.currentWindow.isMaximized();
        },
    },
};
</script>

<style lang="less" scoped>
.frame-actions {
    display: flex;
    align-items: center;
    margin-right: 10px;
    -webkit-app-region: no-drag;
    &::before {
        content: "";
        display: inline-block;
        width: 1px;
        height: 20px;
        margin-right: 8px;
        background: #ddd;
    }
    .item {
        padding: 0 4px;
        line-height: 54px;
        height: 50px;
        vertical-align: unset;
        font-size: 18px;
        cursor: pointer;
    }
}
</style>
