import Vue from "vue";
import { debounce, throttle } from "loadsh";

// 点击元素之外隐藏该元素
Vue.directive("clickOutside", {
    bind(el, binding) {
        el.__vueClickOutside__ = function documentHandle(e) {
            if (el.contains(e.target)) {
                return false;
            }
            if (binding.expression) {
                binding.value(e);
            }
        };
        document.addEventListener("click", el.__vueClickOutside__, true);
    },
    unbind(el) {
        document.removeEventListener("click", el.__vueClickOutside__, true);
        delete el.__vueClickOutside__;
    },
});

// 监听元素大小变化
Vue.directive("resize", {
    bind(el, binding) {
        let { value, modifiers, arg } = binding;
        console.log(modifiers, arg);
        const callback = (entries) => {
            value(entries[0]);
        };
        const [method] = Object.keys(modifiers);
        const wait = (arg && arg.wait) || 300;
        if (method && method === "throttle") {
            el._observer = new ResizeObserver(throttle(callback, wait));
        } else {
            el._observer = new ResizeObserver(debounce(callback, wait));
        }
    },
    inserted(el) {
        Vue.nextTick(() => {
            el._observer && el._observer.observe(el);
        });
    },
    unbind(el) {
        el._observer && el._observer.unobserve(el);
    },
});
