<template>
  <div>
    <div class="comment-wrapper" v-if="commentData">
      <dl v-if="commentData.hotComments.length">
        <dt>热门评论</dt>
        <dd v-for="(comment, index) in commentData.hotComments" :key="`hot_${comment.commentId}_${index}`">
          <comment-item :comment="comment" />
        </dd>
      </dl>
      <dl v-if="commentData.topComments.length">
        <dt>精彩评论</dt>
        <dd v-for="(comment, index) in commentData.topComments" :key="`top_${comment.commentId}_${index}`">
          <comment-item :comment="comment" />
        </dd>
      </dl>
      <dl v-if="commentData.comments.length">
        <dt>全部评论</dt>
        <dd v-for="(comment, index) in commentData.comments" :key="`all_${comment.commentId}_${index}`">
          <comment-item :comment="comment" />
        </dd>
      </dl>
    </div>
  </div>
</template>

<script>
import CommentItem from './CommentItem'
import Loading from '@/components/Common/loading'

export default {
  props: {
    commentData: {
      type: Object,
      default () {
        return null
      }
    }
  },
  components: {
    Loading, CommentItem
  }
}
</script>
