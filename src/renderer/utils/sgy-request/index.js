import { isObject, isPlainObject, deepMerge } from "./helper";
import { createError } from "./error";
import { bulidURL } from "./url";

const DEFAULTS = {
    baseURL: "",
    headers: {
        credentials: "same-origin",
    },
};

function normalizeData(config) {
    if (["post", "POST"].includes(config.method) && config.data) {
        config.body = JSON.stringify(config.data);
    }
}

function normalizeHeaders(config) {
    const { headers = {}, data } = config;
    if (isObject(data) && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json; charset=utf-8";
    }
    return headers;
}

function normalizeUrl(config) {
    let { url, params, baseURL } = config;
    if (baseURL) {
        url = baseURL + url;
    }
    return bulidURL(url, params);
}

function _request(config) {
    config.url = normalizeUrl(config);
    normalizeData(config);
    config.headers = normalizeHeaders(config);
    return _fetch(config);
}

function _fetch(config) {
    const { url } = config;
    return new Promise((resolve, reject) => {
        fetch(url, config)
            .then((res) => {
                if (res.ok) {
                    const { onDownloadProgress } = config;
                    if (
                        !onDownloadProgress ||
                        typeof onDownloadProgress !== "function"
                    ) {
                        return transformResponse(config, res);
                    }
                    const contentLength = +res.headers.get("Content-Length");
                    let receivedLength = 0; // 当前接收到了这么多字节
                    let receivedChunks = []; // 接收到的二进制块的数组
                    let stream = new ReadableStream({
                        start(controller) {
                            const reader = res.body.getReader();
                            function pipe() {
                                reader
                                    .read()
                                    .then(({ done, value }) => {
                                        if (done) {
                                            controller.close();
                                            return;
                                        }
                                        receivedChunks.push(value);
                                        receivedLength += value.length;
                                        onDownloadProgress &&
                                            onDownloadProgress(
                                                (
                                                    receivedLength /
                                                    contentLength
                                                ).toFixed(2)
                                            );
                                        controller.enqueue(value);
                                        pipe();
                                    })
                                    .catch((err) => {
                                        reject(
                                            createError(
                                                err.message || "Net Error",
                                                config,
                                                err.code || null,
                                                err
                                            )
                                        );
                                    });
                            }
                            pipe();
                        },
                    });
                    return transformResponse(config, new Response(stream));
                } else {
                    reject(
                        createError(res.statusText, config, res.status, res)
                    );
                }
            })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(
                    createError(
                        err.message || "Net Error",
                        config,
                        err.code || null,
                        err
                    )
                );
            });
    });
}

function transformResponse(config, response) {
    const { responseType } = config;
    let result;
    switch (responseType) {
        case "text":
            result = response.text();
            break;
        case "arrayBuffer":
            result = response.arrayBuffer();
            break;
        case "blob":
            result = response.blob();
            break;
        case "formData":
            result = response.formData();
            break;
        default:
            result = response.json();
    }
    return result;
}

class Interceptor {
    constructor() {
        this.interceptors = [];
    }

    use(resolved, rejected) {
        this.interceptors.push({
            resolved,
            rejected,
        });
        return this.interceptors.length - 1;
    }

    remove(index) {
        this.interceptors.splice(index, 1, null);
    }
}

class Sguoyi {
    constructor(config) {
        this.defaults = config;
        this.interceptors = {
            request: new Interceptor(),
            response: new Interceptor(),
        };
    }

    request(url, config) {
        if (typeof url === "string") {
            config = config ? config : {};
            config.url = url;
        } else {
            config = url;
        }
        config = deepMerge(this.defaults, config);
        let arr = [
            {
                resolved: _request,
                rejected: undefined,
            },
        ];

        this.interceptors.request.interceptors.forEach((interceptor) => {
            if (interceptor !== null) {
                arr.unshift(interceptor);
            }
        });
        this.interceptors.response.interceptors.forEach((interceptor) => {
            if (interceptor !== null) {
                arr.push(interceptor);
            }
        });
        let promise = Promise.resolve(config);

        while (arr.length) {
            const { resolved, rejected } = arr.shift();
            promise = promise.then(resolved, rejected);
        }
        return promise;
    }

    get(url, config) {
        return this.request(
            Object.assign(config || {}, {
                method: "GET",
                url,
            })
        );
    }

    post(url, data, config) {
        return this.request(
            Object.assign(config || {}, {
                method: "POST",
                url,
                data,
            })
        );
    }
}

function sguoyiCreateFactory(config) {
    const instance = new Sguoyi(config);
    const result = Sguoyi.prototype.request.bind(instance);
    result.request = Sguoyi.prototype.request.bind(instance);
    result.get = Sguoyi.prototype.get.bind(instance);
    result.post = Sguoyi.prototype.post.bind(instance);
    Object.setPrototypeOf(result, instance);
    return result;
}

const sguoyi = sguoyiCreateFactory(DEFAULTS);

sguoyi.create = function (config) {
    return sguoyiCreateFactory(deepMerge(DEFAULTS, config));
};

export default sguoyi;
