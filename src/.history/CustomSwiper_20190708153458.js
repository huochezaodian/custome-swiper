/**
 * @file custome-swiper
 * @author yangtianyi03@baidu.com
 * @date 2019-05-07
 */

import {getElementStyle, getTranslate, getDirection, directions} from './util.js';
const prefix = '.custom-swiper';
const classConfig = {
    container: prefix + '-container',
    wrapper: prefix + '-wrapper',
    slide: prefix + '-slide'
};
const timeUnit = 'ms';
const DIRECTION = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
};
const directionMap = {
    [DIRECTION.VERTICAL]: ['Height', 'Y'],
    [DIRECTION.HORIZONTAL]: ['Width', 'X']
};

/**
 * @description 滑动辅助工具
 * @export
 * @class CustomSwiper
 */
export default class CustomSwiper {
    constructor (parentNode, opt = {}) {
        this.$parentNode = parentNode || document;
        this.$opt = {
            // 阻止默认事件
            preventDefault: opt.preventDefault || true,
            // 阻止事件冒泡
            stopPropagation: opt.stopPropagation || false,
            // 阻止横向滑动时的默认事件
            preventX: opt.preventX || true,
            // 阻止纵向滑动时的默认事件
            preventY: opt.preventY || false,
            // 滑动方向，默认水平，可选值有 vertical, horizontal
            direction: [DIRECTION.HORIZONTAL, DIRECTION.VERTICAL].includes(opt.direction)
                ? opt.direction
                : DIRECTION.HORIZONTAL,
            carousel: opt.carousel || false,
            autoPlay: opt.autoPlay || true,
            timeInterval: opt.timeInterval || 1000,
        };
        this.init();
    }
    init() {
        // 滑动容器层
        this.$container = this.$parentNode.querySelector(classConfig.container);
        // 滑动包裹层，实际滑动层
        this.$wrapper = this.$container.querySelector(classConfig.wrapper);
        // 滑动项
        this.$slides = this.$wrapper.querySelectorAll(classConfig.slide);
        // 如果没有滑动项，则不做任何处理
        if (this.$slides.length === 0) {
            return false;
        }

        // 每一项的宽度 和 高度
        this.slideStyle = getElementStyle(this.$slides[0]);
        this.slideWidth = this.slideStyle.width;
        this.slideHeight = this.slideStyle.height;
        // 轮播阈值比例
        this.rate = 0.3;

        // 求出范围值，以及当前translate
        this.maxX = this.getMaxTranslateX();
        this.minX = this.getMinTranslateX();
        this.maxY = this.getMaxTranslateY();
        this.minY = this.getMinTranslateY();
        // 轮播的当前项索引
        this.curIndex = 1;
        // 轮播的定时器
        this.timer = null;

        // 实际滑动属性
        this.translateX = this.maxX;
        this.translateY = this.maxY;
        this.startX = 0;
        this.startY = 0;
        this.startTime = 0;
        // 上一次的数据，用作比较
        this.preData = null;
        // transition正常滑动时间
        this.time = 1000;
        // transition弹性滑动时间
        this.bounceTime = 300;
        // transition 弹性间隔
        this.bounceDistance = 30;
        // 滑动距离系数
        this.ratio = 600;
        // 滑动时间系数
        this.timeRatio = 1000;
        // 时间最大值
        this.maxTime = 1000;
        // 时间最小值
        this.minTime = 300;
        // 最小速度
        this.minVelocity = 0.3;
        // 是否在滑动
        this.transition = false;
        // 是否在触摸
        this.touch = false;
        //  分段求值，最后取最后几段的值
        this.lastTimeRange = 80;
        this.count = 5;
        this.rangeData = [];

        // 监听触摸事件
        this.$container.addEventListener('touchstart', this.touchHandler);
        this.$container.addEventListener('touchmove', this.touchHandler);
        this.$container.addEventListener('touchend', this.touchHandler);

        // 轮播处理
        if (this.$opt.carousel) {
            this.handleCarousel();
        }

        return true;
    }
    // 惯性滑动处理
    handleInertiaSlide(data, direction) {
        const [, d] = directionMap[direction];
        const instVelocity = data[`instVelocity${d}`];
        const {time, distance} = this.handleData(instVelocity);
        if (!time) {
            return;
        }
        // 计算目标位置
        let target = this[`translate${d}`] + distance;
        if ([directions.left, directions.up].includes[direction]) {
            // 左边/上边移动，如果小于最小值，则进行最小限制，并且加上弹性距离，用作弹性运动
            const min = this[`min${d}`];
            target = target < min ? min - this.bounceDistance : target;
        } else if ([directions.right, directions.down].includes[direction]) {
            // 右边/下边移动，如果大于最大值，则进行最大限制，并且加上弹性距离，用作弹性运动
            const max = this[`max${d}`];
            target = target > max ? max + this.bounceDistance : target;
        }
        this.handleTransition(target, time);
    }
    // 处理临时速度
    handleData(instVelocity) {
        // 过小的速度忽略
        if (Math.abs(instVelocity) < this.minVelocity) {
            return {
                time: 0,
                distance: 0
            };
        }
        // 计算当前速度应该滑动的距离
        let distance = instVelocity * this.ratio;
        // 计算滑动时间
        let time = Math.abs(instVelocity * this.timeRatio);
        // 时间过短或过长都不允许
        time = time > this.minTime ? time < this.maxTime ? time : this.maxTime : this.minTime;
        return {
            distance,
            time
        };
    }
    // touch 事件处理
    touchHandler = e => {
        e = e || window.event;
        const opt = this.$opt;
        const [, type] = directionMap[opt.direction];
        opt.preventDefault && e.preventDefault();
        opt.stopPropagation && e.stopPropagation();

        // start
        if (e.type === 'touchstart') {
            // 清除transition运动
            this.transition && this.handleTransitionEnd();
            this.touch = true;
            // 清除轮播的定时器
            clearInterval(this.timer);
            this.timer = null;
        } else {
            // 如果 touchstart 没有被触发(可能被子元素的 touchstart 回调触发了 stopPropagation)，
            // 那么后续的手势将取消计算
            if (!this.startTime) {
                return;
            }
        }

        // 获取touchdata
        const data = this.getTouchData(e);

        // move
        if (e.type === 'touchmove') {
            // 只允许向设定的方向滑动
            const distance = data[`delta${type}`];
            this.handleTranslateX(this[`translate${type}`] + distance);
        }

        // end
        if (e.type === 'touchend') {
            // 只允许向设定的方向滑动
            const distance = data[`delta${type}`];
            this.handleTranslateX(this[`translate${type}`] + distance);
            this[`translate${type}`] += distance;
            this.touch = false;

            // 轮播
            if (opt.carousel) {
                this.handleCheckPlay();
            } else {
                // 检查是否超出范围，超出则回弹
                const isOver = this.handleCheckOverflow();
                // 未超出范围进行滑动处理
                !isOver && this.handleCheckSwiper();
            }
        }
    };
    // 检查触摸滑动对轮播的影响，不超过范围，则返回，超出则下一页
    handleCheckPlay() {
        const {direction} = this.$opt;
        const [style, type] = directionMap[direction];
        const slideStyle = this[`slide${style}`];
        // 先判断是否超出
        const value = slideStyle * this.rate;
        const slideDistance = this.curIndex * slideStyle + this[`translate${type}`];
        if (Math.abs(slideDistance) > value) {
            if (slideDistance < 0) {
                this.curIndex++;
            } else {
                this.curIndex--;
            }
        }
        this.handleTransition(-this.curIndex * slideStyle, this.bounceTime);
    }
    // translateX 运动
    handleTranslateX(target) {
        this.$wrapper.style.transform = `translate3d(${target}px, 0, 0)`;
        this.$wrapper.style.webkitTransform = `translate3d(${target}px, 0, 0)`;
    }
    // translateY 运动
    handleTranslateY(target) {
        this.$wrapper.style.transform = `translate3d(0, ${target}px, 0)`;
        this.$wrapper.style.webkitTransform = `translate3d(0, ${target}px, 0)`;
    }
    // transition 运动
    handleTransition(target, time = 1000) {
        if (this.transition) return;
        const {direction} = this.$opt;
        const [, type] = directionMap[direction];
        time && (this.transition = true);
        this.$wrapper.style.transitionDuration = time + timeUnit;
        this.$wrapper.style.webkitTransitionDuration = time + timeUnit;
        // 设置延迟，不然没有缓冲效果
        setTimeout(() => {
            this[`handleTranslate${type}`](target);

            this.$container.addEventListener(
                'transitionend',
                this.handleTransitionEnd
            );
            this.$container.addEventListener(
                'webkitTransitionEnd',
                this.handleTransitionEnd
            );
        });
    }

