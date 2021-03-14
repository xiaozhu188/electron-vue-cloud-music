import request from "@/utils/request.js";

export function getSongUrl(id) {
    return request.get("/song/url", {
        params: {
            id,
        },
    });
}

// 歌曲详情
export function getSongDetail(ids) {
    return request.get("/song/detail", {
        params: {
            ids,
        },
    });
}

// 获取歌词
export function getLyric(id) {
    return request.get("/lyric", {
        params: {
            id,
        },
    });
}

export function getNewSong() {
    return request.get("/personalized/newsong");
}

// 心动模式 /playmode/intelligence/list?id=33894312&pid=24381616
export function getIntelligence(id, pid) {
    return request.get("/playmode/intelligence/list", {
        params: {
            id,
            pid,
            _: new Date().getTime(),
        },
    });
}

// 相似音乐
export function getSimiSong(id) {
    return request.get("/simi/song", {
        params: {
            id,
        },
    });
}

// 根据歌曲找到包含这首歌的歌单
export function getSimiPlaylist(id) {
    return request.get("/simi/playlist", {
        params: {
            id,
        },
    });
}

// 获取最近 5 个听了这首歌的用户
export function getSongUsers(id) {
    return request.get("/simi/user", {
        params: {
            id,
        },
    });
}

// 新歌速递
// 全部:0
// 华语:7
// 欧美:96
// 日本:8
// 韩国:16
export function getTopSong(type) {
    return request.get("/top/song", {
        params: {
            type,
        },
    });
}
