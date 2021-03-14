<template>
    <a-menu
        mode="inline"
        :selectable="false"
        :defaultOpenKeys="['playlist_create']"
    >
        <a-sub-menu key="playlist_create">
            <div slot="title" class="create-title">
                <span>创建的歌单</span>
                <a-popover
                    placement="rightTop"
                    overlayClassName="create-playlist-wrapper"
                    :overlayStyle="{ width: '230px' }"
                    trigger="click"
                    v-model="visible"
                    @click.stop
                >
                    <template slot="content">
                        <div class="title">新建歌单</div>
                        <playlist-create v-model="formData" />
                        <div class="footer">
                            <a-button
                                type="primary"
                                :loading="loading"
                                :disabled="formData.name === ''"
                                @click="createPlaylist"
                                >创建</a-button
                            >
                            <a-button @click="hide">取消</a-button>
                        </div>
                    </template>
                    <span title="新建歌单">
                        <a-icon type="plus-circle" theme="filled" />
                    </span>
                </a-popover>
            </div>

            <a-menu-item v-for="(item, index) in createdList" :key="item.id">
                <a-dropdown
                    :trigger="['contextmenu']"
                    overlayClassName="sider-right-menu"
                >
                    <div class="flex" v-if="index == 0" :title="item.name">
                        <router-link class="link" :to="`/playlist/${item.id}`">
                            <span class="ellipsis">
                                <a-icon type="heart" />
                                <span>{{ item.name }}</span>
                            </span>
                        </router-link>
                        <a-tooltip title="开启心动模式">
                            <span
                                @click.prevent.stop="xindong(item.id)"
                                style="paddingright: 5px"
                            >
                                <z-icon type="FMcollect" />
                            </span>
                        </a-tooltip>
                    </div>

                    <div class="flex" :title="item.name" v-else>
                        <router-link class="link" :to="`/playlist/${item.id}`">
                            <z-icon type="yinleliebiaokuai" />
                            <span>{{ item.name }}</span>
                        </router-link>
                    </div>

                    <a-menu slot="overlay">
                        <a-menu-item key="1">
                            <div @click="deletePlaylist(item.id)">
                                <a-icon type="delete" />
                                <span>删除歌单(Delete)</span>
                            </div>
                        </a-menu-item>
                        <a-menu-item key="2">
                            <div @click="playAll(item.id)">
                                <a-icon type="play-circle" />
                                <span>播放全部</span>
                            </div>
                        </a-menu-item>
                    </a-menu>
                </a-dropdown>
            </a-menu-item>
        </a-sub-menu>
    </a-menu>
</template>

<script>
import { mapGetters } from "vuex";
import ZIcon from "@/components/ZIcon";
import PlaylistCreate from "@/components/Playlist/Create.vue";

import { getUserPlaylist, getUserLikeSongs } from "@/api/user";
import { getPlaylistDetail } from "@/api/playlist";
import { getIntelligence } from "@/api/song";
import { normalSong } from "@/utils/song";
import { playMode } from "@/config/config";
export default {
    data() {
        return {
            visible: false,
            loading: false,
            formData: {
                name: "",
                privacy: false,
            },
        };
    },
    components: {
        ZIcon,
        PlaylistCreate,
    },
    computed: {
        ...mapGetters("User", ["userId", "createdList", "likedsongIds"]),
    },
    methods: {
        deletePlaylist(id) {
            this.$store.dispatch("User/deletePlaylist", id);
        },
        createPlaylist() {
            this.loading = true;
            this.$store
                .dispatch("User/createPlaylist", this.formData)
                .then(() => {
                    setTimeout(() => {
                        this.loading = false;
                        this.hide();
                    }, 300);
                });
        },
        playAll(pid) {
            getPlaylistDetail(pid).then((res) => {
                let tracks = res.playlist.tracks.map((track) => {
                    return normalSong(track);
                });
                this.$store.dispatch("play/selectPlay", { tracks, index: 0 });
            });
        },
        async xindong(pid) {
            if (this.hideLoading) return;
            this.hideLoading = this.$message.loading("正在开启心动模式..", 0);
            try {
                let songId;
                if (
                    this.current_song &&
                    !this.current_song.folder &&
                    this.current_song.id
                ) {
                    // 如果当前有播放歌曲且不是本地歌曲
                    songId = this.current_song.id;
                } else {
                    let { ids } = await getUserLikeSongs(this.userId);
                    songId = ids[0];
                }
                let res = await getIntelligence(songId, pid);
                if (res.data.length) {
                    let tracks = res.data.map((song) => {
                        return normalSong(song.songInfo);
                    });
                    this.$store.dispatch("play/selectPlay", {
                        tracks,
                        index: 0,
                    });
                }
                this.$store.commit("play/SET_MODE", playMode.xindong);
                this.hideLoading();
                this.hideLoading = null;
            } catch (e) {
                this.hideLoading();
                this.hideLoading = null;
            }
        },
        hide() {
            this.visible = false;
        },
    },
};
</script>
