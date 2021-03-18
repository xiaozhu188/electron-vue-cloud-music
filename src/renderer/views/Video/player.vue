<template>
    <div class="player-wrapper">
        <div class="video-player" @dblclick="toggleFullscreen">
            <transition name="topbar">
                <div
                    class="topbar-wrapper"
                    :class="{
                        'topbar-with-fullscreen': isFullScreen,
                        hide: isFixed,
                    }"
                    v-show="!isFullScreen || isMoving"
                >
                    <div class="topbar">
                        <a-button size="small" @click="showMain"
                            >打开主界面</a-button
                        >
                        <div
                            class="title js-video-title"
                            v-resize="onResize"
                            v-if="videoData.name"
                        >
                            <div class="inner js-video-title-inner"
                                >{{ videoData.name }} {{ videoData.desc }}</div
                            >
                        </div>
                        <div class="actions">
                            <a-icon
                                type="pushpin"
                                @click="toggleAlwaysOnTop"
                                :theme="isAlwaysOnTop ? 'filled' : 'outlined'"
                            />
                            <a-icon type="minus" @click="minimize" />
                            <a-icon
                                :type="isFullScreen ? 'switcher' : 'border'"
                                @click="toggleFullscreen"
                            />
                            <a-icon
                                :type="
                                    isMaximized
                                        ? 'fullscreen-exit'
                                        : 'fullscreen'
                                "
                                @click="maximize"
                            />
                            <a-icon type="close" @click="close" />
                        </div>
                    </div>
                </div>
            </transition>
            <div ref="videoWrapper" class="video-wrapper" @click="togglePlay">
                <video
                    name="media"
                    ref="video"
                    controlslist="nodownload"
                    class="video"
                    @play="play"
                    @ended="onEnd"
                    @timeupdate="updateTime"
                    @waiting="onWaiting"
                    @playing="onPlaying"
                    @error="onError"
                    @dblclick="handleDblclick($event)"
                    :src="mvURL.url"
                    v-if="mvURL && mvURL.url"
                />
            </div>
            <ul class="more-list" v-if="mvURL && mvURL.url" v-show="isShowBrs">
                <li
                    class="item"
                    :class="{ current: item.key == mvURL.key }"
                    v-for="item in videoData.urls"
                    :key="item.key"
                    @click.stop="selectBrs(item)"
                >
                    <a-icon type="check" v-if="item.key == mvURL.key" />
                    {{ brsMap[item.key] }}
                </li>
            </ul>
            <ul class="more-list list-speed" v-show="isShowSpeed">
                <li
                    class="item"
                    v-for="item in speeds"
                    :class="{ current: speed === item }"
                    :key="item"
                    @click.stop="handleSpeedChange(item)"
                >
                    <a-icon type="check" v-if="speed === item" />
                    {{ item }}
                </li>
            </ul>
            <transition name="controls">
                <div
                    class="controls-wrapper"
                    :class="{
                        'controls-with-fullscreen': isFullScreen,
                        hide: isFixed,
                    }"
                    v-show="!isFullScreen || isMoving"
                >
                    <div class="video-controls">
                        <div class="video-progress">
                            <progress-bar
                                :percent="percent"
                                :bufferedPercent="bufferedPercent"
                                :waiting="waiting"
                                @percentChanged="onProgressBarChange"
                                @percentChanging="onProgressBarChanging"
                                :class="{ 'progress-bar-with-fixed': isFixed }"
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
                                    (videoData.duration / 1000) | duration
                                }}</span>
                            </div>
                            <div class="right">
                                <div class="voice">
                                    <z-icon
                                        :type="mutedIcon"
                                        @click.native="onMuted"
                                        title="静音"
                                        class="icon-voice"
                                    />
                                    <progress-bar
                                        :percent="volume"
                                        size="small"
                                        @percentChanged="handleVolumeChanged"
                                        class="bar-volume"
                                    />
                                </div>
                                <div class="brs">
                                    <div
                                        class="default"
                                        @click="showMoreList('br')"
                                        >{{ brsMap[mvURL.key] }}</div
                                    >
                                </div>
                                <div
                                    class="speed"
                                    @click="showMoreList('speed')"
                                >
                                    倍速×{{ speed }}
                                </div>
                                <div class="fullScreen" title="小窗口播放">
                                    <a-icon type="shrink" @click="shrinkWin" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
            <div class="mask-with-fixed" v-show="isFixed">
                <a-icon
                    type="arrows-alt"
                    title="标准模式"
                    @click="restoreWin"
                    class="icon-right-bottom"
                />
                <a-icon
                    :type="playIcon"
                    @click="togglePlaying"
                    class="icon-center"
                />
                <a-icon
                    type="close"
                    title="关闭"
                    @click="close"
                    class="icon-right-top"
                />
            </div>
            <a-icon
                :type="showMoerIcon"
                class="switch"
                @click="toggleShowMore"
                v-show="!isFixed"
            />
        </div>
        <div class="video-intro" ref="videoIntro" :class="{ show: isShowMore }">
            <a-tabs default-active-key="1" @change="handleTabChange">
                <a-tab-pane key="video" tab="视频">
                    <div class="mv-info">
                        <h5 class="title">视频介绍</h5>
                        <div
                            style="display: flex"
                            v-if="
                                videoType === 'video' &&
                                videoData.videoGroup.length
                            "
                        >
                            <span
                                style="
                                    minwidth: 60px;
                                    marginright: 3px;
                                    flex: 0 0 40px;
                                    color: #777;
                                "
                                >标签：</span
                            >
                            <a-breadcrumb>
                                <a-breadcrumb-item
                                    v-for="tag in videoData.videoGroup"
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
                        <div class="publishTime" v-if="videoData.publishTime"
                            >发布时间：{{ videoData.publishTime | toDate }}</div
                        >
                        <div class="playCount"
                            >播放次数：{{ videoData.playCount | toWan }}</div
                        >
                        <div class="desc">{{
                            videoData.desc || "暂无描述"
                        }}</div>
                    </div>
                    <div class="simi-mv">
                        <h5 class="title">相关视频</h5>
                        <div class="list">
                            <template v-if="videoType === 'video'">
                                <div
                                    class="item"
                                    v-for="(item, index) in simiList"
                                    :key="`${item.id}_${index}`"
                                    @click="ChangeVideo(item, 'video')"
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
                                                :to="`/artist/${item.userId}`"
                                                v-for="c in item.creator"
                                                :key="c.userId"
                                                >{{ c.userName }}
                                            </router-link>
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div
                                    class="item"
                                    v-for="(item, index) in simiList"
                                    :key="`${item.id}_${index}`"
                                    @click="ChangeVideo(item, 'mv')"
                                >
                                    <img class="avatar" :src="item.avatar" />
                                    <div class="info">
                                        <div class="name">{{ item.name }}</div>
                                        <div class="duration">{{
                                            item.duration | duration
                                        }}</div>
                                        <div class="artist">
                                            <artists :artists="item.artists" />
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </a-tab-pane>
                <a-tab-pane key="comment" tab="评论">
                    <template v-if="commentData">
                        <comment :commentData="commentData"></comment>
                        <a-pagination
                            size="small"
                            :total="commentData.total"
                            @change="handlePageChange"
                        />
                    </template>
                </a-tab-pane>
            </a-tabs>
        </div>
    </div>
