<template>
    <div>
        <header class="events-header">
            <span>{{ nickname ? nickname : "用户" }}的动态</span>
        </header>
        <ul class="events">
            <template v-for="(event, index) in events">
                <li
                    :key="`${event.id}`"
                    :data-index="index"
                    class="event"
                    v-if="
                        ['song', 'video', 'playlist', 'album'].includes(
                            Object.keys(event.json)[1]
                        )
                    "
                >
                    <div class="event-user-box">
                        <router-link
                            :to="`/user?id=${event.user.userId}`"
                            class="avatar"
                        >
                            <img
                                v-lazy="`${event.user.avatarUrl}?param=42y42`"
                                class="avatar-img"
                            />
                        </router-link>
                        <div class="intro">
                            <div class="username">{{
                                event.user.nickname
                            }}</div>
                            <div class="date">{{
                                moment(event.eventTime).fromNow()
                            }}</div>
                        </div>
                    </div>
                    <div class="event-detail">
                        <div class="event-msg">{{ event.json.msg }}</div>
                        <div
                            class="event-info"
                            :class="{
                                video: Object.keys(event.json)[1] === 'video',
                                song: ['song', 'album'].includes(
                                    Object.keys(event.json)[1]
                                ),
                                playlist:
                                    Object.keys(event.json)[1] === 'playlist',
                                zoom:
                                    event.currentIndex >= 0 &&
                                    event.currentIndex === currentIndex,
                            }"
                        >
                            <!-- <div>
                <a-icon type="arrow-up" /> 收起
              </div>-->
                            <component
                                ref="component"
                                :is="`event-${Object.keys(event.json)[1]}`"
                                :event="event.json"
                                @click.native="onEventClick(event, index)"
                            ></component>
                        </div>
                        <div class="event-exrea">
                            <div class="rcmdInfo" v-if="event.rcmdInfo"
                                >—— {{ event.rcmdInfo.reason }}</div
                            >
                            <div class="actions">
                                <ul>
                                    <li>
                                        <a-icon
                                            type="like"
                                            :class="{
                                                actived: event.info.liked,
                                            }"
                                        />
                                        <span
                                            >({{ event.info.likedCount }})</span
                                        >
                                    </li>
                                    <li>
                                        <a-icon type="share-alt" />
                                        <span
                                            >({{ event.info.shareCount }})</span
                                        >
                                    </li>
                                    <li @click="getComment(event)">
                                        <a-icon type="message" />
                                        <span
                                            >({{
                                                event.info.commentCount
                                            }})</span
                                        >
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="event-comment" v-if="event.showComment">
                            <comment :commentData="event.commentData"></comment>
                        </div>
                    </div>
                </li>
                <li :key="`${event.id}`" v-else>
                    <div ref="component"></div>
                </li>
            </template>
        </ul>
        <infinite-loading
            :identifier="infiniteId"
            forceUseInfiniteWrapper=".ant-layout-content"
            @infinite="loadmore"
        />
    </div>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";
import { getUserEvent } from "@/api/user";
import EventSong from "./components/Song";
import EventVideo from "./components/Video";
import EventPlaylist from "./components/Playlist";
import EventAlbum from "./components/Album";
import Comment from "@/components/Comment/index.vue";
import {
    getSongComment,
    getVideoComment,
    getPlaylistComment,
} from "@/api/comment";

