<template>
    <home-layout>
        <div class="floors" v-if="isRenderFinish">
            <banner :banners="banners" />
            <transition-group name="flip-list">
                <a-card
                    :bordered="false"
                    style="background: transparent; margin-bottom: 20px"
                    :style="{ opacity: isRenderFinish ? 1 : 0 }"
                    v-for="item in navs"
                    :title="item.name"
                    :key="item.key"
                >
                    <router-link
                        :to="`/${item.key}`"
                        slot="extra"
                        v-if="!item.hideMore"
                    >
                        更多
                        <a-icon type="right" />
                    </router-link>
                    <component
                        :is="item.key"
                        :list="data[item.key]"
                        v-if="isRenderFinish"
                    />
                </a-card>
            </transition-group>
        </div>
        <div class="loading-wrapper-center" v-else>
            <loading text="正在为您生成个性化设置..." />
        </div>
        <footer slot="footer" class="wy-footer">
            <p>现在可以根据个人喜好,自由调整首页栏目顺序啦~</p>
            <a-button type="danger" ghost @click="visible = true"
                >调整栏目顺序</a-button
            >
            <drap-modal
                centered
                title="调整栏目顺序"
                :footer="null"
                :width="400"
                :maskClosable="false"
                v-model="visible"
            >
                <transition-group name="flip-list">
                    <div
                        v-for="nav in navs"
                        :key="nav.key"
                        class="drag-item"
                        draggable="true"
                        @dragstart="dragstart(nav)"
                        @dragenter="dragenter(nav)"
                    >
                        <span>{{ nav.name }}</span>
                        <z-icon type="drag"></z-icon>
                    </div>
                </transition-group>
                <a class="reset" @click="resetNav">恢复默认顺序</a>
            </drap-modal>
        </footer>
    </home-layout>
</template>

<script>
import { mapGetters } from "vuex";

import { getBanner } from "@/api/banner";
import { getPrivateContent } from "@/api/privatecontent";
import { getNewSong } from "@/api/song";
import { getRecommendPlaylist } from "@/api/playlist";
import { getPersonalizedMV } from "@/api/mv";
import { getDjHot } from "@/api/dj";

import HomeLayout from "@/layouts/HomeLayout";
import banner from "./components/Banner";
import privateContent from "./components/privateContent";
import newSong from "./components/newSong";
import playlist from "./components/playlist";
import mv from "./components/mv";
import dj from "./components/dj";
import Loading from "@/components/Common/loading.vue";
import DrapModal from "@/components/DrapModal/index.vue";
import ZIcon from "@/components/ZIcon/index.vue";
import { normalMV } from "@/utils/video";

const NAVS = [
    {
        name: "独家放送",
        key: "privateContent",
        hideMore: true,
    },
    {
        name: "最新音乐",
        key: "newSong",
    },
    {
        name: "推荐歌单",
        key: "playlist",
    },
    {
        name: "推荐MV",
        key: "mv",
    },
    {
        name: "主播电台",
        key: "dj",
    },
];
export default {
    name: "home",
    data() {
        return {
            data: {
                privateContent: [],
                newSong: [],
                playlist: [],
                mv: [],
                dj: [],
            },
            navs: JSON.parse(JSON.stringify(NAVS)),
            oldNav: 0,
            newNav: 0,
            banners: [],
            isRenderFinish: false,
            visible: false,
        };
    },
    components: {
        HomeLayout,
        banner,
        privateContent,
        newSong,
        playlist,
        mv,
        dj,
        Loading,
        DrapModal,
        ZIcon,
    },
    computed: {
        ...mapGetters("User", ["userId"]),
    },
    created() {
        this._getData();
    },
    mounted() {
        let navCache = localStorage.getItem("nav");
        if (navCache) {
            this.navs = JSON.parse(navCache);
        }
    },
    watch: {
        userId(newId) {
            if (!newId) {
                this._getData();
            }
        },
    },
    methods: {
        async _getData() {
            this.isRenderFinish = false;
            Promise.all([
                getBanner(),
                getPrivateContent(),
                getNewSong(),
                getRecommendPlaylist(),
                getPersonalizedMV(),
                getDjHot(),
            ]).then(
                ([
                    { banners },
                    { result: privateContent },
                    { result: newSong },
                    { result: playlist },
                    { result: mv },
                    { djRadios: dj },
                ]) => {
                    banners.forEach((banner) => {
                        banner.src = banner.imageUrl;
                    });
                    this.banners = banners;
                    mv = mv.map((item) => {
                        return normalMV(item);
                    });
                    this.data = {
                        privateContent,
                        newSong,
                        playlist,
                        mv,
                        dj,
                    };
                    this.isRenderFinish = true;
                }
            );
        },
        dragstart(nav) {
            this.oldNav = nav;
        },
        dragenter(nav) {
            this.newNav = nav;
            if (this.oldNav.name !== this.newNav.name) {
                let oldIndex = this.navs.findIndex(
                    (nav) => nav.name == this.oldNav.name
                );
                let newIndex = this.navs.findIndex(
                    (nav) => nav.name == this.newNav.name
                );
                let newItems = [...this.navs];
                // 删除老的节点
                newItems.splice(oldIndex, 1);
                // 在列表中目标位置增加新的节点
                newItems.splice(newIndex, 0, this.oldNav);
                // this.navs一改变，transition-group就起了作用
                this.navs = [...newItems];
                window.localStorage.setItem("nav", JSON.stringify(this.navs));
            }
        },
        resetNav() {
            this.navs = NAVS;
            localStorage.setItem("nav", JSON.stringify(NAVS));
        },
    },
};
</script>

<style>
.flip-list-move {
    transition: transform 0.3s;
}
</style>
<style lang="less" scoped>
.floors {
    padding-top: 20px;

    a {
        font-size: 13px;
        color: #888;
    }

    /deep/ .ant-card-head {
        padding: 0;
        min-height: 32px;
        font-size: 18px;
        font-family: "Chinese Quote", -apple-system, BlinkMacSystemFont,
            "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
            "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji",
            "Segoe UI Emoji", "Segoe UI Symbol";

        /deep/ .ant-card-head-title {
            padding: 0;
        }

        /deep/ .ant-card-extra {
            padding: 0;
        }
    }

    /deep/ .ant-card-body {
        padding: 10px 0;
    }
}

.wy-footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100px;
    margin: auto;
    border-top: 1px solid #eee;
}

.drag-item {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 20px;
    border-bottom: 1px solid #f3f3f3;
    font-size: 18px;
    cursor: move;
}

.reset {
    text-align: center;
    display: block;
    margin: 15px 0;
    text-decoration: underline;
    color: #999;
}
</style>
