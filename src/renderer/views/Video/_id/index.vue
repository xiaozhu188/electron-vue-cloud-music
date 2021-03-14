<template>
    <section class="mv-detail">
        <div class="col-l">
            <loading v-show="isLoading"></loading>
            <h5 class="video-title">
                {{ mv.title }}
                <router-link
                    :to="`/user?id=${mv.creator.userId}`"
                    class="artist"
                    v-if="mv"
                    >{{ mv.creator.nickname }}</router-link
                >
            </h5>
            <div
                class="video-wrapper"
                :class="{ 'full-screen': fullScreenFlag }"
                v-if="mv"
            >
                <div
                    class="background"
                    :style="`background-image:url(${mv.avatarUrl}?param=100y100)`"
                    v-if="mv.height > mv.width"
                ></div>
                <video
                    name="media"
                    autoplay
                    controlslist="nodownload"
                    ref="video"
                    class="video"
                    @play="play"
                    @ended="onEnd"
                    @timeupdate="updateTime"
                    @waiting="onWaiting"
                    @playing="onPlaying"
                    @error="onError"
                    :post="mv.coverUrl"
                    :src="urls[0].url"
                    v-if="urls.length"
                >
                </video>
                <div class="video-controls">
                    <div class="video-progress">
                        <progress-bar
                            :percent="percent"
                            :bufferedPercent="bufferedPercent"
                            :waiting="waiting"
                            @percentChanged="onProgressBarChange"
                            @percentChanging="onProgressBarChanging"
                        />
                    </div>
                    <div class="video-operation">
                        <div class="left">
                            <a-icon
                                :type="playIcon"
                                class="play-icon"
                                @click="togglePlaying"
                            />
                            <span class="time">{{
                                currentTime | duration
                            }}</span>
                            <i>|</i>
                            <span class="time">{{
                                (mv.durationms / 1000) | duration
                            }}</span>
                        </div>
                        <div class="right">
                            <div
                                class="fullScreen"
                                @click="toggleFullScreen"
                                title="网页全屏"
                            >
                                <a-icon :type="screenIcon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ul class="actions" v-if="mv">
                <li class="item">
                    <a-button
                        size="small"
                        :loading="subscribing"
                        icon="check"
                        @click.native="subscribe(mv.vid)"
                        v-if="isLiked || mv.isSubscribed"
                    >
                        已收藏
                    </a-button>
                    <a-button
                        size="small"
                        :loading="subscribing"
                        icon="folder-add"
                        @click.native="subscribe(mv.vid, 1)"
                        v-else
                    >
                        收藏视频
                    </a-button>
                </li>
                <li class="item" @click="share">
                    <a-button icon="share-alt" size="small"
                        >分享({{ mv.shareCount }})</a-button
                    >
                </li>
            </ul>

            <div class="video-comment">
                <comment :commentData="commentData"></comment>
                <infinite-loading
                    forceUseInfiniteWrapper=".ant-layout-content"
                    :identifier="infiniteId"
                    @infinite="loadmore"
                />
            </div>
        </div>
        <div class="col-r">
            <div class="mv-info">
                <h5 class="title">视频介绍</h5>
                <div style="display: flex" v-if="mv && mv.videoGroup.length">
                    <span style="marginright: 3px; flex: 0 0 40px">标签: </span>
                    <a-breadcrumb>
                        <a-breadcrumb-item
                            v-for="tag in mv.videoGroup"
                            :key="tag.id"
                        >
                            <router-link
                                :to="`/video?groupId=${tag.id}`"
                                class="tag"
                                >{{ tag.name }}</router-link
                            >
                        </a-breadcrumb-item>
                    </a-breadcrumb>
                </div>

                <div class="briefDesc">{{ mv.briefDesc }}</div>
                <div class="publishTime"
                    >发布时间：{{ mv.publishTime | toDate }}</div
                >
                <div class="playCount">播放次数：{{ mv.playTime | toWan }}</div>
                <div class="desc">{{ mv.description || "暂无描述" }}</div>
            </div>
            <div class="simi-mv">
                <h5 class="title">相关视频</h5>
                <div class="list">
                    <router-link
                        :to="`/video/${item.id}`"
                        class="item"
                        v-for="(item, index) in simiList"
                        :key="index"
                        replace
                    >
                        <img
                            class="avatar"
                            v-lazy="`${item.avatar}?param=140y80`"
                            :key="item.id"
                        />
                        <div class="info">
                            <div class="name">{{ item.name }}</div>
                            <div class="duration">{{
                                item.duration | duration
                            }}</div>
                            <div class="artist">
                                by
                                <router-link
                                    :to="`/artist/${c.userId}`"
                                    v-for="c in item.creator"
                                    :key="c.userId"
                                    >{{ c.userName }}</router-link
                                >
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import {
    getVideoUrl,
    getVideoDetail,
    getRelatedVideo,
    subVideo,
} from "@/api/video";
import { getVideoComment } from "@/api/comment";
import ProgressBar from "@/components/Common/progressBar";
import Comment from "@/components/Comment/index.vue";
import Loading from "@/components/Common/loading";
import Artists from "@/components/Common/artists";
import { normalVideo } from "@/utils/video";
import { getMv } from "@/api/sublist";
import { mapGetters, mapMutations } from "vuex";
function ajax(url, cb) {
    const xhr = new XMLHttpRequest();
    xhr.open("get", url);
    xhr.responseType = "blob"; // ""|"text"-字符串 "blob"-Blob对象 "arraybuffer"-ArrayBuffer对象
    xhr.onload = function () {
        console.log(xhr.response);
        var src = URL.createObjectURL(xhr.response);
        console.log(src);
        cb(src);
    };
    xhr.send();
}
export default {
    name: "video_id",
    data() {
        return {
            title: "视频详情",
            mv: "",
            mvURL: "",
            simiList: [],
            currentTime: 0,
            buffered: 0,
            fullScreenFlag: false,
            isLoading: false,
            urls: [],
            subVideoList: [], // 收藏的视频列表,
            subscribing: false, // 收藏加载中,
            waiting: false,

            commentData: null,
            limit: 20,
            offset: 0,
            infiniteId: +new Date(),
        };
    },
    components: {
        ProgressBar,
        Comment,
        Loading,
        Artists,
    },
    computed: {
        ...mapGetters("play", ["videoPlaying", "playing"]),
        percent() {
            return this.currentTime / (this.mv.durationms / 1000);
        },
        bufferedPercent() {
            return this.buffered / (this.mv.durationms / 1000);
        },
        playIcon() {
            return this.videoPlaying ? "pause-circle" : "play-circle";
        },
        screenIcon() {
            return this.fullScreenFlag ? "fullscreen-exit" : "fullscreen";
        },
        isLiked: {
            get() {
                return this.subVideoList.some((item) => item.id == this.mv.vid);
            },
        },
    },
    watch: {
        videoPlaying(newVideoPlaying) {
            const video = this.$refs.video;
            this.$nextTick(() => {
                newVideoPlaying ? video.play() : video.pause();
            });
        },
        mvURL(newURL) {
            if (this.mvURL == newURL) {
                return;
            }
            this.buffered = 0;
            this.$refs.video.currentTime = this.currentTime;
            this.$refs.video.play();
        },
    },
    activated() {
        this.isLoading = true;
        this.waiting = true;
        this.buffered = 0;
        this.currentTime = 0;
        this.offset = 0;
        this.commentData = null;
        this.infiniteId++;
        this._getVideo(this.$route.params.id);
        this.getSubVideo();
    },
    beforeRouteUpdate(to, from, next) {
        this.isLoading = true;
        this.waiting = true;
        this.buffered = 0;
        this.currentTime = 0;
        this.offset = 0;
        this.commentData = null;
        this.infiniteId++;
        this._getVideo(to.params.id);
        this.getSubVideo();
        next();
    },
    beforeRouteLeave(to, from, next) {
        this.buffered = 0;
        this.urls = [];
        next();
    },
    methods: {
        ...mapMutations("play", ["SET_VIDEO_PLAY_STATUS"]),
        _getVideo(id) {
            getVideoDetail(id).then((res) => {
                this.mv = res.data;
            });
            getVideoUrl(id).then((res) => {
                // this.mv = res.data
                this.urls = res.urls;
                this.mvURL = res.urls[0];
                this.isLoading = false;
            });
            getRelatedVideo(id).then((res) => {
                let arr = [];
                res.data.forEach((item) => {
                    arr.push(normalVideo(item));
                });
                this.simiList = arr;
                // console.log(this.simiList)
            });
        },
        async loadmore($state) {
            let id = this.$route.params.id;
            let res = await getVideoComment(id, this.limit, this.offset);
            if (res.comments.length) {
                if (this.commentData) {
                    this.commentData.comments.push(...res.comments);
                } else {
                    this.commentData = res;
                }
            }
            $state.loaded();
            if (res.more) {
                this.offset += this.limit;
            } else {
                $state.complete();
            }
        },
        getSubVideo() {
            getMv({}).then((res) => {
                let arr = [];
                res.data.forEach((video) => {
                    arr.push(normalVideo(video));
                });
                this.subVideoList = arr;
                // console.log(this.subVideoList)
            });
        },
        async subscribe(videoId, t = "") {
            try {
                this.subscribing = true;
                let res = await subVideo(videoId, t);
                if (res.code == 200) {
                    if (t == 1) {
                        this.$message.success("收藏成功!");
                        this.$set(this.mv, "isSubscribed", true);
                    } else {
                        this.$message.success("取消收藏成功!");
                        this.$set(this.mv, "isSubscribed", false);
                        let index = this.subVideoList.findIndex(
                            (item) => item.id == videoId
                        );
                        this.subVideoList.splice(index, 1);
                    }
                }
                this.subscribing = false;
            } catch (e) {
                this.subscribing = false;
            }
        },
        play() {
            this.SET_VIDEO_PLAY_STATUS(true);
            if (this.playing) {
                this.$store.commit("play/SET_PLAY_STATUS", false);
            }
        },
        onEnd() {
            this.SET_VIDEO_PLAY_STATUS(false);
        },
        updateTime(e) {
            this.currentTime = e.target.currentTime;
            const video = this.$refs.video;
            if (video) {
                const timeRanges = video.buffered;
                if (timeRanges.length != 0) {
                    this.buffered = timeRanges.end(timeRanges.length - 1);
                }
            }
        },
        onWaiting() {
            this.waiting = true;
        },
        onPlaying() {
            this.waiting = false;
        },
        onError() {
            this.waiting = false;
        },
        togglePlaying() {
            this.SET_VIDEO_PLAY_STATUS(!this.videoPlaying);
        },
        onProgressBarChange(percent) {
            const currentTime = (this.mv.durationms / 1000) * percent;
            console.log(currentTime);
            this.currentTime = this.$refs.video.currentTime = currentTime;
        },
        onProgressBarChanging(percent) {
            const currentTime = (this.mv.durationms / 1000) * percent;
            this.currentTime = this.$refs.video.currentTime = currentTime;
        },
        toggleFullScreen() {
            this.fullScreenFlag = !this.fullScreenFlag;
            this.$refs.video.webkitRequestFullScreen();
        },
        selectBrs(val) {
            if (this.mvURL == val) return;
            this.$refs.video.pause();
            this.currentTime = this.$refs.video.currentTime;
            this.mvURL = val;
        },
        share() {
            let url = `https://music.163.com/#/video?id=${this.$route.params.id}`;
            let _shareUrl =
                "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?";
            _shareUrl += "url=" + url;
            _shareUrl += "&showcount=" + 1; // 参数showcount是否显示分享总数,显示：'1'，不显示：'0'，默认不显示
            _shareUrl +=
                "&desc=" + "♪我发现一个不错的视频-" + this.mv.description;
            _shareUrl += "&summary=" + "分享摘要";
            _shareUrl += "&title=" + "♪我发现一个不错的视频-" + this.mv.title;
            _shareUrl += "&site=" + "https://music.163.com/";
            _shareUrl += "&pics=" + this.mv.coverUrl;
            this.$electron.remote.shell.openExternal(_shareUrl);
        },
    },
};
</script>