</template>

<script>
import ProgressBar from "@/components/Common/progressBar";
import Comment from "@/components/Comment/index.vue";
import Loading from "@/components/Common/loading";
import Artists from "@/components/Common/artists";
import ZIcon from "@/components/ZIcon";
import { getMVInfo, getMvUrl, getSimiMV, subMV } from "@/api/mv";
import {
    getVideoUrl,
    getVideoDetail,
    getRelatedVideo,
    subVideo,
} from "@/api/video";
import { brsMap } from "@/config/config.js";
import { normalMV, normalVideo } from "@/utils/video";
import { getVideoComment } from "@/api/comment";
import { mapState } from "vuex";
import { debounce } from "lodash";

const { BrowserWindow } = require("electron").remote;
let win = BrowserWindow.getFocusedWindow();
let normalBounds = win.getNormalBounds();
let limit = 20;
let offset = 0;

export default {
    name: "Player",
    filters: {
        duration(duration, type) {
            function _pad(num) {
                return num < 10 ? "0" + num : num;
            }

            if (!duration) return "00:00";
            if (type && type === "ms") duration = duration / 1000;
            duration = Math.floor(duration);
            let minute = _pad((duration / 60) | 0);
            let second = _pad(duration % 60);
            return `${minute}:${second}`;
        },
    },
    data() {
        return {
            isFullScreen: win.isFullScreen(),
            isAlwaysOnTop: win.isAlwaysOnTop(),
            isMaximized: win.isMaximized(),
            waiting: false,
            isMoving: false,
            currentTime: 0,
            buffered: 0,
            videoData: {
                id: "",
                name: "",
                desc: "",
                videoGroup: [],
                duration: 0,
                cover: "",
                artists: [],
                brs: [],
                width: "",
                height: "",
                playCount: "",
                publishTime: "",
            },
            playing: false,
            urls: [],
            subVideoList: [], // 收藏的视频列表
            subscribing: false, // 收藏加载中
            mvURL: "",
            isFixed: false,
            isShowMore: false,
            isShowBrs: false,
            isShowSpeed: false,
            speeds: [0.5, 1.0, 1.25, 1.5, 2.0],
            brsMap,
            simiList: [],
            commentData: null,
        };
    },
    components: {
        ProgressBar,
        Comment,
        Loading,
        Artists,
        ZIcon,
    },
    computed: {
        ...mapState("Video", [
            "videoId",
            "videoType",
            "isMuted",
            "volume",
            "speed",
        ]),
        mutedIcon() {
            return this.isMuted ? "muted" : "no-muted";
        },
        percent() {
            return this.currentTime / (this.videoData.duration / 1000);
        },
        bufferedPercent() {
            return this.buffered / (this.videoData.duration / 1000);
        },
        playIcon() {
            return this.playing ? "pause-circle" : "play-circle";
        },
        showMoerIcon() {
            return this.isShowMore ? "vertical-left" : "vertical-right";
        },
    },
    watch: {
        speed(newVal) {
            const video = this.$refs.video;
            this.$nextTick(() => {
                video.playbackRate = newVal;
            });
        },
        volume(newVal) {
            const video = this.$refs.video;
            newVal = Number(newVal);
            if (newVal === 0) {
                this.$store.commit("play/SET_MUTED", true);
            }
            this.$nextTick(() => {
                video.volume = newVal;
            });
        },
        isMuted(newVal) {
            const video = this.$refs.video;
            this.$nextTick(() => {
                if (newVal) {
                    video.volume = 0;
                } else {
                    video.volume = this.volume;
                }
            });
        },
        videoId(newId) {
            setTimeout(() => {
                this.fetchData(newId);
                this._getSimi(newId);
                this.getComment(newId);
            }, 10);
        },
        isShowMore(newVal) {
            if (newVal) {
                this._getSimi();
            }
        },
        playing(newVal) {
            const video = this.$refs.video;
            this.$nextTick(() => {
                newVal ? video && video.play() : video && video.pause();
            });
        },
        isFullScreen(newVal) {
            win.setFullScreen(newVal);
            // if (this.isFixed) {
            //   this.isFixed = false
            // }
        },
        isAlwaysOnTop(newVal) {
            win.setAlwaysOnTop(newVal);
        },
        isMaximized(newVal) {
            if (newVal) {
                win.maximize();
            } else {
                win.restore();
            }
        },
        isFixed(newVal) {
            if (newVal) {
                const WIN_MIN_WIDTH = 400;
                win.setBounds({
                    x: 0,
                    y: 0,
                    width: WIN_MIN_WIDTH,
                    height: WIN_MIN_WIDTH * (9 / 16),
                });
                this.isAlwaysOnTop = true;
            } else {
                const WIN_MIN_WIDTH = 800;
                // win.maximize()
                win.setBounds(normalBounds);
                this.isAlwaysOnTop = false;
            }
        },
    },
    created() {
        this.mouseup_click_conflict_fix = false;
    },
    mounted() {
        this.fetchData();
        let biasX = 0;
        let biasY = 0;
        let that = this;
        let timer = null;
        let { width, height } = win.getBounds();
        const moveEvent = (e) => {
            win.setBounds({
                x: e.screenX - biasX,
                y: e.screenY - biasY,
                width,
                height,
            });
            this.mouseup_click_conflict_fix = true;
        };
        const overEvent = (e) => {
            if (!this.isFullScreen) return;
            this.isMoving = true;
            timer && clearTimeout(timer);
            timer = setTimeout(() => {
                this.isMoving = false;
            }, 1500);
        };

        this.$refs.videoWrapper.addEventListener("mousemove", overEvent);

        document.addEventListener("mousedown", function (e) {
            if (document.querySelector(".controls-wrapper").contains(e.target))
                return;
            win = BrowserWindow.getFocusedWindow();
            width = win.getBounds().width;
            height = win.getBounds().height;
            switch (e.button) {
                case 0:
                    biasX = e.x;
                    biasY = e.y;
                    document.addEventListener("mousemove", moveEvent);
                    break;
                case 2:
                    break;
            }
        });

        document.addEventListener("mouseup", (e) => {
            biasX = 0;
            biasY = 0;
            setTimeout(() => {
                this.mouseup_click_conflict_fix = false;
            }, 200);
            document.removeEventListener("mousemove", moveEvent);
        });

        document.addEventListener("keydown", (e) => {
            if (e.keyCode === 27) {
                this.isFullScreen = false;
            }
        });
    },
    methods: {
        onResize(data) {
            this.handleResize();
        },
        showMoreList(type) {
            if (type === "br") {
                this.isShowBrs = !this.isShowBrs;
                if (this.isShowSpeed) {
                    this.isShowSpeed = false;
                }
            } else if (type === "speed") {
                this.isShowSpeed = !this.isShowSpeed;
                if (this.isShowBrs) {
                    this.isShowBrs = false;
                }
            }
        },
        handleSpeedChange(speed) {
            if (this.speed === speed) return;
            this.$store.commit("Video/SET_SPEED", speed);
            this.isShowSpeed = false;
            if (this.isShowBrs) {
                this.isShowBrs = false;
            }
        },
        selectBrs(br) {
            if (this.mvURL.url === br.url) return;
            this.$refs.video.pause();
            let currentTime = this.$refs.video.currentTime;
            this.mvURL = br;
            this.isShowBrs = false;
            if (this.isShowSpeed) {
                this.isShowSpeed = false;
            }
            this.$nextTick(() => {
                this.$refs.video.currentTime = currentTime;
                this.$refs.video.play();
            });
        },
        handleVolumeChanged(persent) {
            if (persent < 0) persent = 0;
            if (persent > 1) persent = 1;
            this.$store.commit("Video/SET_VOLUME", Number(persent));
        },
        onMuted() {
            this.$store.commit("Video/SET_MUTED", !this.isMuted);
        },
        handleResize() {
            let titleDom = document.querySelector(".js-video-title");
            let titleInnerDom = titleDom.querySelector(".js-video-title-inner");
            let titleDomWidth = titleDom.getBoundingClientRect().width;
            let titleInnerDomWidth = titleInnerDom.getBoundingClientRect()
                .width;
            if (titleDom && titleInnerDom) {
                if (titleInnerDomWidth > titleDomWidth && titleDomWidth > 10) {
                    titleDom.style.setProperty("--diff", titleDomWidth + "px");
                    titleDom.style.setProperty(
                        "--duration",
                        (titleInnerDomWidth / titleDomWidth) * 8 + "s"
                    );
                } else {
                    titleDom.style.setProperty("--diff", titleDomWidth + "px");
                    titleDom.style.setProperty("--duration", 0);
                }
            }
        },
        handlePageChange(val) {
            offset = (val - 1) * limit;
            this.getComment();
        },
        handleTabChange(val) {
            if (val === "comment") {
                this.getComment();
            }
        },
        async getComment(videoId) {
            let id = videoId || this.videoId;
            let res = await getVideoComment(id, limit, offset);
            if (res.comments.length) {
                if (this.commentData) {
                    this.commentData.comments = res.comments;
                } else {
                    this.commentData = res;
                }
            }
        },
        ChangeVideo(item, type) {
            this.$store.commit("Video/SET_VIDEO_TYPE", type);
            this.$store.commit("Video/SET_VIDEO_ID", item.id);
        },
        showMain() {
            this.$electron.ipcRenderer.send("show-window");
        },
        toggleShowMore() {
            this.isShowMore = !this.isShowMore;
        },
        async fetchData(videoId) {
            this.playing = false;
            let id = videoId || this.videoId;
            let type = this.videoType;
            if (type === "video") {
                getVideoDetail(id).then((res) => {
                    this.videoData.name = res.data.title;
                    this.videoData.desc = res.data.description;
                    this.videoData.duration = res.data.durationms;
                    this.videoData.creator = res.data.creator;
                    this.videoData.width = res.data.width;
                    this.videoData.height = res.data.height;
                    this.videoData.playCount = res.data.playTime;
                    this.videoData.videoGroup = res.data.videoGroup;
                    this.videoData.publishTime = res.data.publishTime;
                    this.$nextTick(() => {
                        this.handleResize();
                    });
                });
                getVideoUrl(id).then((res) => {
                    this.videoData.urls = res.urls.map((item) => {
                        return {
                            key: item.r,
                            url: item.url,
                        };
                    });
                    this.mvURL = this.videoData.urls[0];
                    this.isLoading = false;
                });
            } else {
                getMVInfo(id).then((res) => {
                    if (!Object.keys(res.data.brs).length) {
                        this.$toast({
                            content: "暂无资源!",
                        });
                        return;
                    }
                    let urls = [];
                    for (let k in res.data.brs) {
                        let item = {};
                        item.key = k;
                        item.url = res.data.brs[k];
                        urls.push(item);
                    }

                    this.videoData.name = res.data.name;
                    this.videoData.desc = res.data.desc;
                    this.videoData.duration = res.data.duration;
                    this.videoData.artists = res.data.artists;
                    this.videoData.urls = urls;
                    this.videoData.playCount = res.data.playCount;

                    this.mvURL = urls[urls.length - 1];
                    // console.log(urls)
                    this.isLoading = false;
                    this.$nextTick(() => {
                        this.handleResize();
                    });
                });
            }
            win && win.show();
        },
        _getSimi(videoId) {
            let id = videoId || this.videoId;
            let type = this.videoType;
            if (type === "video") {
                getRelatedVideo(id).then((res) => {
                    this.simiList = res.data.map((item) => normalVideo(item));
                });
            } else {
                getSimiMV(id).then((res) => {
                    this.simiList = res.mvs.map((item) => normalMV(item));
                });
            }
        },
        handleDblclick(e) {
            e.preventDefault();
        },
        toggleFullscreen() {
            this.isShowMore = false;
            if (this.isFixed) {
                this.isFixed = false;
            }
            // if (this.isMaximized) {
            //   this.isMaximized = false
            // }
            this.isFullScreen = !this.isFullScreen;
        },
        toggleAlwaysOnTop() {
            this.isAlwaysOnTop = !this.isAlwaysOnTop;
        },
        close() {
            win.close();
        },
        minimize() {
            win.minimize();
        },
        maximize() {
            if (this.isFixed) {
                this.isFixed = false;
            }
            if (this.isFullScreen) {
                this.isFullScreen = false;
            }
            this.isMaximized = !this.isMaximized;
        },
        shrinkWin() {
            if (this.isFullScreen) {
                this.isFullScreen = false;
            }
            if (this.isMaximized) {
                this.isMaximized = false;
            }
            this.isFixed = true;
            this.isShowMore = false;
        },
        restoreWin() {
            if (this.isFullScreen) {
                this.isFullScreen = false;
            }
            if (this.isMaximized) {
                this.isMaximized = false;
            }
            this.isFixed = false;
        },
        togglePlay() {
            if (this.mouseup_click_conflict_fix) return;
            this.playing = !this.playing;
        },
        play() {
            this.playing = true;
            this.$store.commit("play/SET_PLAY_STATUS", false);
            // 如果设置静音将音频音量设置为0
            const video = this.$refs.video;
            this.$nextTick(() => {
                video.playbackRate = this.speed;
                if (this.isMuted) {
                    video.volume = 0;
                } else {
                    video.volume = this.volume;
                }
            });
        },
        onEnd() {
            this.playing = false;
        },
        updateTime(e) {
            this.currentTime = e.target.currentTime;
            const video = this.$refs.video;
            if (video) {
                const timeRanges = video.buffered;
                if (timeRanges.length !== 0) {
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
            if (!this.videoData.name) return;
            this.playing = !this.playing;
        },
        onProgressBarChange(percent) {
            const currentTime = (this.videoData.duration / 1000) * percent;
            this.currentTime = this.$refs.video.currentTime = currentTime;
        },
        onProgressBarChanging(percent) {
            const currentTime = (this.videoData.duration / 1000) * percent;
            this.currentTime = this.$refs.video.currentTime = currentTime;
        },
    },
};
</script>

<style>
html {
    --diff: 100px;
}
</style>
<style lang="less" scoped>
.hide {
    display: none !important;
}

.mask-with-fixed {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 100;

    &:hover {
        background: rgba(0, 0, 0, 0.2);

        .icon-center,
        .icon-right-bottom,
        .icon-right-top {
            display: block;
        }
    }

    .icon-center {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 40px;
        display: none;
    }

    .icon-right-bottom {
        position: absolute;
        right: 15px;
        bottom: 15px;
        font-size: 20px;
        display: none;
    }

    .icon-right-top {
        position: absolute;
        right: 15px;
        top: 15px;
        font-size: 20px;
        display: none;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}

.controls-enter-active,
.controls-leave-active {
    transition: all 0.5s;
}

.controls-enter,
.controls-leave-to {
    opacity: 0;
    transform: translateY(100%);
}

.topbar-enter-active,
.topbar-leave-active {
    transition: all 0.5s;
}

.topbar-enter,
.topbar-leave-to {
    opacity: 0;
    transform: translateY(-100%);
}

.player-wrapper {
    display: flex;
    height: 100vh;
    overflow: hidden;
    color: #fff;
}

.video-intro {
    position: relative;
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: 0;
    height: 100%;
    overflow: auto;
    background: #141414;
    transition: all 0.3s;
    color: #ddd;

    &.show {
        flex-basis: 400px;
    }

    .title {
        line-height: 1;
        font-size: 18px;
        border-bottom: 1px solid #252525;
        margin-bottom: 10px;
        padding-bottom: 10px;
        color: #ddd;
    }
    .mv-info {
        padding: 20px;
        margin-bottom: 15px;
        .briefDesc {
            font-size: 16px;
            margin-bottom: 5px;
        }
        .publishTime,
        .playCount {
            color: #777;
            margin-bottom: 5px;
            margin-top: 5px;
        }
        .desc {
            color: #777;
            line-height: 1.2;
        }
        .tag {
            color: #adadad;
            &:hover {
                color: #fff;
            }
        }
    }
    .simi-mv {
        padding: 20px;
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
                        color: #fff;
                        font-size: 12px;
                    }
                    .artist {
                        font-size: 14px;
                        color: #999;
                    }
                    .artist,
                    .artist a {
                        color: #9e9e9e;
                    }
                }
            }
        }
    }
    .ant-tabs {
        color: #ddd;
    }
    /deep/ .ant-tabs-bar {
        text-align: center;
        padding: 6px 0;
        border-bottom: none;
    }
    /deep/ .ant-tabs-nav {
        .ant-tabs-tab-active {
            color: #fff;
        }
    }
    /deep/ .comment-wrapper {
        padding: 0 20px;
        color: #999;
        .ant-comment-actions > li > span {
            color: #656565;
        }
    }
    .ant-pagination {
        margin-bottom: 20px;
        text-align: center;
    }
    /deep/ .ant-pagination-item a {
        color: #666;
    }
}

