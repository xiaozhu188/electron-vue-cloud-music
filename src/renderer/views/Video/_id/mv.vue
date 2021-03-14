<template>
    <section class="mv-detail">
        <div class="col-l">
            <loading v-show="isLoading"></loading>
            <h5 class="video-title" v-if="mv">
                {{ mv.name }}
                <span class="artist">
                    <artists :artists="mv.artists" />
                </span>
            </h5>
            <div
                class="video-wrapper"
                :class="{ 'full-screen': fullScreenFlag }"
            >
                <video
                    name="mv"
                    autoplay
                    controlslist="nodownload"
                    ref="mv"
                    class="video"
                    @play="onplay"
                    @ended="onEnd"
                    @timeupdate="updateTime"
                    @waiting="onWaiting"
                    @playing="onPlaying"
                    @error="onError"
                    :post="mv.coverUrl"
                    :src="mvURL.url"
                    v-if="mvURL && mvURL.url"
                >
                    <!-- <source :src="urls[0].url" type="video/mp4"> -->
                </video>
                <ul
                    class="brs-list"
                    v-if="mvURL && mvURL.url"
                    v-show="isShowBrs"
                >
                    <li
                        class="brs-item"
                        :class="{ current: item.key == mvURL.key }"
                        v-for="item in urls"
                        :key="item.key"
                        @click="selectBrs(item)"
                    >
                        <a-icon type="check" v-if="item.key == mvURL.key" />
                        {{ brsMap[item.key] }}
                    </li>
                </ul>
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
                                (mv.duration / 1000) | duration
                            }}</span>
                        </div>
                        <div class="right">
                            <div class="brs">
                                <div
                                    class="default"
                                    @click="isShowBrs = !isShowBrs"
                                    >{{ brsMap[mvURL.key] }}</div
                                >
                            </div>

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
                        @click.native="subscribe(mv.id)"
                        v-if="isLiked || mv.isSubscribed"
                        >已收藏</a-button
                    >
                    <a-button
                        size="small"
                        :loading="subscribing"
                        icon="folder-add"
                        @click.native="subscribe(mv.id, 1)"
                        v-else
                        >收藏MV</a-button
                    >
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
                <h5 class="title">MV介绍</h5>
                <div class="publishTime">发布时间：{{ mv.publishTime }}</div>
                <div class="playCount"
                    >播放次数：{{ mv.playCount | toWan }}</div
                >
                <div class="desc">{{
                    mv.briefDesc || mv.desc || "暂无描述"
                }}</div>
            </div>
            <div class="simi-mv">
                <h5 class="title">相关MV</h5>
                <div class="list">
                    <router-link
                        :to="`/mv/${item.id}`"
                        class="item"
                        v-for="(item, index) in simiList"
                        :key="`${item.id}_${index}`"
                        replace
                    >
                        <img class="avatar" :src="item.avatar" />
                        <div class="info">
                            <div class="name">{{ item.name }}</div>
                            <div class="duration">{{
                                item.duration | duration
                            }}</div>
                            <div class="artist">
                                <artists :artists="mv.artists" />
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { getMVInfo, getMvUrl, getSimiMV, subMV } from "@/api/mv";
import { getMVComment } from "@/api/comment";
import ProgressBar from "@/components/Common/progressBar";
import Comment from "@/components/Comment/index.vue";
import Loading from "@/components/Common/loading";
import Artists from "@/components/Common/artists";
import { normalMV, normalVideo } from "@/utils/video";
import { getMv } from "@/api/sublist";
import { brsMap } from "@/config/config.js";
import { mapGetters, mapMutations } from "vuex";

