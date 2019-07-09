/**
 * @file CustomSwiper.js unit test
 * @author yangtianyi03@baidu.com
 * @date 2019-05-07
 */
import CustomSwiper from '../src/CustomSwiper.js';

describe('Class CustomSwiper test', function() {
    let swiper = null;
    let slideCount = 9;
    let direction = 'horizontal';
    let carousel = true;
    let autoPlay = true;
    let timeInterval = 2000;
    let containerDiv = document.createElement('div');
    let wrapperDiv = document.createElement('div');
    let eventObj = type => ({
        type,
        touches: [{
            clientX: 100,
            clientY: 100
        }],
        preventDefault(){}
    });

    beforeAll(() => {
        // 自制一个轮播dom
        containerDiv.className = 'custom-swiper-container';
        wrapperDiv.className = 'custom-swiper-wrapper custom-swiper-wrapper-horizontal';
        containerDiv.appendChild(wrapperDiv);
        document.body.appendChild(containerDiv);

        swiper = new CustomSwiper(
            null,
            {
                direction,
                carousel,
                autoPlay,
                timeInterval
            }
        );
    });

    beforeEach(() => {
        wrapperDiv.innerHTML = '';
        // 添加slide
        Array.from({length: slideCount}).forEach((item, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'custom-swiper-slide';
            slideDiv.innerText = index;
            wrapperDiv.appendChild(slideDiv);
        });
        swiper.update();
    });

    it('swiper should be a object.', () => {
        expect(typeof swiper).toBe('object');
    });

    it('slide 项为 0 的时候初始化返回 false.', () => {
        wrapperDiv.innerHTML = '';
        expect(swiper.init()).toBe(false);
    });

    it('slide 项不为 0 的时候初始化返回 true.', () => {
        expect(swiper.init()).toBe(true);
    });

    it('参数direction测试.', () => {
        expect(swiper.$opt.direction).toBe(direction);
    });

    it('参数carousel测试.', () => {
        expect(swiper.$opt.carousel).toBe(carousel);
    });

    it('参数autoPlay测试.', () => {
        expect(swiper.$opt.autoPlay).toBe(autoPlay);
    });

    it('参数timeInterval测试.', () => {
        expect(swiper.$opt.timeInterval).toBe(timeInterval);
    });

    it('class has the touchHandler property and it is a function.', () => {
        // touchHandler 三种事件
        swiper.touchHandler(eventObj('touchstart'));
        swiper.touchHandler(eventObj('touchmove'));
        swiper.touchHandler(eventObj('touchend'));
        expect(swiper.touchHandler).not.toBe(undefined);
        expect(typeof swiper.touchHandler).toBe('function');
    });

    it('class has the handleInertiaSlide property and it is a function.', () => {
        // 水平方向测试
        const data = {instVelocityX: 0.55};
        const direction = 'vertical';
        swiper.handleInertiaSlide(data, direction);
        expect(swiper.handleInertiaSlide).not.toBe(undefined);
        expect(typeof swiper.handleInertiaSlide).toBe('function');
    });

    it('class has the handleData property and it is a function.', () => {
        const instVelocityX = 0.66;
        const result = swiper.handleData(instVelocityX);
        expect(swiper.handleData).not.toBe(undefined);
        expect(typeof swiper.handleData).toBe('function');
        expect(typeof result).toBe('object');
        expect(result.time).not.toBe(undefined);
        expect(result.distance).not.toBe(undefined);
    });

    it('class has the handleLoop property and it is a function.', () => {
        swiper.handleLoop();
        expect(swiper.handleLoop).not.toBe(undefined);
        expect(typeof swiper.handleLoop).toBe('function');
    });

    it('class has the handleTransition property and it is a function.', () => {
        swiper.handleTransition();
        expect(swiper.handleTransition).not.toBe(undefined);
        expect(typeof swiper.handleTransition).toBe('function');
    });

    it('class has the handleTranslateX property and it is a function.', () => {
        swiper.handleTranslateX(0);
        expect(swiper.handleTranslateX).not.toBe(undefined);
        expect(typeof swiper.handleTranslateX).toBe('function');
    });

    it('class has the handleTranslateY property and it is a function.', () => {
        swiper.handleTranslateY(0);
        expect(swiper.handleTranslateY).not.toBe(undefined);
        expect(typeof swiper.handleTranslateY).toBe('function');
    });

    it('class has the handleCheckOverflow property and it is a function.', () => {
        swiper.handleCheckOverflow();
        expect(swiper.handleCheckOverflow).not.toBe(undefined);
        expect(typeof swiper.handleCheckOverflow).toBe('function');
    });

    it('class has the handleCheckSwiper property and it is a function.', () => {
        swiper.rangeData = [{
            direction: 0
        }];
        swiper.handleCheckSwiper();
        expect(swiper.handleCheckSwiper).not.toBe(undefined);
        expect(typeof swiper.handleCheckSwiper).toBe('function');
    });

    it('class has the handleResetTranslate property and it is a function.', () => {
        swiper.handleResetTranslate(0);
        expect(swiper.handleResetTranslate).not.toBe(undefined);
        expect(typeof swiper.handleResetTranslate).toBe('function');
    });

    it('class has the handleTransitionEnd property and it is a function.', () => {
        swiper.handleTransitionEnd(0);
        expect(swiper.handleTransitionEnd).not.toBe(undefined);
        expect(typeof swiper.handleTransitionEnd).toBe('function');
    });

    afterAll(() => {
        swiper.destroy();
        containerDiv.remove();
        containerDiv = null;
        wrapperDiv = null;
        swiper = null;
        slideCount = null;
        direction = null;
        carousel = null;
        autoPlay = null;
        timeInterval = null;
        eventObj = null;
    });
});