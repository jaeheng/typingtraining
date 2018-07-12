var app = new Vue({
    el: '#app',
    data: {
        line: [
            {
                paraph: 'Let us not wallow in the valley of despair, I say to you today, my friends.',
                paraphDisplay: 'Let us not wallow in the valley of despair, I say to you today, my friends.',
                input: ''
            },
            {
                paraph: 'And so even though we face the difficulties of today and tomorrow, I still have a dream.',
                paraphDisplay: 'And so even though we face the difficulties of today and tomorrow, I still have a dream.',
                input: ''
            },
            {
                paraph: 'It is a dream deeply rooted in the American dream.',
                paraphDisplay: 'It is a dream deeply rooted in the American dream.',
                input: ''
            },
            {
                paraph: 'I have a dream that one day this nation will rise up and live out the true meaning of its creed:',
                paraphDisplay: 'I have a dream that one day this nation will rise up and live out the true meaning of its creed:',
                input: ''
            },
            {
                paraph: '"We hold these truths to be self-evident, that all men are created equal."',
                paraphDisplay: '"We hold these truths to be self-evident, that all men are created equal."',
                input: ''
            },
            {
                paraph: 'I have a dream that one day on the red hills of Georgia,the sons of former',
                paraphDisplay: 'I have a dream that one day on the red hills of Georgia,the sons of former',
                input: ''
            },
            {
                paraph: 'slaves and the sons of former slave owners will be able to sit down together at the table of brotherhood.',
                paraphDisplay: 'slaves and the sons of former slave owners will be able to sit down together at the table of brotherhood.',
                input: ''
            },
            {
                paraph: 'I have a dream that one day even the state of Mississippi, a state sweltering with the heat of injustice,',
                paraphDisplay: 'I have a dream that one day even the state of Mississippi, a state sweltering with the heat of injustice,',
                input: ''
            },
            {
                paraph: 'sweltering with the heat of oppression, will be transformed into an oasis of freedom and justice.',
                paraphDisplay: 'sweltering with the heat of oppression, will be transformed into an oasis of freedom and justice.',
                input: ''
            },
            {
                paraph: 'I have a dream that my four little children will one day live in a nation where',
                paraphDisplay: 'I have a dream that my four little children will one day live in a nation where',
                input: ''
            },
            {
                paraph: 'they will not be judged by the color of their skin but by the content of their character.',
                paraphDisplay: 'they will not be judged by the color of their skin but by the content of their character.',
                input: ''
            },
            {
                paraph: 'I have a dream today!',
                paraphDisplay: 'I have a dream today!',
                input: ''
            }
        ],
        active: 0,
        route: 'index',
        toplist: [],
        loading: true,
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
            $.get('./toplist.json', function (resp) {
                resp.sort(function (a, b) {
                    return a.score - b.score;
                })
                that.toplist = resp
                that.loading = false;
            }, 'json')
        },
        saveScore () {
            var form = this.form
            var that = this
            if (!this.checkWordsOk()) {
                return false;
            }
            form.score = this.time
            this.submiting = true
            $.ajax({
                method: 'POST',
                url: 'api.php?route=saveScore',
                data: form,
                dataType: 'json',
                success: function (resp) {
                    clearInterval(that.tik)
                    alert(resp.msg)
                    that.getTopList()
                    that.submiting = false
                    that.route = 'top'
                },
                error: function (err) {
                    alert('提交出错')
                    that.submiting = false
                }
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
            var name = this.form.name
            if (name === '') {
                alert('请填写名称')
                return false;
            }
            if (this.state) {
                clearInterval(this.tik);
                this.state = 0;
                return false;
            }
            this.state = 1;
            this.time++;
            this.tik = setInterval(function () {
                that.updateTime()
            }, 1000)
            this.$refs['input-0'][0].focus();
            localStorage.setItem('typetest-name', name);
        }
    },
    mounted () {
        this.getTopList()
    }
})