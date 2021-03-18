<template>
    <a-config-provider :locale="locale">
        <a-layout class="basic-layout">
            <a-layout-header
                class="basic-layout-header"
                :class="{ 'basic-layout-header-mac': platform === 'darwin' }"
            >
                <basic-header />
            </a-layout-header>
            <a-layout>
                <a-layout-sider class="basic-layout-sider" :width="siderWidth">
                    <div ref="handle" class="split-handle"></div>
                    <basic-sider />
                </a-layout-sider>
                <a-layout-content class="basic-layout-content">
                    <keep-alive
                        :exclude="keepAliveExcludeList"
                        v-if="isOnline || noLimitRoutes.includes($route.name)"
                    >
                        <router-view v-if="!refresh"></router-view>
                    </keep-alive>
                    <offline v-else />
                </a-layout-content>
            </a-layout>
            <a-layout-footer class="basic-layout-footer">
                <play-bar />
            </a-layout-footer>
            <login />
            <player />
        </a-layout>
    </a-config-provider>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import throttle from "loadsh/throttle";
import eventBus from "@/utils/eventBus";
import BasicHeader from "@/components/BasicHeader";
import BasicSider from "@/components/BasicSider";
import PlayBar from "@/components/PlayBar";
import Login from "@/components/Login";
import Player from "@/components/Player";
import Offline from "@/components/Offline/index";
import zhCN from "ant-design-vue/lib/locale-provider/zh_CN";

const SIDER_WIDTH_DEFAULT = 200;
const SIDER_WIDTH_MAX = 400;
export default {
    data() {
        return {
            locale: zhCN,
            refresh: false,
            keepAliveExcludeList: ["video", "mv", "events"],
            siderWidth: SIDER_WIDTH_DEFAULT,
        };
    },
    computed: {
        ...mapState("App", ["noLimitRoutes", "platform", "isOnline"]),
    },
    components: {
        BasicHeader,
        BasicSider,
        PlayBar,
        Login,
        Player,
        Offline,
    },
    created() {
        eventBus.$on("refresh", () => {
            const matched = this.$route.matched;
            const currentRoute = matched[matched.length - 1];
            const name = currentRoute.components.default.name;
            this.refresh = true;
            this.keepAliveExcludeList.unshift(name);
            this.$nextTick(() => {
                this.refresh = false;
                this.keepAliveExcludeList.shift();
            });
        });
    },
    mounted() {
        this.mouse = {};
        const handle = this.$refs.handle;
        const app = document.getElementById("app");
        handle.onmousedown = (e) => {
            this.mouse.isDown = true;
            this.mouse.startX = e.pageX;
        };
        app.onmousemove = throttle(
            (e) => {
                if (!this.mouse.isDown) return;
                let diffX = e.pageX;
                if (diffX < SIDER_WIDTH_DEFAULT || diffX > SIDER_WIDTH_MAX)
                    return;
                this.siderWidth = diffX;
            },
            100,
            { trailing: true, leading: true }
        );
        app.onmouseup = () => {
            this.mouse.isDown = false;
        };
    },
    destroy() {
        const app = document.getElementById("app");
        this.$refs.handle.onmousedown = null;
        app.onmousemove = null;
        app.onmouseup = null;
    },
};
</script>

<style lang="less" scoped>
.basic-layout {
    height: 100vh;

    .basic-layout-header,
    .basic-layout-footer {
        height: 50px;
        line-height: 50px;
        padding: 0;
        z-index: 22;
        position: relative;
    }

    .basic-layout-header {
        box-sizing: content-box;

        &.basic-layout-header-mac {
            padding-top: 20px;
        }
    }

    .basic-layout-footer {
        border-top: 1px solid #ddd;
    }

    .basic-layout-header {
        background: @primary-color;
        color: #eee;
        -webkit-app-region: drag;
    }

    .basic-layout-sider {
        position: relative;
        background: none;
        box-shadow: none;
        overflow-x: hidden;
        overflow-y: hidden;

        .split-handle {
            position: absolute;
            right: 0;
            top: 0;
            z-index: 999;
            height: 100%;
            width: 5px;
            border-right: 1px solid #ddd;
            cursor: col-resize;
        }
    }

    .basic-layout-content {
        background: #f5f5f7;
    }
}
</style>