    handleTransitionEnd = () => {
        const {autoPlay} = this.$opt;
        this.transition = false;
        // 获取当前的x、y
        this.translateX = getTranslate(this.$wrapper, 'x');
        this.translateY = getTranslate(this.$wrapper, 'y');
        // 位置初始化
        this.$wrapper.style.transform =
            `translate3d(${this.translateX}px, ${this.translateY}px, 0)`;
        this.$wrapper.style.webkitTransform =
            `translate3d(${this.translateX}px, ${this.translateY}px, 0)`;
        // 时间还原
        this.$wrapper.style.transitionDuration = 0 + timeUnit;
        this.$wrapper.style.webkitTransitionDuration = 0 + timeUnit;
        // 移除事件监听
        this.$container.removeEventListener(
            'transitionend',
            this.handleTransitionEnd
        );
        this.$container.removeEventListener(
            'webkitTransitionEnd',
            this.handleTransitionEnd
        );

        // 轮播
        if (this.$opt.carousel) {
            if (this.curIndex === 0 || this.curIndex === this.$slides.length - 1) {
                this.handleResetTranslate();
            }
            !this.timer && !this.touch && autoPlay && this.autoPlay();
        } else {
            // 判断当前是否滑出范围，滑出则反弹
            this.handleCheckOverflow();
        }
    };

