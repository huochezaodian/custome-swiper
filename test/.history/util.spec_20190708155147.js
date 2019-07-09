/**
 * @file util.js unit test
 * @author yangtianyi03@baidu.com
 * @date 2019-05-07
 */
import {getElementStyle, getTranslate, getDirection, directions} from './../src/util.js';

describe('Function getElementStyle test', function() {
    let divDom = document.createElement('div');
    let styles = {};

    beforeAll(() => {
        document.body.appendChild(divDom);
        styles = getElementStyle(divDom);
    });

    it('getElementStyle should be a function.', () => {
        expect(typeof getElementStyle).toBe('function');
    });

    it('getElementStyle should return a object.', () => {
        expect(typeof styles).toBe('object');
    });

    it('getElementStyle should return width 、height and so on', () => {
        expect(styles.width).not.toBeNull();
        expect(styles.height).not.toBeNull();
        expect(styles.marginLeft).not.toBeNull();
        expect(styles.marginRight).not.toBeNull();
        expect(styles.marginTop).not.toBeNull();
        expect(styles.marginBottom).not.toBeNull();
    });

    it('getElementStyle should return number value.', () => {
        expect(typeof styles.width).toBe('number');
        expect(typeof styles.height).toBe('number');
        expect(typeof styles.marginLeft).toBe('number');
        expect(typeof styles.marginBottom).toBe('number');
        expect(typeof styles.marginTop).toBe('number');
        expect(typeof styles.marginRight).toBe('number');
    });

    afterAll(() => {
        divDom.remove();
        styles = null;
        divDom = null;
    });
});

describe('Function getTranslate test', function() {
    let divDom = document.createElement('div');
    let translate = null;
    beforeAll(() => {
        document.body.appendChild(divDom);
        divDom.setAttribute('style', 'transform:translate3d(100px,200px,300px);-webkit-transform:translate3d(100px,200px,300px)');
    });

    it('getTranslate should be a function.', () => {
        expect(typeof getTranslate).toBe('function');
    });

    it('The default return value of the no-pass parameter is not empty.', () => {
        translate = getTranslate(divDom);
        expect(translate).not.toBeNull();
    });

    it('Returns the value of number type when parameter x is present.', () => {
        translate = getTranslate(divDom, 'x');
        expect(typeof translate).toBe('number');
    });

    it('Returns the value of number type when parameter y is present.', () => {
        translate = getTranslate(divDom, 'y');
        expect(typeof translate).toBe('number');
    });

    afterAll(() => {
        divDom.remove();
        translate = null;
        divDom = null;
    });
});

describe('Function getDirection test', function() {
    let direction = null;

    it('getTranslate should be a function.', () => {
        expect(typeof getDirection).toBe('function');
    });

    it('x 和 y 相等时返回 0.', () => {
        direction = getDirection(10, 10);
        expect(direction).toBe(directions.origin);
    });

    it('x 绝对值大于 y且 x为正数 时返回 2.', () => {
        direction = getDirection(10, 1);
        expect(direction).toBe(directions.right);
    });

    it('x 绝对值大于 y且 x为负数 时返回 4.', () => {
        direction = getDirection(-10, 1);
        expect(direction).toBe(directions.left);
    });

    it('x 绝对值小于 y且 y为正数 时返回 1.', () => {
        direction = getDirection(1, 10);
        expect(direction).toBe(directions.up);
    });

    it('x 绝对值小于 y且 y为负数 时返回 3.', () => {
        direction = getDirection(1, -10);
        expect(direction).toBe(directions.down);
    });

    afterAll(() => {
        direction = null;
    });
});