.video-player {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    user-select: none;

    .switch {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        padding: 10px 2px;
        font-size: 20px;
        background: rgba(0, 0, 0, 0.23);
        color: #fff;
        z-index: 10;
        cursor: pointer;
    }
}

.topbar-wrapper {
    flex: 0 0 50px;
    background: rgba(20, 20, 20, 1);

    &.topbar-with-fullscreen {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        z-index: 1;
        flex: unset;
        background: rgba(20, 20, 20, 0.8);
    }

    .topbar {
        height: 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 15px;
        /*-webkit-app-region: drag;*/

        .ant-btn {
            border-color: #999;
            border-radius: 20px;
            background: #111;
            color: #999;
            -webkit-app-region: no-drag;

            &.ant-btn-sm {
                height: 26px;
                font-size: 12px;
            }
        }

        .anticon {
            margin-left: 15px;
            font-size: 18px;
            color: #fff;
            -webkit-app-region: no-drag;
        }

        .title {
            margin: 0 15px;
            color: #fff;
            width: 100%;
            overflow: hidden;

            .inner {
                word-break: keep-all;
                width: fit-content;
                animation: move var(--duration) linear infinite;
                white-space: nowrap;
            }
        }

        .actions {
            display: flex;
            justify-content: flex-end;
        }
    }
}

