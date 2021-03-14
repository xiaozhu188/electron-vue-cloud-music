import request from "@/utils/request.js";

export function getTopAlbum({ limit, offset }) {
    return request.get("/top/album", {
        params: {
            limit,
            offset,
        },
    });
}

export function getNewestAlbum({ limit, offset }) {
    return request.get("/album/newest", {
        params: {
            limit,
            offset,
        },
    });
}

export function getAlbum(id) {
    return request.get("/album", {
        params: {
            id,
        },
    });
}
