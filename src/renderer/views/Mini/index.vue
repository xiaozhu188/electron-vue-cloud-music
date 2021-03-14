<template>
    <div class="mini">
        <div class="mini-bar">
            <div class="avatar-wrapper">
                <img
                    v-lazy="current_song.avatar"
                    width="100%"
                    :key="current_song.id"
                    v-if="current_song.avatar"
                />
                <z-icon type="yinle" style="fontsize: 30px" v-else />
            </div>
            <div class="song-info no-drag">
                <div class="song-name">
                    <span>{{ current_song.name }}</span>
                    <small>{{ artistStr }}</small>
                </div>
                <artists :artists="current_song.artist" v-if="!current_lyric" />
                <div class="playing-lyric no-drag" v-else>
                    <transition name="lyric">
                        <span
                            class="current-lyric"
                            :title="current_lyric"
                            :key="current_lyric"
                            >{{ current_lyric }}</span
                        >
                    </transition>
                </div>
                <div class="controls">
                    <a-icon
                        type="step-backward"
                        class="icon no-drag"
                        @click="backward"
                    />
                    <a-icon
                        :type="playIcon"
                        class="icon no-drag"
                        @click="togglePlay"
                    />
                    <a-icon
                        type="step-forward"
                        class="icon no-drag"
                        @click="forward"
                    />
                </div>
            </div>
            <song-heart
                class="item no-drag"
                :isLiked="likedsongIds.includes(current_song.id)"
                @heartClick="
                    (isLike) => {
                        _handleLikeSong({ songId: current_song.id, isLike });
                    }
                "
                title="喜欢歌曲"
                v-show="!current_song.folder"
            />
            <a-icon
                class="item no-drag"
                type="bars"
                @click="showList"
                title="播放列表"
            />
            <z-icon
                class="item no-drag"
                type="juxing"
                @click.native="setFrame"
                title="普通模式"
            />
        </div>

        <div class="mini-list" ref="scrollWrapper">
            <ul v-if="current_play_list.length">
                <li
                    v-for="(song, index) in current_play_list"
                    :key="song.id"
                    @dblclick="playSong(current_play_list, index)"
                >
                    <playing
                        :playing="playing"
                        v-if="current_song.id == song.id"
                    />
                    <span v-else>{{
                        index > 8 ? index + 1 : "0" + (index + 1)
                    }}</span>
                    <span class="song-name" :title="song.name">{{
                        song.name
                    }}</span>
                    <span class="duration">{{ song.duration | duration }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import ZIcon from "@/components/ZIcon";
import SongHeart from "@/components/Common/song-heart";
import Playing from "@/components/Common/playing";
import Artists from "@/components/Common/artists";

export default {
    name: "mini",
    data() {
        return {
            isShowList: false,
        };
    },
    components: {
        ZIcon,
        SongHeart,
        Playing,
        Artists,
    },
    computed: {
        ...mapState("play", ["current_lyric", "playing"]),
        ...mapGetters("play", [
            "current_play_list",
            "original_play_list",
            "current_song_index",
            "current_song",
        ]),
        ...mapGetters("User", ["likedsongIds"]),
        current_song() {
            return this.current_play_list[this.current_song_index] || {};
        },
        playIcon() {
            return this.playing ? "pause-circle" : "play-circle";
        },
        artistStr() {
            return this.current_song.artist.map((item) => item.name).join(",");
        },
    },
    watch: {
        isShowList(newVal, oldVal) {
            if (newVal === true && oldVal === false) {
                let index = this.current_play_list.findIndex((item) => {
                    return item.id === this.current_song.id;
                });
                let top = index * 35;
                this.$refs.scrollWrapper.scrollTo({ top, behavior: "smooth" });
            }
        },
    },
    methods: {
        togglePlay() {
            this.$electron.ipcRenderer.send("toggle-play", {
                value: !this.playing,
            });
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
        playSong(tracks, index) {
            this.$electron.ipcRenderer.send("play-song", {
                value: { tracks, index },
            });
        },
        setFrame() {
            this.$electron.ipcRenderer.send("toggle-mini", {
                value: false,
            });
        },
        showList() {
            this.isShowList = !this.isShowList;
            this.$electron.ipcRenderer.send("resize-mini", {
                height: this.isShowList ? 500 : 48,
            });
        },
        _handleLikeSong({ songId, isLike }) {
            this.$store.dispatch("User/handleLikeSong", { songId, isLike });
        },
    },
};
</script>

<style lang="less" scoped>
.mini {
    background: #fff;
    .mini-bar {
        display: flex;
        align-items: center;
        height: 50px;
        -webkit-app-region: drag;
        .avatar-wrapper {
            width: 50px;
            height: 50px;
            flex: 0 0 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f7f7f7;
            overflow: hidden;
            -webkit-user-select: none;
            -webkit-user-drag: none;
            pointer-events: none;
        }
        .item {
            padding: 0 5px;
            opacity: 0.8;
            cursor: pointer;
            &:hover {
                opacity: 1;
            }
        }
        .song-info {
            position: relative;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100%;
            padding-left: 10px;
            color: #111;
            overflow: hidden;
            .song-name {
                height: 25px;
                line-height: 25px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                color: #000;
                font-weight: 600;
                small {
                    color: #999;
                    font-weight: normal;
                }
            }
            .playing-lyric {
                height: 25px;
                position: relative;
                overflow: hidden;
                color: #333;
                .current-lyric {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    top: 0;
                    z-index: 1;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    font-size: 13px;
                }
            }
            &:hover {
                .controls {
                    display: flex;
                }
            }
            .controls {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                top: 0;
                z-index: 1;
                background: #fafafa;
                align-items: center;
                justify-content: space-evenly;
                display: none;
                .icon {
                    color: #c62f2f;
                    font-size: 26px;
                    opacity: 0.8;
                    cursor: pointer;
                    &:hover {
                        opacity: 1;
                    }
                }
            }
        }
    }
    .mini-list {
        max-height: 550px;
        overflow-y: auto;
        li {
            display: flex;
            align-items: center;
            height: 35px;
            padding: 0 5px;
            background: #fff;
            &:nth-child(odd) {
                background: #f3f5f7;
            }
            &:hover {
                background: #eee;
            }
            .song-name {
                flex: 1;
                margin-left: 5px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #000;
            }
            .duration {
                width: 60px;
                flex: 0 0 60px;
                text-align: right;
                font-size: 13px;
                color: #999;
            }
        }
    }
    .no-drag {
        -webkit-app-region: no-drag;
    }
    .item {
        font-size: 20px;
    }
}
</style>
