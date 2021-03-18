<template>
    <div class="tray">
        <div class="tray-box">
            <div class="control-box">
                <a-icon
                    type="step-backward"
                    class="control-icon step"
                    title="上一曲"
                    @click="backward"
                />
                <a-icon
                    :type="playIcon"
                    theme="filled"
                    class="control-icon"
                    :title="playTitle"
                    @click="togglePlay"
                />
                <a-icon
                    type="step-forward"
                    class="control-icon step"
                    title="下一曲"
                    @click="forward"
                />
            </div>

            <div
                class="volume-box"
                :title="`音量:${isMuted ? 0 : volume * 100}%`"
            >
                <z-icon
                    :type="mutedIcon"
                    @click.native="onMuted"
                    title="静音"
                    style="cursor: pointer; margin-right: 4px"
                />
                <progress-bar
                    :percent="volume"
                    size="small"
                    @percentChanged="onVolumeChanged"
                    class="bar-volume"
                />
            </div>

            <div class="song-box">
                <span
                    class="song-name"
                    v-if="current_song && current_song.name"
                    >{{ current_song.name }}</span
                >
                <span class="song-name" v-else>听见好时光</span>
                <span class="play-mode" :title="modeTitle" @click="changeMode">
                    <z-icon :type="modeIcon" />
                </span>
            </div>

            <ul>
                <li class="menu-item" @click="showMain">
                    <a-icon type="desktop" />
                    <span>显示主界面</span>
                </li>
                <li
                    class="menu-item"
                    :class="{ disabled: !isShowDesktoplyric }"
                    @click="doLyric(false)"
                    v-if="isFixed"
                >
                    <z-icon type="geci" />
                    <span>解锁桌面歌词</span>
                </li>
                <li
                    class="menu-item"
                    :class="{ disabled: !isShowDesktoplyric }"
                    @click="doLyric(true)"
                    v-else
                >
                    <z-icon type="geci" />
                    <span>锁定桌面歌词</span>
                </li>
                <li class="menu-item" @click="restart">
                    <a-icon type="sync" />
                    <span>重启</span>
                </li>
                <li class="menu-item quit" @click="quit">
                    <a-icon type="poweroff" />
                    <span>退出网易云</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import ZIcon from "@/components/ZIcon";
import ProgressBar from "@/components/Common/progressBar";
import ls from "store";
import { playMode } from "@/config/config";
export default {
    name: "tray",
    data() {
        return {
            isFixed: false,
        };
    },
    components: { ZIcon, ProgressBar },
    computed: {
        ...mapGetters("play", [
            "current_play_list",
            "current_song_index",
            "current_song",
            "playing",
            "mode",
            "volume",
            "isMuted",
            "isShowDesktoplyric",
        ]),
        ...mapState("play", ["lyric"]),
        playIcon() {
            return this.playing ? "pause-circle" : "play-circle";
        },
        mutedIcon() {
            return this.isMuted ? "muted" : "no-muted";
        },
        modeIcon() {
            return this.mode === playMode.sequence
                ? "liebiaoxunhuan"
                : this.mode === playMode.loop
                ? "danquxunhuan1"
                : this.mode === playMode.random
                ? "suijibofang"
                : "FMcollect";
        },
        modeTitle() {
            return this.mode === playMode.sequence
                ? "顺序播放"
                : this.mode === playMode.loop
                ? "循环播放"
                : this.mode === playMode.random
                ? "随机播放"
                : "心动模式";
        },
        playTitle() {
            return this.playing ? "暂停" : "播放";
        },
    },
    methods: {
        onMuted() {
            this.$store.commit("play/SET_MUTED", !this.isMuted);
        },
        onVolumeChanged(persent) {
            if (persent < 0) persent = 0;
            if (persent > 1) persent = 1;
            this.$store.commit("play/SET_VOLUME", Number(persent));
        },
        backward() {
            this.$electron.ipcRenderer.send("prev-play", {
                value: this.current_song_index,
            });
        },
        forward() {
            this.$electron.ipcRenderer.send("next-play", {
                value: this.current_song_index,
            });
        },
        togglePlay() {
            this.$electron.ipcRenderer.send("toggle-play", {
                value: !this.playing,
            });
        },
        restart() {
            this.$electron.ipcRenderer.send("restart");
        },
        quit() {
            this.$electron.ipcRenderer.send("window-close");
        },
        showMain() {
            this.$electron.ipcRenderer.send("show-window");
        },
        changeMode() {
            let mode = this.mode;
            mode = ++mode % (Object.keys(playMode).length - 1);
            this.$store.commit("play/SET_MODE", mode);
        },
        doLyric(flag) {
            if (!this.isShowDesktoplyric) return;
            this.isFixed = flag;
            this.$electron.ipcRenderer.send("fix-desktop-lyric", this.isFixed);
        },
    },
};
</script>

<style lang="less" scoped>
.tray {
    position: relative;
    width: 200px;
    height: 350px;
    z-index: 9999999;
    opacity: 0.97;
    .tray-box {
        position: absolute;
        left: 8px;
        top: 8px;
        right: 8px;
        bottom: 8px;
        background: #fff;
        border: 1px solid rgba(0, 0, 0, 0.08);
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.08);
        .control-box {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 20px;
            padding: 0 15px;
            .control-icon {
                font-size: 44px;
                color: rgba(0, 0, 0, 0.7);
                cursor: pointer;
                &:hover {
                    color: rgba(0, 0, 0, 1);
                }
                &.step {
                    font-size: 18px;
                    padding: 5px;
                    border: 1px solid #333;
                    border-radius: 50%;
                }
            }
        }
        .song-box {
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 15px;
            .song-name {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: #222;
                font-size: 14px;
            }
            .play-mode {
                flex: 0 0 24px;
                color: #666;
                font-size: 16px;
                cursor: pointer;
            }
        }
        .volume-box {
            height: 36px;
            display: flex;
            align-items: center;
            padding: 0 15px;
        }
        .menu-item {
            height: 42px;
            display: flex;
            align-items: center;
            padding: 0 15px;
            color: #222;
            font-size: 14px;
            &.disabled {
                color: #999;
            }
            &:hover {
                background: #f3f5f9;
            }
            &.quit {
                border-top: 1px solid #ddd;
                margin: 4px 0;
            }
            .anticon {
                margin-right: 15px;
            }
        }
    }
}
</style>
