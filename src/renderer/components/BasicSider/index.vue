<template>
    <div
        class="basic-sider"
        :class="{ borderB: Object.keys(current_song).length }"
    >
        <a-menu
            v-model="current"
            mode="inline"
            :selectable="false"
            :defaultOpenKeys="['playlist_create', 'playlist_collect']"
        >
            <a-menu-item-group key="recommend">
                <div slot="title">
                    <span>推荐</span>
                </div>
                <template v-for="item in recommendMap">
                    <a-menu-item :key="item.name">
                        <router-link class="link" :to="item.path">
                            <z-icon :type="item.meta.icon" />
                            <span>{{ item.meta.title }}</span>
                        </router-link>
                    </a-menu-item>
                </template>
            </a-menu-item-group>

            <a-menu-item-group key="my_music">
                <div slot="title">
                    <span>我的音乐</span>
                </div>
                <a-menu-item v-for="item in myMusicMap" :key="item.name">
                    <router-link class="link" :to="item.path">
                        <z-icon :type="item.meta.icon" />
                        <span>{{ item.meta.title }}</span>
                    </router-link>
                </a-menu-item>
            </a-menu-item-group>
        </a-menu>
        <template v-if="userPlaylists.length">
            <created />
            <subscribed />
        </template>

        <mini-card />
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ZIcon from "@/components/ZIcon";
import { recommendMap } from "../../router/modules/recommend.js";
import { myMusicMap } from "../../router/modules/myMusic.js";
import MusicView from "@/components/Common/musicView.vue";
import MiniCard from "./MiniCard";
import Created from "./Created";
import Subscribed from "./Subscribed";

export default {
    data() {
        return {
            current: [],
            recommendMap,
            myMusicMap,
            playlist: [],
        };
    },
    components: {
        ZIcon,
        MusicView,
        MiniCard,
        Created,
        Subscribed,
    },
    computed: {
        ...mapGetters("User", [
            "userId",
            "userPlaylists",
            "subscribedList",
            "createdList",
            "likedsongIds",
        ]),
        ...mapGetters("play", [
            "current_song",
            "source",
            "playing",
            "fullscreen",
        ]),
    },
    watch: {
        userId(newVal) {
            if (newVal !== "") {
                if (this.$store.state.App.isOnline) {
                    this._getUserPlaylist(newVal);
                    this.$store.dispatch("User/getUserLikedSongs");
                }
            } else {
                this.$store.commit("User/SET_USER_PLAYLISTS", []);
            }
        },
    },
    created() {
        if (this.userId && this.$store.state.App.isOnline) {
            this._getUserPlaylist(this.userId);
        }
    },
    methods: {
        async _getUserPlaylist(userId) {
            this.$store.dispatch("User/getUserPlaylists");
        },
        goLink(item) {
            this.$router.push({ path: `/playlist/${item.id}` });
        },
        cancelSubscribe(t, playlist) {
            this.$store.dispatch("User/subscribePlatlist", { t, playlist });
        },
        downloadAll(pid) {},
        showMusicView() {
            this.$store.commit("App/SHOW_VIEW", true);
        },
    },
};
</script>

<style lang="less">
.ant-popover.create-playlist-wrapper {
    .title {
        margin-bottom: 15px;
        font-size: 16px;
    }
    .footer {
        margin-top: 30px;
        /deep/ .ant-btn {
            line-height: 28px;
            height: 28px;
        }
    }
}
</style>
<style lang="less" scoped>
.basic-sider {
    height: 100%;
    overflow: auto;
    background-color: initial;
    &.borderB {
        border-bottom: 50px solid transparent;
    }
    .ant-menu {
        background-color: initial;
    }
    .ant-menu-item-group-title {
        font-size: 13px;
    }
    /deep/ .ant-menu-submenu {
        > .ant-menu {
            background-color: initial;
        }
    }
    .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
        background-color: transparent;
    }
    .ant-menu-item-selected {
        a {
            color: rgba(0, 0, 0, 0.65);
        }
    }
    /deep/ .ant-menu-submenu-title {
        color: rgba(0, 0, 0, 0.45);
        padding-left: 16px !important;
    }
    /deep/ .ant-menu-inline {
        border-right: 0;
        .ant-menu-item {
            margin-top: 0;
            margin-bottom: 2px;
            line-height: 33px;
            height: 33px;
            padding: 0 !important;
            font-size: 13px;
            .flex {
                display: flex;
                justify-content: space-between;
                align-items: center;
                a {
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
            .link {
                padding-left: 24px;
                overflow: hidden;
                text-overflow: ellipsis;
                padding-right: 5px;
                color: rgba(0, 0, 0, 0.85);
                font-family: "Microsoft JhengHei", "\660E\9ED1", Arial,
                    Helvetica;
                a {
                    color: inherit;
                    text-decoration: none;
                    font-family: "Microsoft JhengHei", "\660E\9ED1", Arial,
                        Helvetica;
                }
                &:hover {
                    color: rgba(0, 0, 0, 1);
                }
                &.router-link-exact-active,
                &.router-link-active {
                    border-left: 3px solid @primary-color;
                    background: #e6e6e6;
                    + span {
                        background: #e6e6e6;
                    }
                }
            }
            &:after {
                left: 0;
                right: unset;
                border-right: none;
            }
        }
    }
    /deep/ .anticon {
        font-size: 16px;
    }
    .ant-menu-item .anticon,
    .ant-menu-submenu-title .anticon {
        margin-right: 5px;
    }
    /deep/ .create-title,
    /deep/ .subscribed-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .anticon-plus-circle {
            font-size: 15px;
            color: rgba(0, 0, 0, 0.5);
        }
    }
}

.ellipsis {
    text-overflow: ellipsis;
    overflow: hidden;
}
</style>