    handleCheckOverflow() {
        // 和最大最小值进行比较，超出则反弹
        if (this.translateX < this.minX) {
            this.handleTransition(this.minX, this.bounceTime);
            return true;
        } else if (this.translateX > this.maxX) {
            this.handleTransition(this.maxX, this.bounceTime);
            return true;
        } else if (this.translateY < this.minY) {
            this.handleTransition(this.minY, this.bounceTime);
            return true;
        } else if (this.translateY > this.maxY) {
            this.handleTransition(this.maxY, this.bounceTime);
            return true;
        }
        return false;
    }

    handleCheckSwiper() {
        // 总共移动的横向距离
        let totalDistanceX = 0;
        // 总共移动的纵向距离
        let totalDistanceY = 0;
        // 移动花费的总时间
        let totalTime = 0;
        const length = this.rangeData.length;
        const direction = this.rangeData[length - 1].direction;
        if (length === 1) {
            // 等于1代表数据只有一条，就是触摸间隔太短，不做任何处理
            return;
        } else {
            totalTime = this.rangeData[length - 1].timeStamp - this.rangeData[0].timeStamp;
            totalDistanceX = this.rangeData[length - 1].x - this.rangeData[0].x;
            totalDistanceY = this.rangeData[length - 1].y - this.rangeData[0].y;
        }
        // 临时速度等于总共的临时距离除于总共的时间
        let resultData = {
            instVelocityX: totalDistanceX / totalTime,
            instVelocityY: totalDistanceY / totalTime
        };
        
        // 竖直方向滑动和水平方向滑动判断
        if (
            [directions.up, directions.down].includes(direction) 
            && this.$opt.direction === DIRECTION.VERTICAL
        ) {
            this.handleInertiaSlide(resultData, direction);
        } else if (
            [directions.right, directions.left].includes(direction)
            && this.$opt.direction === DIRECTION.HORIZONTAL
        ) {
            this.handleInertiaSlide(resultData, direction);
        }
    }
    // 轮播
    handleCarousel() {
        const {autoPlay} = this.$opt;
        // 轮播的话先进行无限轮播处理
        this.handleLoop();
        if (autoPlay) {
            this.autoPlay();
        }
    }
    // 自动轮播
    autoPlay() {
        const {timeInterval, direction} = this.$opt;
        const [style] = directionMap[direction];
        let target = null;
        this.timer = setInterval(() => {
            this.curIndex++;
            target = this.curIndex * this[`slide${style}`];
            this.handleTransition(-target, timeInterval / 2);
        }, timeInterval);
    }
    // 滚动到指定地点重置位置
    handleResetTranslate() {
        const length = this.$slides.length;
        const {direction} = this.$opt;
        const [style] = directionMap[direction];
        let target = null;
        // 如果滑动到第0个位置，则返回到length-2个
        if (this.curIndex === 0) {
            this.curIndex = length - 2;
        }
        // 如果滑动到length-1个位置，则返回到第1个
        else if (this.curIndex === length - 1) {
            this.curIndex = 1;
        }
        target = this.curIndex * this[`slide${style}`];
        this.handleTransition(-target, 0);
    }
    // 无限轮播处理
    handleLoop() {
        const {direction} = this.$opt;
        const [style, type] = directionMap[direction];
        const length = this.$slides.length;
        // 克隆第一个和最后一个元素
        const cloneNodeFirst = this.$slides[0].cloneNode(true);
        const cloneNodeLast = this.$slides[length - 1].cloneNode(true);
        // 在最前和最后插入相应的元素
        this.$wrapper.insertBefore(cloneNodeLast, this.$wrapper.firstChild);
        this.$wrapper.appendChild(cloneNodeFirst);
        this.$slides = this.$wrapper.querySelectorAll(classConfig.slide);
        // 然后滑动到第一个项
        this[`handleTranslate${type}`](-this[`slide${style}`]);
    }
    // 获取最大的translateX
    getMaxTranslateX() {
        return getTranslate(this.$wrapper, 'x') || 0;
    }
    // 获取最大的translateY
    getMaxTranslateY() {
        return getTranslate(this.$wrapper, 'y') || 0;
    }
    // 获取最小的translateX
    getMinTranslateX() {
        const wrapperWidth = getElementStyle(this.$wrapper).width;
        const containerWidth = getElementStyle(this.$container).width;
        return wrapperWidth >= containerWidth ? containerWidth - wrapperWidth : 0;
    }
    // 获取最小的translateY
    getMinTranslateY() {
        const wrapperHeight = getElementStyle(this.$wrapper).height;
        const containerHeight = getElementStyle(this.$container).height;
        return wrapperHeight >= containerHeight ? containerHeight - wrapperHeight : 0;
    }