export default {
    name: "events",
    data() {
        return {
            moment,
            commentData: null,
            events: [],
            currentIndex: -1,
            options: {
                limit: 10,
                lasttime: -1,
            },
            commentOptions: {
                limit: 30,
                offset: 0,
            },
            showComment: false,
            infiniteId: +new Date(),
            nickname: "",
        };
    },
    components: {
        EventSong,
        EventVideo,
        EventPlaylist,
        EventAlbum,
        Comment,
    },
    computed: {
        ...mapGetters("User", ["userId"]),
    },
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            vm.events = [];
            vm.infiniteId += 1;
        });
    },
    beforeRouteUpdate(to, from, next) {
        this.events = [];
        this.infiniteId += 1;
        this.options.lasttime = -1;
        this.currentIndex = -1;
        this.commentData = null;
        this.commentOptions.offset = 0;
        this.nickname = to.query.nickname;
        next();
    },
    created() {
        this.nickname = this.$route.query.nickname;
    },
    methods: {
        onEventClick(event, index) {
            if (this.currentIndex === index) return;
            if (
                this.currentIndex >= 0 &&
                Object.keys(this.events[this.currentIndex].json)[1] === "video"
            ) {
                console.log(this.$refs.component[this.currentIndex]);
                this.$refs.component[this.currentIndex].pause &&
                    this.$refs.component[this.currentIndex].pause();
            }
            this.currentIndex = index;
            this.$set(event, "currentIndex", index);
        },
        async getComment(event) {
            let type = Object.keys(event.json)[1];
            let id =
                type === "video"
                    ? event.json.video.videoId
                    : event.json[type].id;
            let res = "";
            if (type === "video") {
                res = await getVideoComment(
                    id,
                    this.commentOptions.limit,
                    this.commentOptions.offset
                );
            } else if (type === "song") {
                res = await getSongComment(
                    id,
                    this.commentOptions.limit,
                    this.commentOptions.offset
                );
            } else {
                res = await getPlaylistComment(
                    id,
                    this.commentOptions.limit,
                    this.commentOptions.offset
                );
            }
            res.comments = res.comments.slice(0, 5);
            this.$set(event, "showComment", !event.showComment);
            this.$set(event, "commentData", res);
        },
        async loadmore($state) {
            let uid = this.$route.query.uid || this.userId;
            let options = {
                ...this.options,
                uid,
            };
            let res = await getUserEvent(options);
            if (res.events.length) {
                res.events.forEach((item) => {
                    item.json = JSON.parse(item.json);
                });
                this.events.push(...res.events);
            }
            $state.loaded();
            if (res.more) {
                this.options.lasttime = res.lasttime;
            } else {
                $state.complete();
            }
        },
    },
};
</script>

<style lang="less" scoped>
.events-header {
    position: sticky;
    top: 0;
    z-index: 12;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    font-size: 17px;
    background: #f5f5f7;
    color: #555;
    padding: 0 20px;
    border-bottom: 1px solid #eae9e9;
}

.events {
    padding: 15px 30px;
    .event {
        padding: 30px 0;
        border-bottom: 1px solid #e9e9e9;
        .event-user-box {
            display: flex;
            .avatar {
                position: relative;
                width: 42px;
                height: 42px;
                flex: 0 0 42px;
                .avatar-img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                }
            }
            .intro {
                padding-left: 10px;
                .username,
                .date {
                    line-height: 21px;
                }
                .username {
                    color: #3361b3;
                }
                .date {
                    font-size: 12px;
                    color: #666;
                }
            }
        }
        .event-detail {
            padding: 10px 10px 10px 52px;
            .event-msg {
                margin: 5px 0;
            }
            .event-info {
                width: 340px;
                height: 230px;
                &.video.zoom {
                    max-width: 825px;
                    width: 100%;
                    height: auto;
                }
                &.song {
                    width: 100%;
                    height: 60px;
                }
                &.playlist {
                    width: 100%;
                    height: 60px;
                }
            }
            .event-exrea {
                margin-top: 10px;
                .rcmdInfo {
                    float: left;
                    color: #999;
                }
                .actions {
                    float: right;
                    ul {
                        display: flex;
                        li {
                            padding: 0 10px;
                            line-height: 1;
                            font-size: 12px;
                            cursor: pointer;
                            &:not(:last-child) {
                                border-right: 1px solid #ddd;
                            }
                            .actived {
                                color: @primary-color;
                            }
                        }
                    }
                }
            }
            .event-comment {
                background: #eee;
                padding: 15px;
                margin: 0 0 15px;
            }
        }
    }
}
</style>
