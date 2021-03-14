import { isDate, isObject } from "./helper";
function encode(val) {
    return encodeURIComponent(val)
        .replace(/%40/g, "@")
        .replace(/%3A/gi, ":")
        .replace(/%24/g, "$")
        .replace(/%2C/gi, ",")
        .replace(/%20/g, "+")
        .replace(/%5B/gi, "[")
        .replace(/%5D/gi, "]");
}

export function bulidURL(url, params) {
    // 如果params为空，直接返回原始url
    if (!params) {
        return url;
    }

    // 如果url中有哈希标记，则直接返回原始url
    if (url.includes("#")) {
        const markIndex = url.indexOf("#");
        url = url.slice(0, markIndex);
        return url;
    }
    // 定义键值对数组，用于最后拼接url，将params中的键值对进行处理最终放入parts中，
    // parts最后应该为['key=value','a=1','b=2','c=3',...]
    const parts = [];

    // 遍历params中的键值对
    Object.keys(params).forEach((key) => {
        let val = params[key];
        // 如果有为null或undefined的值，不处理直接跳出循环
        if (val === null || typeof val === "undefined") {
            return;
        }
        let values;
        // 如果值为数组，则将该值赋给临时数组变量values，用于下面遍历处理
        if (Array.isArray(val)) {
            values = val;
            key += "[]";
        } else {
            // 如果值不是数组，则强行将其变为数组进行处理
            values = [val];
        }
        values.forEach((val) => {
            if (isDate(val)) {
                val = val.toISOString();
            } else if (isObject(val)) {
                val = JSON.stringify(val);
            }
            parts.push(`${encode(key)}=${encode(val)}`);
        });
    });

    // 将parts用'&'拼接
    let serializedParams = parts.join("&");

    if (serializedParams) {
        // 判断原始url中是否有已存在的参数，即判断是否有'?',
        // 如果有，则将处理后的键值对加'&'拼接在后面，
        // 如果没有，则将处理后的键值对加'?'拼接在后面
        url += (url.includes("?") ? "&" : "?") + serializedParams;
    }

    return url;
}
