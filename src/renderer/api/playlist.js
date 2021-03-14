import request from "@/utils/request.js";

export function getPlaylistTags() {
    return request.get("/playlist/hot");
}

export function getUserPlaylist(uid) {
    return request.get("/user/playlist", {
        params: {
            uid,
        },
    });
}

export function getPlaylistDetail(id) {
    return request.get("/playlist/detail", {
        params: {
            id,
            _: new Date().getTime(),
        },
    });
}

export function getPlaylistCatlist() {
    return request.get("/playlist/catlist");
}

export function getPersonalizedPlaylist() {
    return request.get("/personalized");
}

export function getTopPlaylist({
    cat = "全部",
    limit = 10,
    offset = 0,
    order = "new",
}) {
    return request.get("/top/playlist", {
        params: {
            cat,
            limit,
            offset,
            order,
        },
    });
}

// 精品歌单 before: 分页参数,取上一页最后一个歌单的 updateTime 获取下一页数据
export function getHighPlaylist({ cat = "全部", limit = 20, before = "" }) {
    return request.get("/top/playlist/highquality", {
        params: {
            cat,
            limit,
            before,
        },
    });
}

export function getRelatedPlaylist(id) {
    return request.get("/related/playlist", {
        params: {
            id,
        },
    });
}

export function getRecommendPlaylist() {
    return request.get("/personalized");
}

export function getPlaylistSubscribers({ limit = 20, offset = 0, id }) {
    return request.get("/playlist/subscribers", {
        params: {
            id,
            limit,
            offset,
        },
    });
}
