<template>
    <div>
        <header class="events-header">
            <span>动态</span>
        </header>
        <ul class="events">
            <template v-for="(event, index) in events">
                <li
                    :key="event.id"
                    class="event"
                    v-if="
                        ['song', 'video'].includes(Object.keys(event.json)[1])
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
                            <router-link
                                :to="`/user?id=${event.user.userId}`"
                                class="username"
                                >{{ event.user.nickname }}
                            </router-link>
                            <!-- <div class="date">{{ moment(event.eventTime).format('M月D日 hh:mm') }}</div> -->
                            <div class="date">{{
                                moment(event.eventTime).fromNow()
                            }}</div>
                        </div>
                        <div class="action">
                            <a-button
                                type="link"
                                size="small"
                                icon="check"
                                @click="subscribe(2, event.user)"
                                v-if="event.user.followed"
                                >已关注
                            </a-button>
                            <a-button
                                type="link"
                                size="small"
                                icon="plus"
                                @click="subscribe(1, event.user)"
                                v-else
                                >关注</a-button
                            >
                        </div>
                    </div>
                    <div class="event-detail">
                        <div class="event-msg">{{ event.json.msg }}</div>
                        <div
                            class="event-info"
                            :class="{
                                video: Object.keys(event.json)[1] === 'video',
                                song: Object.keys(event.json)[1] === 'song',
                                zoom:
                                    event.currentIndex >= 0 &&
                                    event.currentIndex === currentIndex,
                            }"
                        >
                            <!-- <div>
                <a-icon type="arrow-up" /> 收起
              </div> -->
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
import { getEvent, getHotTopic } from "@/api/user";
import EventSong from "./components/Song";
import EventVideo from "./components/Video";
import Comment from "@/components/Comment/index.vue";
import { getSongComment, getVideoComment } from "@/api/comment";

export default {
    name: "events",
    data() {
        return {
            moment,
            commentData: null,
            events: [],
            currentIndex: -1,
            options: {
                pagesize: 20,
                lasttime: -1,
            },
            commentOptions: {
                limit: 30,
                offset: 0,
            },
            showComment: false,
            infiniteId: +new Date(),
        };
    },
    components: {
        EventSong,
        EventVideo,
        Comment,
    },
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            vm.events = [];
            vm.infiniteId += 1;
            vm._getHotTopic();
        });
    },
    methods: {
        _getHotTopic() {
            getHotTopic({}).then((res) => {
                console.log(res);
            });
        },
        subscribe(t, user) {
            this.$store
                .dispatch("User/subscribeUser", {
                    t,
                    userId: user.userId,
                    nickname: user.nickname,
                })
                .then((res) => {
                    if (res.code === 200) {
                        this.$set(user, "followed", !user.followed);
                    }
                });
        },
        onEventClick(event, index) {
            console.log(Object.keys(event.json)[1]);
            if (this.currentIndex === index) return;
            if (
                this.currentIndex >= 0 &&
                Object.keys(this.events[this.currentIndex].json)[1] === "video"
            ) {
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
                    : event.json.song.id;
            let res = "";
            if (type === "video") {
                res = await getVideoComment(
                    id,
                    this.commentOptions.limit,
                    this.commentOptions.offset
                );
            } else {
                res = await getSongComment(
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
            try {
                let res = await getEvent(this.options);
                if (res.event.length) {
                    res.event.forEach((item) => {
                        item.json = JSON.parse(item.json);
                        console.log(Object.keys(item.json));
                    });
                    this.events.push(...res.event);
                }
                // console.log(this.events)
                if (res.more) {
                    this.options.lasttime = res.lasttime;
                    $state.loaded();
                } else {
                    $state.complete();
                }
            } catch (error) {
                console.log(error);
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
        padding-bottom: 30px;
        margin-bottom: 15px;
        border-bottom: 1px solid #eee;
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
                flex: 1;
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
            .action {
                /deep/ .ant-btn-link {
                    color: @primary-color;
                    background-color: transparent;
                    border-color: transparent;
                    box-shadow: none;
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
                height: 190px;
                &.video.zoom {
                    max-width: 825px;
                    width: 100%;
                    height: auto;
                }
                &.song {
                    width: 100%;
                    height: 60px;
                }
            }
            .event-exrea {
                height: 50px;
                display: flex;
                justify-content: space-between;
                align-items: center;
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
