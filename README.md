# 🎭 ZoroJS

**Lightweight Reactive Library** — Không build step, không dependency

> ZoroJS là một thư viện JavaScript tối giản, tập trung vào reactivity và data binding. Được thiết kế để dễ sử dụng, dễ tích hợp, không cần bất kỳ build tool nào.

## ✨ Đặc điểm

- **🚀 Siêu nhẹ** - Pure vanilla JavaScript, không có dependency
- **⚡ Không build step** - Import trực tiếp, chạy ngay
- **🎯 Deep Reactivity** - Tự động track object/array nested
- **🔄 Two-way binding** - `z-sync` cho input tự động sync
- **💫 Computed & Watch** - Giá trị dẫn xuất tự động cập nhật
- **🎨 Directive System** - `:text`, `:html`, `:show`, `@event`
- **📦 Tích hợp dễ dàng** - Chạy bất kỳ dự án JS nào

## 🚀 Bắt đầu nhanh

### Cài đặt

```html
<script src="zoro.js"></script>
```

Hoặc import từ module:

```javascript
import { state, computed, ref, createApp } from './zoro.js'
```

### Ví dụ cơ bản

```html
<div id="app">
  <p :text="count"></p>
  <button @click="increment">Tăng</button>
  <input z-sync="name" />
  <p :text="`Xin chào, ${name}`"></p>
</div>

<script>
  const { state, createApp } = window.ZoroJS

  createApp({
    setup() {
      const count = state(0)
      const name = state('Bạn')

      return {
        count,
        name,
        increment: () => {
          count.value++
        },
      }
    },
  }).mount('#app')
</script>
```

## 📚 API Reference

### `state(initValue)`

Tạo một reactive state:

```javascript
const count = state(0)
const user = state({ name: 'Zoro', age: 20 })

// Truy cập
console.log(count.value) // 0
console.log(user.value.name) // 'Zoro'

// Thay đổi
count.value = 5
user.value.name = 'Nami'

// Watch
const unwatch = count.watch((newVal, oldVal) => {
  console.log(`Count changed: ${oldVal} → ${newVal}`)
})

// Huỷ watch
unwatch()
```

### `computed(func)`

Tạo giá trị dẫn xuất tự động cập nhật:

```javascript
const count = state(10)
const doubled = computed(() => count.value * 2)

console.log(doubled.value) // 20
count.value = 15
console.log(doubled.value) // 30 (tự động cập nhật)
```

### `ref(initValue)`

Giữ reference đến DOM element:

```javascript
const inputRef = ref(null)

// Trong template:
// <input z-ref="inputRef" />

// Sau khi mount:
console.log(inputRef.value) // <input element>
```

### `createApp(config)`

Tạo application instance:

```javascript
const app = createApp({
  setup() {
    // Trả về context
    return {
      count: state(0),
      // ... other states, computed, methods
    }
  },
})

app.mount('#app') // Mount vào selector
```

## 🎯 Directive System

### `:text` — Hiển thị text

```html
<p :text="message"></p>
<p :text="count + 1"></p>
```

### `:html` — Hiển thị HTML

```html
<div :html="htmlContent"></div>
```

⚠️ **Cẩn thận**: Chỉ dùng khi tin tưởng nguồn HTML

### `:show` — Ẩn/hiện element

```html
<p :show="isVisible"></p>
<button :show="!isLoading">Click me</button>
```

### `z-sync` — Two-way binding

```html
<input z-sync="name" />
<p :text="name"></p>
```

Khi người dùng gõ, `name` tự động cập nhật!

### `@event` — Xử lý sự kiện

```html
<!-- Gọi hàm -->
<button @click="increment">Tăng</button>

<!-- Inline expression -->
<button @click="count.value++">Tăng nhanh</button>

<!-- Truyền event object -->
<input @input="handleInput" />
```

### `z-ref` — Reference đến DOM

```html
<input z-ref="inputRef" />

<script>
  const { ref, createApp } = window.ZoroJS

  createApp({
    setup() {
      const inputRef = ref(null)
      return {
        inputRef,
        focus: () => inputRef.value?.focus(),
      }
    },
  }).mount('#app')
</script>
```

## 💡 Ví dụ thực tế

### Todo List

```html
<div id="app">
  <input z-sync="newTodo" @keyup.enter="addTodo" placeholder="Nhập task..." />
  <button @click="addTodo">Thêm</button>
  
  <ul>
    <li :show="todos.length === 0">Không có task nào</li>
    <!-- Note: Loop chưa được hỗ trợ, dùng template ngoài -->
  </ul>
</div>

<script>
  const { state, createApp } = window.ZoroJS

  createApp({
    setup() {
      const newTodo = state('')
      const todos = state([])

      return {
        newTodo,
        todos,
        addTodo: () => {
          if (newTodo.value.trim()) {
            todos.value.push({ id: Date.now(), text: newTodo.value })
            newTodo.value = ''
          }
        },
      }
    },
  }).mount('#app')
</script>
```

### Counter với Computed

```html
<div id="app">
  <p :text="`Count: ${count}`"></p>
  <p :text="`Doubled: ${doubled}`"></p>
  <button @click="increment">+</button>
  <button @click="decrement">-</button>
</div>

<script>
  const { state, computed, createApp } = window.ZoroJS

  createApp({
    setup() {
      const count = state(0)
      const doubled = computed(() => count.value * 2)

      return {
        count,
        doubled,
        increment: () => count.value++,
        decrement: () => count.value--,
      }
    },
  }).mount('#app')
</script>
```

## 🔧 Cách hoạt động

ZoroJS sử dụng **JavaScript Proxy** để tự động track thay đổi:

1. **Khi bạn truy cập** state trong computed/watch → listener được thêm vào
2. **Khi bạn thay đổi** state → tất cả listener được gọi lại
3. **Directive tự động** cập nhật DOM khi state thay đổi

```javascript
// Tracking dependency
const count = state(10)
const doubled = computed(() => {
  // activeEffect được set, nên count.value sẽ track "doubled"
  return count.value * 2
})

count.value = 20 // doubled sẽ tự động tính toán lại
```

## 📋 Roadmap

- [ ] `:for` directive cho loop rendering
- [ ] `:if` directive cho conditional rendering
- [ ] Component system
- [ ] Plugin API
- [ ] DevTools integration
- [ ] Performance optimizations

## 🤝 Đóng góp

ZoroJS là dự án mở, bạn có thể:
- Báo lỗi qua Issues
- Đề xuất feature
- Submit PR để cải thiện

## 📄 Giấy phép

MIT License © 2024 Zoro Core

---

**Made with ❤️ by Zoro Core Team**

Tập trung vào JavaScript tối giản, không build step. 🚀