    getTouchData(event) {
        let data = {};
        let {preventX, preventY} = this.$opt;
        let now = Date.now();
        // 判断是不是touchend
        let touches = event.touches.length
            ? event.touches
            : event.changedTouches;
        // 只取第一个手指
        let touch = touches[0];
        // 如果是touchstart，则赋初始值
        if (event.type === 'touchstart') {
            this.startX = touch.clientX;
            this.startY = touch.clientY;
            this.startTime = now;
            this.preData = null;
            this.rangeData = [data];
        }
        let startX = this.startX;
        let startY = this.startY;
        // 相比开始执行时间
        let deltaTime = (data.deltaTime = now - this.startTime);
        // 执行事件源
        data.pointers = touches;
        // touch坐标
        data.x = touch.clientX;
        data.y = touch.clientY;
        // touch的滑动距离
        let deltaX = (data.deltaX = touch.clientX - startX);
        let deltaY = (data.deltaY = touch.clientY - startY);
        // touch的滑动速度
        data.velocityX = deltaX / deltaTime || 0;
        data.velocityY = deltaY / deltaTime || 0;
        // touch的x轴滑动方向
        data.direction = data.direction = getDirection(deltaX, deltaY);
        data.eventState = event.type.replace('touch', '');
        data.timeStamp = now;

        // 分段存值
        let length = this.rangeData.length;
        if (
            !!length &&
            now - this.rangeData[length - 1].timeStamp >= this.lastTimeRange
        ) {
            if (length === this.count) {
                this.rangeData.shift();
            }
            this.rangeData.push(data);
        }

        let preData = this.preData;
        // 此时和之前时间的比较
        if (preData) {
            let preData = this.preData;
            // 此时和上次的时间间隔
            let instTime = (data.instantDeltaTime = now - preData.timeStamp);
            // 计算瞬时速度
            let instX = (data.instantVelocityX =
                (data.x - preData.x) / instTime || 0);
            let instY = (data.instantVelocityY =
                (data.y - preData.y) / instTime || 0);
            // 判断是否阻止x轴/y轴的默认事件
            if (data.eventState === 'move' && (preventX || preventY)) {
                let curDirection = Math.abs(instX) > Math.abs(instY);
                if ((preventX && curDirection) || (preventY && !curDirection)) {
                    event.preventDefault();
                }
            }
        } else {
            // 重置执行时间和速度
            data.instantDeltaTime = data.instantVelocityX = data.instantVelocityY = 0;
        }

        this.preData = data;

        data.event = event;
        return Object.freeze(data);
    }

    update() {
        this.$slides = this.$wrapper.querySelectorAll(classConfig.slide);
        this.maxX = this.getMaxTranslateX();
        this.minX = this.getMinTranslateX();
        this.maxY = this.getMaxTranslateY();
        this.minY = this.getMinTranslateY();
    }

    destroy() {
        // 清楚定时器
        this.timer && clearInterval(this.timer);
        // 清除触摸、缓冲结束的时间监听
        this.$container.removeEventListener(
            'touchstart',
            this.handleTouchStart
        );
        this.$container.removeEventListener('touchmove', this.handleTouchMove);
        this.$container.removeEventListener('touchend', this.handleTouchEnd);
        this.$container.removeEventListener(
            'transitionend',
            this.handleTransitionEnd
        );
        this.$container.removeEventListener(
            'webkitTransitionEnd',
            this.handleTransitionEnd
        );
    }
}

window.CustomSwiper = CustomSwiper;
