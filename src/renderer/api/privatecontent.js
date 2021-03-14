import request from "@/utils/request.js";

export function getPrivateContent() {
    return request.get("/personalized/privatecontent");
}
