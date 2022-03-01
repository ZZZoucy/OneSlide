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
        .split(/\n(?=\s*#{1,3}[^#])/)
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

// 上传图片模块
/*
const ImgUploader = {
    init() {
        this.$fileInput = $("#img-uploader");
        this.$textarea = $(".editor textarea");

        AV.init({
            appId: "gsSBTPa2L4REOXJvAcJkcuQm-gzGzoHsz",
            appKey: "5ukCpzqv23HduM8GpCjIknOz",
            serverURLs: "https://gssbtpa2.lc-cn-n1-shared.com",
        });

        this.bind();
    },
    bind() {
        let self = this;
        this.$fileInput.onchange = function () {
            if (this.files.length > 0) {
                let localFile = this.files[0];
                console.log(localFile);
                if (localFile.size / 1048576 > 2) {
                    alert("文件不能超过2M");
                    return;
                }
                self.insertText(`![上传中，进度0%]()`);
                let avFile = new AV.File(encodeURI(localFile.name), localFile);
                avFile
                    .save({
                        keepFileName: true,
                        onprogress(progress) {
                            self.insertText(`![上传中，进度${progress.percent}%]()`);
                        },
                    })
                    .then((file) => {
                        console.log("文件保存完成");
                        console.log(file);
                        let text = `![${file.attributes.name}](${file.attributes.url}?imageView2/0/w/800/h/400)`;
                        self.insertText(text);
                    })
                    .catch((err) => console.log(err));
            }
        };
    },

    insertText(text = "") {
        let $textarea = this.$textarea;
        let start = $textarea.selectionStart;
        let end = $textarea.selectionEnd;
        let oldText = $textarea.value;

        $textarea.value = `${oldText.substring(0, start)}${text} ${oldText.substring(end)}`;
        $textarea.focus();
        $textarea.setSelectionRange(start, start + text.length);
    },
};
*/

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
            center: localStorage.align === "left-top" ? false : true,
            hash: true,
            // 转场值
            transition: localStorage.transition || "slide", // none/fade/slide/convex/concave/zoom

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
        this.$transition = $(".theme .transition");
        this.$align = $(".theme .align");
        this.$reveal = $(".reveal");

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
        // 转场事件
        this.$transition.onchange = function () {
            localStorage.transition = this.value;
            location.reload();
        };
        // 对齐设置
        this.$align.onchange = function () {
            localStorage.align = this.value;
            location.reload();
        };
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
        this.$transition.value = localStorage.transition || "slide";
        this.$align.value = localStorage.align || "center";
        this.$reveal.classList.add(this.$align.value);
    },
};

// 下载PDF
const Print = {
    init() {
        this.$download = $(".download");
        this.bind();
        this.start();
    },

    bind() {
        this.$download.addEventListener("click", () => {
            // 如果点击下载PDF
            // 实现打开一个新的页面，自动跳出保存到PDF的窗口
            // 需要给加一个 a 标签，以及 target 和 href 属性
            let $link = document.createElement("a");
            $link.setAttribute("target", "_blank");
            $link.setAttribute("href", location.href.replace(/#\/.*/, "?print-pdf"));
            $link.click();
        });

        // 如果取消下载，就关闭窗口即可
        window.onafterprint = () => {
            window.close();
        };
    },

    start() {
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        if (window.location.search.match(/print-pdf/gi)) {
            link.href = "css/print/pdf.css";
            window.print();
        } else {
            link.href = "css/print/paper.css";
        }
        document.head.appendChild(link);
    },
};

// App代表总页面，init初始化，启动总入口
const App = {
    init() {
        [...arguments].forEach((Module) => Module.init());
    },
};

App.init(Menu, Editor, Theme, Print);
// ImgUploader,