<style lang="less" scoped>
.mv-detail {
    max-width: 1200px;
    display: flex;
    justify-content: space-between;
    padding: 20px;
    margin: auto;
    .col-l {
        width: 70%;
        .video-title {
            font-size: 18px;
            margin-bottom: 10px;
            padding-left: 10px;
            border-left: 3px solid #c52f30;
            line-height: 1;
        }
        .artist {
            font-size: 14px;
            color: #999;
            margin-left: 6px;
        }
        .video-comment {
            padding-bottom: 50px;
        }
    }
    .video-wrapper {
        position: relative;
        background: rgba(0, 0, 0, 0.5);
        overflow: hidden;
        max-height: 500px;
        height: auto;
        .background {
            position: absolute;
            left: -20px;
            right: -20px;
            top: -20px;
            bottom: -20px;
            z-index: 1;
            background-repeat: no-repeat;
            background-size: cover;
            background-position: top;
            filter: blur(17px);
        }
        &.fix {
            position: fixed;
            right: 10px;
            bottom: 60px;
            z-index: 111;
            width: 400px;
            height: 225px;
            padding: 0;
            .video-controls {
                padding-top: 60%;
            }
        }
        .video {
            position: relative;
            z-index: 2;
            width: 100%;
            object-fit: contain;
            height: 100%;
            max-height: inherit;
            display: block;
        }
        &:hover .video-controls {
            transform: translateY(0);
        }
        .video-controls {
            position: absolute;
            left: 0;
            bottom: 0;
            right: 0;
            z-index: 10;
            background: rgba(0, 0, 0, 0.5);
            overflow: hidden;
            transition: all 0.3s;
            transform: translateY(100%);
            .video-progress {
                height: 20px;
                display: flex;
                align-items: center;
                padding: 0 10px;
            }
            .left {
                height: 100%;
                display: flex;
                align-items: center;
                .play-icon {
                    font-size: 27px;
                    cursor: pointer;
                }
                .time {
                    margin: 0 5px;
                }
            }
        }
    }

    .video-operation {
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: rgba(255, 255, 255, 0.7);
        padding: 0 10px;
        font-size: 13px;
        .left {
            height: 100%;
            display: flex;
            align-items: center;
            .icon {
                width: 30px;
                line-height: 30px;
                text-align: center;
                margin: 0 5px;
                border: 2px solid rgba(255, 255, 255, 0.5);
                border-radius: 50%;
            }
            .time {
                margin: 0 5px;
            }
        }
        .right {
            height: 100%;
            display: flex;
            align-items: center;
            .fullScreen {
                width: 40px;
                text-align: center;
                font-size: 18px;
            }
        }
    }
    .actions {
        margin: 15px 0;
        overflow: hidden;
        .item {
            float: left;
            margin-right: 10px;
        }
        button {
            font-size: 13px;
        }
    }
    .col-r {
        width: 30%;
        padding-left: 20px;
        padding-top: 28px;
        flex: 0 0 30%;
        .title {
            line-height: 1;
            font-size: 18px;
            border-bottom: 1px solid #eee;
            margin-bottom: 10px;
            padding-bottom: 10px;
        }
        .mv-info {
            margin-bottom: 15px;
            .breadcrumb-wrapper {
                _display: flex;
            }
            .briefDesc {
                font-size: 16px;
                margin-bottom: 5px;
            }
            .publishTime,
            .playCount {
                color: #777;
                margin-bottom: 5px;
            }
            .desc {
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                line-height: 1.2;
            }
            .tag {
                color: #005daf;
            }
        }
        .simi-mv {
            .list {
                .item {
                    display: flex;
                    margin-bottom: 10px;
                    cursor: pointer;
                    .avatar {
                        max-width: 140px;
                        height: 50%;
                        width: 50%;
                    }
                    .info {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        padding-left: 10px;
                        font-size: 11px;
                        .name,
                        .duration {
                            color: #111;
                            font-size: 12px;
                        }
                        .artist,
                        .artist a {
                            color: #999;
                        }
                    }
                }
            }
        }
    }
}
</style>