export default {
    name: "mv_id",
    data() {
        return {
            title: "mv详情",
            mv: "",
            mvURL: "",
            brsMap,
            simiList: [],
            currentTime: 0,
            buffered: 0,
            fullScreenFlag: false,
            isLoading: false,
            urls: [],
            subVideoList: [], // 收藏的视频列表,
            subscribing: false, // 收藏加载中,
            isShowBrs: false,
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
        ...mapGetters("User", ["userId"]),
        ...mapGetters("play", ["videoPlaying", "playing"]),
        percent() {
            return this.currentTime / (this.mv.duration / 1000);
        },
        bufferedPercent() {
            return this.buffered / (this.mv.duration / 1000);
        },
        playIcon() {
            return this.videoPlaying ? "pause-circle" : "play-circle";
        },
        screenIcon() {
            return this.fullScreenFlag ? "fullscreen-exit" : "fullscreen";
        },
        isLiked: {
            get() {
                return this.subVideoList.some((item) => item.id == this.mv.id);
            },
        },
    },
    watch: {
        videoPlaying(newVal) {
            const mv = this.$refs.mv;
            this.$nextTick(() => {
                newVal ? mv.play() : mv.pause();
            });
        },
        mvURL(newURL) {
            if (this.mvURL == newURL) {
                return;
            }
            this.buffered = 0;
            this.$refs.mv.currentTime = this.currentTime;
            this.$refs.mv.play();
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
        this._getMv(this.$route.params.id);
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
        this._getMv(to.params.id);
        this.getSubVideo();
        next();
    },
    beforeRouteLeave(to, from, next) {
        this.mvURL = "";
        next();
    },
    methods: {
        ...mapMutations("play", ["SET_VIDEO_PLAY_STATUS"]),
        open() {
            this.pause();
            const winURL =
                process.env.NODE_ENV === "development"
                    ? `http://localhost:9080/#fullscreen`
                    : `file://${__dirname}/index.html#fullscreen`;
            const { BrowserWindow, globalShortcut } = this.$electron.remote;
            console.log(this.$electron);
            let win = new BrowserWindow({
                width: 1000,
                height: 600,
                frame: false,
                fullscreen: true,
                webPreferences: {
                    nodeIntegration: true,
                    nodeIntegrationInWorker: true,
                    webSecurity: false,
                    // devTools: false
                },
            });
            // win.setFullScreen(true)
            globalShortcut.register("Alt+ESC", () => {
                // BrowserWindow.get
                this.$electron.remote.getCurrentWindow.close();
            });
            win.loadURL(winURL);
        },
        _getMv(id) {
            getMVInfo(id).then((res) => {
                this.mv = res.data;
                let urls = [];
                for (let k in res.data.brs) {
                    let item = {};
                    item.key = k;
                    item.url = res.data.brs[k];
                    urls.push(item);
                }
                this.urls = urls;
                this.mvURL = urls[urls.length - 1];
                console.log(this.urls);
                this.isLoading = false;
            });
            getSimiMV(id).then((res) => {
                let arr = [];
                res.mvs.forEach((item) => {
                    arr.push(normalMV(item));
                });
                this.simiList = arr;
            });
            // getMVComment(id).then(res => {
            //   this.comment = res
            // })
        },
        async loadmore($state) {
            let id = this.$route.params.id;
            let res = await getMVComment(id, this.limit, this.offset);
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
            if (!this.userId) return;
            getMv({}).then((res) => {
                let arr = [];
                res.data.forEach((video) => {
                    arr.push(normalVideo(video));
                });
                this.subVideoList = arr;
            });
        },
        async subscribe(videoId, t = "") {
            try {
                this.subscribing = true;
                let res = await subMV(videoId, t);
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
            } catch (error) {
                this.subscribing = false;
            }
        },
        onplay() {
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
            const video = this.$refs.mv;
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
        pause() {
            this.SET_VIDEO_PLAY_STATUS(false);
        },
        onProgressBarChange(percent) {
            const currentTime = (this.mv.duration / 1000) * percent;
            console.log(currentTime);
            this.currentTime = this.$refs.mv.currentTime = currentTime;
        },
        onProgressBarChanging(percent) {
            const currentTime = (this.mv.duration / 1000) * percent;
            this.currentTime = this.$refs.mv.currentTime = currentTime;
        },
        toggleFullScreen() {
            this.fullScreenFlag = !this.fullScreenFlag;
            this.$refs.mv.webkitRequestFullScreen();
        },
        selectBrs(br) {
            if (this.mvURL.url == br.url) return;
            this.$refs.mv.pause();
            let currentTime = this.$refs.mv.currentTime;
            this.mvURL = br;
            this.isShowBrs = false;
            this.$nextTick(() => {
                this.$refs.mv.currentTime = currentTime;
            });
        },
        share() {
            let url = `https://music.163.com/#/mv?id=${this.$route.params.id}`;
            let _shareUrl =
                "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?";
            _shareUrl += "url=" + url;
            _shareUrl += "&showcount=" + 1; // 参数showcount是否显示分享总数,显示：'1'，不显示：'0'，默认不显示
            _shareUrl += "&desc=" + "♪我发现一个不错的视频-" + this.mv.name;
            _shareUrl += "&summary=" + "分享摘要";
            _shareUrl += "&title=" + "♪我发现一个不错的视频-" + this.mv.name;
            _shareUrl += "&site=" + "https://music.163.com/";
            _shareUrl += "&pics=" + this.mv.cover;
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
        background: #000;
        overflow: hidden;
        max-height: 500px;
        height: auto;
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
    .brs-list {
        position: absolute;
        right: 0;
        bottom: 50px;
        width: 120px;
        z-index: 99;
        color: #fff;
        .brs-item {
            line-height: 30px;
            text-align: center;
            background: rgba(0, 0, 0, 0.8);
            cursor: pointer;
            &:hover,
            &.current {
                background: #c52f30;
                color: #fff;
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