.video-wrapper {
    height: 100%;
    flex: 1;
    position: relative;
    background: #000;

    .video {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
}

.controls-wrapper {
    flex: 0 0 60px;
    background: rgba(20, 20, 20, 1);

    &.controls-with-fullscreen {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        z-index: 1;
        flex: unset;
        background: rgba(20, 20, 20, 0.8);
    }
}

.video-controls {
    height: 100%;
    overflow: hidden;
    transition: all 0.3s;

    .video-progress {
        height: 20px;
        display: flex;
        align-items: center;
        padding: 0 15px;

        /deep/ .progress-bar.progress-bar-with-fixed {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 20;
        }
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
            color: #fff;
        }
    }
}

.more-list {
    position: absolute;
    right: 100px;
    bottom: 50px;
    width: 120px;
    z-index: 99;
    color: #fff;
    &.list-speed {
        right: 34px;
    }
    .item {
        position: relative;
        line-height: 30px;
        text-align: center;
        background: rgba(0, 0, 0, 0.8);
        cursor: pointer;
        &:hover,
        &.current {
            background: #c52f30;
            color: #fff;
        }
        .anticon {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
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
        justify-content: flex-end;
        align-items: center;
        flex: 1;
        .voice {
            flex: 0 0 120px;
            display: flex;
            align-items: center;
            margin: 0 20px;
            .icon-voice {
                margin-right: 10px;
                cursor: pointer;
            }
        }

        .brs,
        .speed {
            min-width: 50px;
            height: 23px;
            margin-right: 15px;
            padding: 0 6px;
            border: 1px solid #464545;
            border-radius: 12px;
            text-align: center;
        }

        .fullScreen {
            width: 40px;
            text-align: center;
            font-size: 18px;
        }
    }
}

@keyframes move {
    0%,
    5% {
        transform: translateX(0px);
    }
    95%,
    100% {
        transform: translateX(calc(-100% + var(--diff)));
    }
}
</style>
