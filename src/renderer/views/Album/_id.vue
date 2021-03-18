<template>
    <div>
        <loading v-show="loading" />
        <a-list class="intro" v-if="album">
            <a-list-item>
                <a-list-item-meta>
                    <div slot="title">
                        <a-tag class="tag">专辑</a-tag>
                        <h1>{{ album.name }}</h1>
                    </div>

                    <div slot="description" class="desc">
                        <ul class="actions">
                            <li class="item">
                                <a-button-group size="small">
                                    <a-button
                                        type="primary"
                                        icon="play-circle"
                                        @click="play"
                                        >播放全部</a-button
                                    >
                                    <a-button
                                        type="primary"
                                        icon="plus"
                                        @click="addToList"
                                    />
                                </a-button-group>
                            </li>
                            <li class="item">
                                <a-button
                                    size="small"
                                    icon="check"
                                    @click="subscribe(2, album)"
                                    v-if="isSubscribed"
                                >
                                    已收藏
                                </a-button>
                                <a-button
                                    size="small"
                                    icon="folder-add"
                                    @click="subscribe(1, album)"
                                    v-else
                                >
                                    收藏
                                </a-button>
                            </li>
                            <li class="item" @click="share">
                                <a-button size="small" icon="share-alt"
                                    >分享({{ album.info.shareCount }})</a-button
                                >
                            </li>
                            <li class="item">
                                <a-button
                                    size="small"
                                    icon="download"
                                    @click="downloadAll"
                                    >下载全部({{ album.size }}首)</a-button
                                >
                            </li>
                        </ul>
                        <div>
                            歌手：
                            <artists :artists="album.artists"></artists>
                        </div>
                        <div>时间：{{ album.publishTime | toDate }}</div>
                        <div>简介：{{ album.description }}</div>
                    </div>
                    <div class="album-avatar" slot="avatar">
                        <img
                            width="200"
                            height="200"
                            v-lazy="`${album.picUrl}?param=200y200`"
                            :key="album.id"
                        />
                    </div>
                </a-list-item-meta>
            </a-list-item>
        </a-list>

        <tab-bar :tabs="tabs" @search="searchSongs" />
        <keep-alive>
            <router-view :tracks="tracks" />
        </keep-alive>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import TabBar from "@/components/Common/tabBar";
import Artists from "@/components/Common/artists";
import Loading from "@/components/Common/loading";
import { normalSong } from "@/utils/song";
import { getAlbum } from "@/api/album";
import { uniqueData } from "@/utils/assist";
import { getSubAlbum } from "@/api/sublist";
export default {
    name: "album_id",
    data() {
        return {
            album: null,
            songs: [],
            searchKey: "",
            loading: false,
            sublist: [],
            tabs: [
                {
                    name: "album-id-songs",
                    label: "歌曲列表",
                },
                {
                    name: "album-id-comment",
                    label: "评论",
                },
            ],
        };
    },
    components: {
        Artists,
        TabBar,
        Loading,
    },
    activated() {
        this._getAlbum(this.$route.params.id);
    },
    beforeRouteUpdate(to, from, next) {
        this._getAlbum(to.params.id);
        next();
    },
    computed: {
        tracks() {
            return this.songs.filter((track) => {
                return track.name.includes(this.searchKey);
            });
        },
        isSubscribed() {
            return (
                this.sublist.findIndex((item) => item.id === this.album.id) >= 0
            );
        },
        ...mapGetters("play", ["current_play_list"]),
    },
    methods: {
        searchSongs(value) {
            this.searchKey = value;
        },
        _getSubAlbum() {
            getSubAlbum({ limit: 1000 }).then((res) => {
                this.sublist = res.data;
            });
        },
        _getAlbum(id) {
            this.loading = true;
            getAlbum(id).then((res) => {
                this.album = res.album;
                this.songs = res.songs.map((song) => {
                    return normalSong(song);
                });
                this.loading = false;
                this._getSubAlbum();
            });
        },
        downloadAll() {
            this.songs.forEach((song) => {
                this.$set(song, "isWaitting", true);
            });
            this.$store.dispatch("Download/addDownloadQueue", this.songs);
        },
        play() {
            this.$store.dispatch("play/selectPlay", {
                tracks: this.tracks,
                index: 0,
            });
        },
        addToList() {
            let current_play_list = this.current_play_list.slice();
            let list = current_play_list.concat(this.tracks);
            list = uniqueData(list);
            this.$store.commit("play/SET_CURRENT_PLAY_LIST", list);
        },
        subscribe(t, album) {
            this.$store
                .dispatch("User/subscribeAlbum", { t, album })
                .then((code) => {
                    if (code === 200) {
                        if (t === 1) {
                            this.sublist.push(album);
                        } else {
                            let index = this.sublist.findIndex(
                                (item) => item.id === album.id
                            );
                            this.sublist.splice(index, 1);
                        }
                    }
                });
        },
        share() {
            let url = `https://music.163.com/#/discover/toplist?id=${this.$route.params.id}`;
            let _shareUrl =
                "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?";
            _shareUrl += "url=" + url;
            _shareUrl += "&showcount=" + 1; // 参数showcount是否显示分享总数,显示：'1'，不显示：'0'，默认不显示
            _shareUrl +=
                "&desc=" +
                "♪我发现一个不错的网易云专辑-" +
                (this.album.description || this.album.name);
            _shareUrl += "&summary=" + "分享摘要";
            _shareUrl +=
                "&title=" + "♪我发现一个不错的网易云专辑-" + this.album.name;
            _shareUrl += "&site=" + "https://music.163.com/";
            _shareUrl += "&pics=" + this.album.picUrl;
            this.$electron.remote.shell.openExternal(_shareUrl);
        },
    },
};
</script>

<style lang="less" scoped>
.tag {
    padding: 0 10px;
    line-height: 23px;
    height: 24px;
    border-radius: 2px;
    background-color: @primary-color;
    border-color: @primary-color;
    color: #fff;
    float: left;
}

.intro {
    padding: 20px;
    .actions {
        margin: 15px 0;
        .item {
            display: inline-block;
            margin-right: 10px;
        }
        button {
            font-size: 13px;
        }
    }
}

.album-avatar {
    position: relative;
    width: 200px;
    height: 200px;
    margin-right: 30px;
    &::after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 225px;
        background: url("../../assets/images/album_cover.png") center / cover
            no-repeat;
    }
}
</style>
