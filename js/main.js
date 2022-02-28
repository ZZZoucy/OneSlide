// 判断用户输入的标题有几个 #
/*
	如果是 1或2个# ：代表普通新的一页，只需要一个 section 包裹
	如果是 3个# ：代表是普通页中的子页，需要两个 section 包裹
*/
const isMain = (str) => /^#{1,2}(?!#)/.test(str);
const isSub = (str) => /^#{3}(?!#)/.test(str);

const convert = (raw) => {
    // 将用户输入的内容以统一的格式读取
    let arr = raw
        .split(/\n(?=\s*#)/)
        .filter((s) => s != "")
        .map((s) => s.trim());

    let html = "";

    // 遍历用户输入的内容
    for (let i = 0; i < arr.length; i++) {
        // 判断是否为最后一页 ppt
        if (arr[i + 1] !== undefined) {
            if (isMain(arr[i]) && isMain(arr[i + 1])) {
                html += `
					<section data-markdown>
						<textarea data-template>
							${arr[i]}
						</textarea>
					</section>
				`;
            } else if (isMain(arr[i]) && isSub(arr[i + 1])) {
                html += `
					<section>
					<section data-markdown>
						<textarea data-template>
							${arr[i]}
						</textarea>
					</section>
				`;
            } else if (isSub(arr[i]) && isSub(arr[i + 1])) {
                html += `
					<section data-markdown>
						<textarea data-template>
							${arr[i]}
						</textarea>
					</section>
				`;
            } else if (isSub(arr[i]) && isMain(arr[i + 1])) {
                html += `
					<section data-markdown>
						<textarea data-template>
							${arr[i]}
						</textarea>
					</section>
					</section>
				`;
            }
        } else {
            if (isMain(arr[i])) {
                html += `
					<section data-markdown>
						<textarea data-template>
							${arr[i]}
						</textarea>
					</section>
				`;
            } else {
                html += `
					<section data-markdown>
						<textarea data-template>
							${arr[i]}
						</textarea>
					</section>
					</section>
				`;
            }
        }
    }
    return html;
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// 菜单模块
const Menu = {
    // 初始化函数
    init() {
        // 可以用 $... 命名，表示是一个对象
        console.log("Menu init...");
        this.$startIcon = $(".control .icon-start");
        this.$menu = $(".menu");
        this.$closeIcon = $(".menu .icon-close");
        this.$$tabs = $$(".menu .tab");
        this.$$contents = $$(".menu .content");
        this.bind();
    },
    // 绑定事件函数
    bind() {
        // 菜单栏打开、关闭事件
        this.$startIcon.onclick = () => {
            this.$menu.classList.add("open");
        };
        this.$closeIcon.onclick = () => {
            this.$menu.classList.remove("open");
        };

        // 菜单栏切换事件
        this.$$tabs.forEach(
            ($tab) =>
                ($tab.onclick = () => {
                    this.$$tabs.forEach(($node) => $node.classList.remove("active"));
                    $tab.classList.add("active");
                    // 当前选中的菜单栏的下标 [...xxx] 数组形式
                    let index = [...this.$$tabs].indexOf($tab);
                    this.$$contents.forEach(($node) => $node.classList.remove("active"));
                    this.$$contents[index].classList.add("active");
                })
        );
    },
};

// 编辑器模块
const Editor = {
    init() {
        console.log("Editor init...");
        this.$editInput = $(".editor textarea");
        this.$saveBtn = $(".editor .button-save");
        this.$slideContainer = $(".slides");
        this.markdown = localStorage.markdown || `# one slide`;
        this.bind();
        this.start();
    },

    bind() {
        this.$saveBtn.onclick = () => {
            // localStorage 是 HTML5 的离线缓存新特性
            localStorage.markdown = this.$editInput.value;
            location.reload();
        };
    },
    // 初始页面
    start() {
        this.$editInput.value = this.markdown;
        this.$slideContainer.innerHTML = convert(this.markdown);
        Reveal.initialize({
            controls: true,
            progress: true,
            center: true,
            hash: true,

            transition: "slide", // none/fade/slide/convex/concave/zoom

            // More info https://github.com/hakimel/reveal.js#dependencies
            dependencies: [
                {
                    src: "plugin/markdown/marked.js",
                    condition: function () {
                        return !!document.querySelector("[data-markdown]");
                    },
                },
                {
                    src: "plugin/markdown/markdown.js",
                    condition: function () {
                        return !!document.querySelector("[data-markdown]");
                    },
                },
                { src: "plugin/highlight/highlight.js" },
                { src: "plugin/search/search.js", async: true },
                { src: "plugin/zoom-js/zoom.js", async: true },
                { src: "plugin/notes/notes.js", async: true },
            ],
        });
    },
};

// 主题模块
const Theme = {
    init() {
        this.$$figures = $$(".theme figure");

        this.bind();
        this.loadTheme();
    },
    bind() {
        this.$$figures.forEach(
            ($figure) =>
                ($figure.onclick = () => {
                    this.$$figures.forEach(($item) => $item.classList.remove("select"));
                    $figure.classList.add("select");
                    // 通过 dataset 可以获取到 html 中的 data-xxx 属性值
                    this.setTheme($figure.dataset.theme);
                })
        );
    },
    setTheme(theme) {
        localStorage.theme = theme;
        location.reload();
    },
    loadTheme() {
        let theme = localStorage.theme || "sky";
        let $link = document.createElement("link");
        $link.rel = "stylesheet";
        $link.href = `css/theme/${theme}.css`;
        document.head.appendChild($link);

        [...this.$$figures].find(($figure) => $figure.dataset.theme === theme).classList.add("select");
    },
};

// App代表总页面，init初始化，启动总入口
const App = {
    init() {
        [...arguments].forEach((Module) => Module.init());
    },
};

App.init(Menu, Editor, Theme);
