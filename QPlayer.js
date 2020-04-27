window.QPlayer = {isRotate: true};
$(function () {

    if (!window.QPlayer) {
        window.QPlayer = {};
    }
    const q = window.QPlayer;
    const v = {};

    const
        $q = $('#QPlayer'),
        $audio = $('#QPlayer-audio'),
        $cover = $('#QPlayer-cover'),
        $list = $('#QPlayer-list'),
        $name = $('#QPlayer-name'),
        $artist = $('#QPlayer-artist'),
        $more = $('#QPlayer-more'),
        $time = $('#QPlayer-time'),
        $progress = $('#QPlayer-progress-current')
    ;

    const audio = $audio[0];

    // Test
    window._audio = audio;

    q.index = -1;
    q.current = null;
    q.history = {index: -1, list: []};
    initHistory();

    function initHistory() {
        q.history = {index: -1, list: []};;
    }

    function getNextIndex() {
        if (q.isRandom) {
            return Math.round(Math.random() * q.list.length - 1);
        }
        return ++q.index === q.list.length ? q.index = 0 : q.index;
    }

    function playAudio() {
        onPlay();
        audio.src = q.current.url;
        audio.play();
    }

    function onPlay() {
        $q.addClass('QPlayer-playing');
    }

    function onPlayPrepare() {
        $progress.width('0');
        onPlay();
    }

    function onPause() {
        $q.removeClass('QPlayer-playing');
    }

    function s2m(s) {
        let m = Math.floor(s / 60);
        s = Math.floor(s % 60);
        if (m < 10) {
            m = `0${m}`;
        }
        if (s < 10) {
            s = `0${s}`;
        }
        return `${m}:${s}`;
    }

    function isPlaying() {
        return $q.hasClass('QPlayer-playing');
    }

    function load(item) {
        if (q.current === item) {
            return;
        }
        $name.text(item.name);
        $artist.text(item.artist);
        $cover.attr('src', item.cover);
        $(q.current.target).removeClass('QPlayer-list-current');
        $(item.target).addClass('QPlayer-list-current');
        q.current = item;
    }

    function play(item) {
        load(item);
        if (item.url) {
            playAudio();
            return true;
        }
        const id = item.id;
        if (!id) {
            return false;
        }
        const source = item.source || 'netease';
        if (source !== 'netease') {
            console.warn('暂不支持源：' + source);
            return 0;
        }
        onPlayPrepare();
        $.ajax({
            dataType: 'jsonp',
            url: 'https://api.littlehands.site/NeteaseMusic/',
            data: {
                type: 'song',
                id: id
            },
            success: function (json) {
                console.log('success');
                const url = json.url;
                if (url) {
                    item.url = url;
                    playAudio();
                } else {
                    // error
                }
            },
            error: function () {
                console.log('error');
                console.log(arguments);
            }
        });
        return 2;
    }

    /**
     * 加载
     *
     * @param index
     * @return {boolean}
     */
    q.load = function(index) {
        const length = v.list.length;
        if (length === 0) {
            console.warn('list 为空！');
            return false;
        }
        if (typeof index === 'number') {
            if (!(length > index)) {
                console.warn(`超出 list，length=${length}，index=${index}`);
                return false;
            }
        } else {
            index = getNextIndex();
        }
        const current = v.list[index];
        $name.text(current.name);
        $artist.text(current.artist);
        $cover.attr('src', current.cover);
        $list.children('.QPlayer-list-current').removeClass('QPlayer-list-current');
        $list.children(`:eq(${index})`).addClass('QPlayer-list-current');
        // todo 加载歌词

        q.index = index;
        q.current = current;
        audio.load();
        return true;
    };

    /**
     * 播放
     *
     * @param index
     * @return {number}
     * 0 错误
     * 1 成功
     * 2 请求 API
     */
    q.play = function(index, history) {
        if (typeof index === 'number') {
            if (!q.load(index)) {
                return 0;
            }
        } else if(audio.readyState !== 0) {
            onPlay();
            audio.play();
            return 1;
        }

        const current = q.current;
        if (current.url) {
            playAudio();
            return 1;
        }
        const id = current.id;
        if (!id) {
            return 0;
        }
        const source = current.source || 'netease';
        if (source !== 'netease') {
            console.warn('暂不支持源：' + source);
            return 0;
        }
        onPlayPrepare();
        $.ajax({
            dataType: 'jsonp',
            url: 'https://api.littlehands.site/NeteaseMusic/',
            data: {
                type: 'song',
                id: id
            },
            success: function (json) {
                console.log('success');
                const url = json.url;
                if (url) {
                    current.url = url;
                    playAudio();
                } else {
                    // error
                }
            },
            error: function () {
                console.log('error');
                console.log(arguments);
            }
        });
        return 2;
    };

    q.pause = function() {
        onPause();
        audio.pause();
    };

    q.next = function() {
        q.play(getNextIndex());
    };

    q.previous = function() {

    };

    $('#QPlayer-switch').click(function () {
        $q.toggleClass('QPlayer-show');
    });
    $('#QPlayer-btn-list').click(function () {
        $more.toggleClass('QPlayer-list-show');
    });
    $('#QPlayer-btn-lyric').click(function () {
        $more.toggleClass('QPlayer-lyric-show');
    });
    $('#QPlayer-btn-play').click(function () {
        if (isPlaying()) {
            q.pause();
        } else {
            q.play();
        }
    });
    $('#QPlayer-btn-next').click(q.next);
    $('#QPlayer-btn-previous').click(q.previous);
    $list.on('click', 'li', function () {
        const item = this.QPlayer;
        if (item) {

        }
        q.play(item.index());
    });
    $audio
        .on('playing', onPlay)
        .on('pause', onPause)
        .on('ended', q.next)
        .on('timeupdate', function () {
            const time = audio.currentTime;
            $time.text(s2m(time));

            $progress.width(100 * time / audio.duration + '%');
        })
    ;

    function defineProperties(obj, properties) {
        const keys = Object.keys(properties);
        const length = keys.length;
        for (let i = 0; i < length; i++) {
            const key = keys[i];
            v[key] = obj[key];
        }
        Object.defineProperties(obj, properties);
        for (let i = 0; i < length; i++) {
            const key = keys[i];
            obj[key] = v[key] || properties[key].default;
        }
    }

    defineProperties(q,{
        isRandom: {
            get: function () {
                return v.isRandom;
            },
            set: function (bool) {
                v.isRandom = bool;
                // q.history = [q.listIndex];
                // q.histIndex = 0;
            },
            default: false
        },
        isRotate: {
            get: function () {
                return v.isRotate;
            },
            set: function (value) {
                v.isRotate = value;
                if (!$cover.length) {
                    console.warn('找不到 QPlayer！');
                    return;
                }
                if (value) {
                    $cover.addClass('QPlayer-cover-rotate');
                } else {
                    $cover.removeClass('QPlayer-cover-rotate');
                }
            },
            default: true
        },
        list: {
            get: function () {
                return v.list;
            },
            set: function (value) {
                if (!Array.isArray(value)) {
                    console.warn('list 应该是数组');
                    return;
                }
                v.list = value;
                if (value.length === 0) {
                    return;
                }
                $list.empty();
                const length = value.length;
                for (let i = 0; i < length; i++) {
                    const item = value[i];
                    let artist = item.artist;
                    if (Array.isArray(artist)) {
                        item.artist = artist = artist.join('/');
                    }
                    const $li = $(`<li><strong>${item.name}</strong><span>${artist}</span></li>`);
                    $list.append($li);
                    $li.prop('QPlayer', item);
                }
                if (q.index > -1 && q.current) {
                    const length = value.length;
                    if (length > q.index && value[q.index] === q.current) {
                        return;
                    }
                    if (length === 0) {
                        return;
                    }
                }
                q.index= -1;
                q.current = null;
                q.load();
            },
            default: []
        }
    });

});

