// ==========================================
//  ZoroJS — Lightweight Reactive Library
//  Version: 0.1.1 (Beta)
//  License: MIT
//  Built by Zoro Core
//  No build step, no dependencies
// ==========================================

// Biến toàn cục dùng để track effect hiện tại trong computed/watch
let activeEffect = null

// ==========================================
//  Tạo một giá trị reactive (deep proxy)
// ==========================================
function state(initValue) {
    let _value = initValue
    const listeners = new Set() // tập các hàm cần gọi khi thay đổi
    const proxyCache = new WeakMap() // cache proxy theo object gốc

    // Hàm tạo proxy deep cho object/array
    function makeReactive(obj) {
        if (typeof obj !== 'object' || obj === null) return obj
        if (proxyCache.has(obj)) return proxyCache.get(obj)

        const proxy = new Proxy(obj, {
            get(target, key) {
                // Nếu đang có activeEffect, thêm nó vào listeners để sau này re-run
                if (activeEffect) listeners.add(activeEffect)
                return makeReactive(target[key]) // deep reactive
            },
            set(target, key, value) {
                if (target[key] === value) return true
                target[key] = value
                listeners.forEach((fn) => fn()) // notify tất cả listener
                return true
            },
            deleteProperty(target, key) {
                delete target[key]
                listeners.forEach((fn) => fn())
                return true
            },
        })
        proxyCache.set(obj, proxy)
        return proxy
    }

    // Nếu giá trị ban đầu là object, bọc reactive ngay
    if (typeof _value === 'object' && _value !== null) _value = makeReactive(_value)

    return {
        _type: 'state',

        get value() {
            if (activeEffect) listeners.add(activeEffect) // thu thập dependency
            return _value
        },

        set value(newVal) {
            if (_value === newVal) return
            const oldVal = _value
            // Nếu gán object mới, phải reactive nó trước khi lưu
            if (typeof newVal === 'object' && newVal !== null) newVal = makeReactive(newVal)
            _value = newVal
            // Gọi tất cả listener, truyền giá trị mới và cũ
            listeners.forEach((fn) => fn(newVal, oldVal))
        },

        // Đăng ký watch, trả về hàm huỷ
        watch(fn) {
            listeners.add(fn)
            return () => listeners.delete(fn)
        },
    }
}

// ==========================================
//  Giá trị dẫn xuất tự động cập nhật khi state thay đổi
// ==========================================
function computed(func) {
    const val = state(undefined) // khởi tạo state rỗng, sẽ gán sau
    val._type = 'computed'

    function run() {
        const prevEffect = activeEffect
        activeEffect = run // đặt effect hiện tại là chính run
        const next = func() // gọi hàm tính toán, thu thập dependency
        activeEffect = prevEffect
        // Chỉ gán nếu giá trị thay đổi
        if (val.value !== next) val.value = next
    }

    run() // chạy lần đầu để thiết lập giá trị và dependency
    return val
}

// ==========================================
//  Giữ DOM reference, không reactive
// ==========================================
function ref(initValue = null) {
    return { _type: 'ref', value: initValue }
}

// ==========================================
//  Tạo app, mount vào DOM, xử lý directive
// ==========================================
function createApp(config) {
    const ctx = config.setup() // context từ setup()
    const evalCache = new Map() // cache cho biểu thức
    const TYPES = ['state', 'computed', 'ref']

    // Danh sách các binding đã tìm thấy trong DOM
    const bindings = { texts: [], htmls: [], shows: [], syncs: [] }

    let rafId = null // requestAnimationFrame ID để batch update
    let root = null // DOM element gốc của app

    // Hàm evaluate biểu thức trong scope của setup()
    //   expr   : biểu thức (vd "count + 1")
    //   raw    : nếu true, không unwrap .value của state/computed/ref
    function evaluate(expr, raw = false) {
        const keys = Object.keys(ctx)
        let fn = evalCache.get(expr)

        // Lấy giá trị hiện tại của từng biến trong context
        const values = keys.map((k) => {
            const v = ctx[k]
            if (raw) return v // raw: giữ nguyên object
            return v && TYPES.includes(v._type) ? v.value : v
        })

        try {
            if (!fn) {
                fn = new Function(...keys, `return (${expr})`)
                evalCache.set(expr, fn)
            }
            return fn(...values)
        } catch (e) {
            console.error('ZoroJS:', e.message)
            return ''
        }
    }

    // Hàm render chính — được gọi mỗi khi state thay đổi
    function render() {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(() => {
            // --- :text ---
            for (const bind of bindings.texts) {
                const val = evaluate(bind.expr)
                if (bind.oldVal === val) continue
                bind.el.textContent = val ?? ''
                bind.oldVal = val
            }
            // --- :html ---
            for (const bind of bindings.htmls) {
                const val = evaluate(bind.expr)
                if (bind.oldVal === val) continue
                bind.el.innerHTML = val ?? ''
                bind.oldVal = val
            }
            // --- :show ---
            for (const bind of bindings.shows) {
                const val = !!evaluate(bind.expr)
                if (bind._old === val) continue
                bind._old = val
                bind.el.style.display = val ? '' : 'none'
            }
            // --- z-sync (two‑way binding) ---
            for (const bind of bindings.syncs) {
                bind.el.value = ctx[bind.key]?.value ?? ''
            }
        })
    }

    // API trả về
    return {
        mount(selector) {
            root = document.querySelector(selector)
            if (!root) return console.error('ZoroJS: not found:', selector)

            // --- z-ref (init once) ---
            root.querySelectorAll('[z-ref]').forEach((el) => {
                const key = el.getAttribute('z-ref')
                if (ctx[key]?._type === 'ref') ctx[key].value = el // gán DOM element vào ref
            })
            root.querySelectorAll('[\\:text]').forEach((el) =>
                bindings.texts.push({ el, expr: el.getAttribute(':text') }),
            )
            root.querySelectorAll('[\\:html]').forEach((el) =>
                bindings.htmls.push({ el, expr: el.getAttribute(':html') }),
            )
            root.querySelectorAll('[\\:show]').forEach((el) =>
                bindings.shows.push({ el, expr: el.getAttribute(':show') }),
            )
            root.querySelectorAll('[z-sync]').forEach((el) => {
                const key = el.getAttribute('z-sync')
                if (!ctx[key]) return
                bindings.syncs.push({ el, key })
                el.addEventListener('input', (e) => {
                    ctx[key].value = e.target.value
                })
            })
            // --- @event (hỗ trợ tất cả event) ---
            root.querySelectorAll('*').forEach((el) => {
                for (const attr of el.attributes) {
                    if (!attr.name.startsWith('@')) continue
                    const eventName = attr.name.slice(1)
                    const expr = attr.value
                    el.addEventListener(eventName, (e) => {
                        // Nếu là hàm trong setup() → gọi hàm với event
                        if (typeof ctx[expr] === 'function') return ctx[expr](e)
                        // Không phải hàm → evaluate inline expression
                        evaluate(expr, true)
                    })
                }
            })

            // --- watch tất cả state/computed để tự động render ---
            for (const v of Object.values(ctx)) {
                if (typeof v?.watch === 'function') v.watch(render)
            }

            render() // render lần đầu
        },
    }
}

// Export cho CommonJS và browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { state, computed, ref, createApp }
}

if (typeof window !== 'undefined') {
    window.ZoroJS = { state, computed, ref, createApp }
}
