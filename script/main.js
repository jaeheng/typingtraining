var app = new Vue({
    el: '#app',
    data: {
        line: [],
        active: 0,
        route: 'index',
        toplist: [],
        submiting: false,
        form: {
            name: localStorage.getItem('typetest-name')
        },
        time: 0,
        tik: '',
        error: [],
        state: 0 // 0 未开始 1 正在打字
    },
    methods: {
        compareWords (item) {
            this.start()
            var inputArr = item.input.split('');
            var paraph = item.paraph.split('');
            if (item.input.length > item.paraph.length) {
                return false;
            }
            inputArr.map(function (word, index) {
                if (paraph[index] === word) {
                    paraph[index] = '<span class="success">' + paraph[index] + '</span>';
                } else {
                    paraph[index] = '<span class="error">' + paraph[index] + '</span>';
                }
            });
            item.paraphDisplay = paraph.join('')
            this.saveScore()
        },
        checkLineOk (index) {
            var line = this.line[index];
            if (line.input.length !== line.paraph.length) {
                this.error[index] = '还没有写完本行'
                return false;
            }
            // 1个字符多29个字符
            if (line.input.length * 30 !== line.paraphDisplay.length) {
                this.error[index] = '有错字呢还'
                return false;
            }
            return true;
        },
        nextLine (index) {
            index = parseInt(index)
            var lines = this.line;
            // 判断本行是否填写完成
            if (this.checkLineOk(index)) {
                if (index !== lines.length - 1) {
                    this.active = index + 1
                    this.$refs['input-' + (index + 1)][0].focus()
                }
            }
        },
        getTopList () {
            var that = this
            var time = Date.now()
            axios.get('./toplist.json?time=' + time).then(function (resp) {
                resp.data.sort(function (a, b) {
                    return a.score - b.score;
                })
                that.toplist = resp.data
            }).catch(function (err) {
                that.showToastify(err)
            })
        },
        saveScore () {
            var form = this.form
            var that = this
            if (!this.checkWordsOk()) {
                return false;
            }
            form.name = form.name || '匿名'
            form.score = this.time
            this.submiting = true
            axios.post('api.php?route=saveScore', form, {}).then(function (resp) {
                clearInterval(that.tik)
                that.showToastify(resp.data.msg, true)
                that.getTopList()
                that.submiting = false
                that.route = 'top'
            }).catch(function (err) {
                that.showToastify(err)
                that.submiting = false
            })
        },
        updateTime () {
            this.time++
        },
        checkWordsOk () {
            // 检查是不是都写对了
            var lines = this.line
            var that = this
            var isOk = true
            lines.map(function (item, index) {
                if (!that.checkLineOk(index)) {
                    isOk = false
                    console.log('index:' + index + ' is not ok')
                }
            });
            console.log('isOK:', isOk)
            return isOk;
        },
        start () {
            var that = this
            var name = this.form.name.trim()
            if (name === '') {
                alert('请填写名称')
                return false;
            }
            if (this.state) {
                return false
            }
            this.active = 0;
            this.state = 1;
            this.time++;
            this.tik = setInterval(function () {
                that.updateTime()
            }, 1000)
            this.$refs['input-0'][0].focus();
            localStorage.setItem('typetest-name', name);
        },
        go (type) {
            this.route = type
            if (type === 'top') {
                this.getTopList()
            }
        },
        /**
         * 显示信息
         * @param err
         * @param type false:error true:success
         */
        showToastify (err, type) {
            const color = !type ? '#ff495b' : '#21bc4a'
            Toastify({
                text: err,
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "center", // `left`, `center` or `right`
                backgroundColor: color,
                stopOnFocus: true, // Prevents dismissing of toast on hover
                onClick: function(){} // Callback after click
            }).showToast();
        },
        /**
         * 获取文章数据
         */
        getArticle () {
            const that = this
            NProgress.start()
            axios.get('api.php?route=article').then(function (resp) {
                const data = resp.data
                if (data) {
                    that.line = data.map(line => {
                        return {
                            paraph: line,
                            paraphDisplay: line,
                            input: ''
                        }
                    })
                }
                NProgress.done();
            }).catch(function (err) {
                that.showToastify(err)
                NProgress.done();
            })
        }
    },
    mounted: function () {
        this.getArticle()
    }
})
