<template>
    <div>
        <loading v-show="loading" />
        <a-list class="intro">
            <a-list-item v-if="rank">
                <a-list-item-meta>
                    <div slot="title">
                        <h1>{{ rank.name }}</h1>
                    </div>
                    <div slot="description">
                        <div class="creator">
                            <a-avatar
                                class="creator-avatar"
                                :src="`${rank.creator.avatarUrl}?param=32y32`"
                            />
                            <span class="name">{{
                                rank.creator.nickname
                            }}</span>
                            <span class="time"
                                >{{ rank.createTime | toDate }}创建</span
                            >
                        </div>
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
                                    @click="subscribe(2, rank)"
                                    v-if="rank.subscribed"
                                >
                                    已收藏({{ rank.subscribedCount }})
                                </a-button>
                                <a-button
                                    size="small"
                                    icon="folder-add"
                                    @click="subscribe(1, rank)"
                                    v-else
                                >
                                    收藏({{ rank.subscribedCount }})
                                </a-button>
                            </li>
                            <li class="item" @click="share">
                                <a-button size="small" icon="share-alt"
                                    >分享</a-button
                                >
                            </li>
                            <li class="item">
                                <a-button size="small" icon="download"
                                    >下载全部</a-button
                                >
                            </li>
                        </ul>
                        <div class="desc">
                            <span>简介：</span>
                            <span
                                v-html="rank.description"
                                v-if="rank.description"
                            ></span>
                            <span v-else>无</span>
                        </div>
                    </div>
                    <img
                        slot="avatar"
                        width="200"
                        height="200"
                        v-lazy="`${rank.coverImgUrl}?param=200y200`"
                        :key="rank.id"
                    />
                </a-list-item-meta>
                <ul class="action">
                    <li>
                        <div>歌曲数</div>
                        <strong>{{ rank.trackCount }}</strong>
                    </li>
                    <li>
                        <div>播放数</div>
                        <strong>{{ rank.playCount }}</strong>
                    </li>
                </ul>
            </a-list-item>
        </a-list>
        <tab-bar :tabs="tabs" @search="searchSongs" />
        <keep-alive>
            <router-view :rank="rank" :tracks="songs" />
        </keep-alive>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import TabBar from "@/components/Common/tabBar";
import Loading from "@/components/Common/loading";
import { getTopDetail } from "@/api/rank";
import { getPlaylistDetail } from "@/api/playlist";
import { normalSong } from "@/utils/song";
import { uniqueData } from "@/utils/assist";
export default {
    name: "rank_id",
    data() {
        return {
            tabs: [
                {
                    name: "rank-id-songs",
                    label: "歌曲列表",
                },
                {
                    name: "rank-id-comment",
                    label: "评论",
                },
            ],
            rank: null,
            tracks: [],
            loading: false,
            searchKey: "",
        };
    },
    components: {
        TabBar,
        Loading,
    },
    activated() {
        this._getPlaylistDetail();
    },
    beforeRouteUpdate(to, from, next) {
        this._getPlaylistDetail(to.params.id);
        next();
    },
    computed: {
        ...mapGetters("User", ["likedPlaylistIds"]),
        ...mapGetters("play", ["current_play_list"]),
        songs() {
            return this.tracks.filter((track) => {
                return track.name.includes(this.searchKey);
            });
        },
        isLiked() {
            return this.likedPlaylistIds.includes(this.rank.id);
        },
    },
    methods: {
        _getPlaylistDetail() {
            this.loading = true;
            let id = this.$route.params.id;
            getPlaylistDetail(id).then((res) => {
                this.rank = res.playlist;
                let arr = [];
                res.playlist.tracks.forEach((track) => {
                    arr.push(normalSong(track));
                });
                this.tracks = arr;
                this.loading = false;
            });
        },
        _getTopDetail() {
            this.loading = true;
            let id = this.$route.params.id;
            getTopDetail(id).then((res) => {
                this.rank = res.playlist;
                let arr = [];
                res.playlist.tracks.forEach((track) => {
                    arr.push(normalSong(track));
                });
                this.tracks = arr;
                this.loading = false;
            });
        },
        searchSongs(value) {
            this.searchKey = value;
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
        subscribe(t, playlist) {
            this.$store.dispatch("User/subscribePlatlist", { t, playlist });
        },
        share() {
            let url = `https://music.163.com/#/discover/toplist?id=${this.rank.id}`;
            let _shareUrl =
                "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?";
            _shareUrl += "url=" + url;
            _shareUrl += "&showcount=" + 1; // 参数showcount是否显示分享总数,显示：'1'，不显示：'0'，默认不显示
            _shareUrl +=
                "&desc=" +
                "♪我发现一个不错的歌单-" +
                (this.rank.description || this.rank.name);
            _shareUrl += "&summary=" + "分享摘要";
            _shareUrl += "&title=" + "♪我发现一个不错的歌单-" + this.rank.name;
            _shareUrl += "&site=" + "https://music.163.com/";
            _shareUrl += "&pics=" + this.rank.coverImgUrl;
            this.$electron.remote.shell.openExternal(_shareUrl);
        },
    },
};
</script>

<style scoped>
.intro >>> .ant-list-item {
    align-items: initial;
}

.intro >>> .ant-avatar {
    border-radius: 0;
}

.intro >>> .ant-list-item-content {
    position: absolute;
    right: 0;
    top: 0;
}
</style>
<style lang="less" scoped>
.intro {
    padding: 20px;
    .creator {
        display: flex;
        align-items: center;
        .creator-avatar {
            border-radius: 50%;
            margin-right: 5px;
        }
        .name {
            margin-right: 5px;
            color: #333;
        }
        .time {
            font-size: 13px;
        }
    }
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
    .action {
        display: flex;
        text-align: right;
        font-size: 12px;
        li {
            padding: 0 10px;
            &:not(:last-child) {
                border-right: 1px solid #ddd;
            }
        }
    }
}

.desc {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}
</style>
