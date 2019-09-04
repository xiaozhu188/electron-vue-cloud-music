<template>
  <div>
    <div class="comment-wrapper" v-if="commentData">
      <dl v-if="commentData.hotComments.length">
        <dt>热门评论</dt>
        <dd v-for="(comment, index) in commentData.hotComments" :key="`hot_${comment.commentId}_${index}`">
          <a-comment class="comment">
            <template slot="actions">
              <span>
                <a-icon type="like" :theme="comment.liked?'filled':'outlined'" />
                <span v-if="comment.likedCount">({{comment.likedCount}})</span>
              </span>
              <span>分享</span>
              <span>回复</span>
            </template>
            <router-link to='/' slot="author">{{comment.user.nickname}}:</router-link>
            <img v-lazy="`${comment.user.avatarUrl}?param=32y32`" class="avatar" slot="avatar">
            <span slot="datetime">{{moment(comment.time).format('YYYY年MM月DD日 HH:mm')}}</span>
            <div slot="content">
              <p>{{comment.content}}</p>
              <div class="beReplied" v-for="(reply, index) in comment.beReplied" :key="`${reply.beRepliedCommentId}_${index}`">
                <router-link to='/'>@{{reply.user.nickname}}</router-link>
                <span>{{reply.content}}</span>
              </div>
            </div>
          </a-comment>
        </dd>
      </dl>
      <dl v-if="commentData.topComments.length">
        <dt>精彩评论</dt>
        <dd v-for="(comment, index) in commentData.topComments" :key="`top_${comment.commentId}_${index}`">
          <a-comment class="comment">
            <template slot="actions">
              <span>
                <a-icon type="like" :theme="comment.liked?'filled':'outlined'" />
                <span v-if="comment.likedCount">({{comment.likedCount}})</span>
              </span>
              <span>分享</span>
              <span>回复</span>
            </template>
            <a slot="author">{{comment.user.nickname}}:</a>
            <img v-lazy="`${comment.user.avatarUrl}?param=32y32`" class="avatar" slot="avatar">
            <span slot="datetime">{{moment(comment.time).format('YYYY年MM月DD日 HH:mm')}}</span>
            <p slot="content">{{comment.content}}</p>
          </a-comment>
        </dd>
      </dl>
      <dl v-if="commentData.comments.length">
        <dt>全部评论</dt>
        <dd v-for="(comment, index) in commentData.comments" :key="`all_${comment.commentId}_${index}`">
          <a-comment class="comment">
            <template slot="actions">
              <span>
                <a-icon type="like" :theme="comment.liked?'filled':'outlined'" />
                <span v-if="comment.likedCount">({{comment.likedCount}})</span>
              </span>
              <span>分享</span>
              <span>回复</span>
            </template>
            <a slot="author">{{comment.user.nickname}}:</a>
            <img v-lazy="`${comment.user.avatarUrl}?param=32y32`" class="avatar" slot="avatar">
            <span slot="datetime">{{moment(comment.time).format('YYYY年MM月DD日 HH:mm')}}</span>
            <p slot="content">{{comment.content}}</p>
          </a-comment>
        </dd>
      </dl>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import Loading from '@/components/Common/loading'

export default {
  data () {
    return {
      moment
    }
  },
  props: {
    commentData: {
      type: Object,
      default () {
        return null
      }
    }
  },
  components: {
    Loading
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
  background: rgba(232, 232, 232, .5);
  padding: 3px 6px;
  border-radius: 3px;
}
</style>