<template>
  <a-comment class="comment">
    <template slot="actions">
      <span>
        <a-icon type="like" :theme="comment.liked?'filled':'outlined'" />
        <span v-if="comment.likedCount">({{comment.likedCount}})</span>
      </span>
      <span>分享</span>
      <span>回复</span>
    </template>
    <router-link :to="`/user?id=${comment.user.userId}`" slot="author">{{comment.user.nickname}}:</router-link>
    <router-link :to="`/user?id=${comment.user.userId}`" slot="avatar">
      <img v-lazy="`${comment.user.avatarUrl}?param=32y32`" class="avatar" />
    </router-link>

    <span slot="datetime">{{moment(comment.time).format('YYYY年MM月DD日 HH:mm')}}</span>
    <div slot="content">
      <p>{{comment.content}}</p>
      <template v-if="comment.beReplied && comment.beReplied.length">
        <div
          class="beReplied"
          v-for="(reply, index) in comment.beReplied"
          :key="`${reply.beRepliedCommentId}_${index}`"
        >
          <router-link :to="`/user?id=${reply.user.userId}`">@{{reply.user.nickname}}</router-link>
          <span>{{reply.content}}</span>
        </div>
      </template>
    </div>
  </a-comment>
</template>

<script>
import moment from 'moment'
export default {
  data () {
    return {
      moment
    }
  },
  props: {
    comment: {
      type: Object
    }
  }
}
</script>

<style scoped>
.comment-wrapper dt {
  padding-bottom: 15px;
}

.comment-wrapper dt {
  border-bottom: 1px solid #e6e6e6;
}

.comment-wrapper dd:not(:last-child) {
  border-bottom: 1px solid #e6e6e6;
}

.comment >>> .ant-comment-actions {
  float: right;
  margin: 0;
}

.comment a {
  color: #006fe3;
}
.beReplied {
  background: rgba(232, 232, 232, 0.5);
  padding: 3px 6px;
  border-radius: 3px;
}
</style>
