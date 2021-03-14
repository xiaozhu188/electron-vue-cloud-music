import request from "@/utils/request.js";

export function getVideo(groupId) {
    let id = groupId || 5100;
    return request.get(`/video/group?id=${id}&_=${new Date().getTime()}`);
}

// /video/group/list
export function getVideoCates() {
    return request.get("/video/group/list");
}

export function getVideoUrl(id) {
    return request.get(`/video/url?id=${id}`);
}

export function getVideoDetail(id) {
    return request.get(`/video/detail?id=${id}`);
}

// 相关视频
export function getRelatedVideo(id) {
    return request.get(`/related/allvideo?id=${id}`);
}

// 收藏视频 t : 1 为收藏,其他为取消收藏
export function subVideo(id, t) {
    return request.get("/video/sub", {
        params: {
            id,
            t,
        },
    });
}
