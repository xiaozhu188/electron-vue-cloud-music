import request from "@/utils/request.js";

export function getBanner() {
    return request.get("/banner");
}
