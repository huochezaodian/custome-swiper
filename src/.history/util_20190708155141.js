/**
 * @file custom-swiper-util
 * @author yangtianyi03@baidu.com
 * @date 2019-05-07
 */

/**
 *  获取元素的部分style值
 * 
 * @param {HtmlElement} element html节点
 * @returns {object} 返回{width, height, marginLeft, marginRight, marginTop, marginBottom}
 */
export function getElementStyle(element) {
    const curStyle = window.getComputedStyle(element, null);
    const radix = 10;
    return {
        width: parseInt(curStyle.width, radix),
        height: parseInt(curStyle.height, radix),
        marginLeft: parseInt(curStyle.marginLeft, radix),
        marginRight: parseInt(curStyle.marginRight, radix),
        marginTop: parseInt(curStyle.marginTop, radix),
        marginBottom: parseInt(curStyle.marginBottom, radix)
    };
}

/**
 *  获取translate的x/y, 引自 swiper util
 * 
 * @param {HtmlElement} element html元素
 * @param {string} [axis="x"]
 * @returns {number}
 */
export function getTranslate(element, axis = 'x') {
    let matrix;
    let curTransform;
    let transformMatrix;

    const curStyle = window.getComputedStyle(element, null);

    if (window.WebKitCSSMatrix) {
        curTransform = curStyle.transform || curStyle.webkitTransform;
        if (curTransform.split(',').length > 6) {
            curTransform = curTransform
                .split(', ')
                .map(a => a.replace(',', '.'))
                .join(', ');
        }
        // Some old versions of Webkit choke when 'none' is passed; pass
        // empty string instead in this case
        transformMatrix = new window.WebKitCSSMatrix(
            curTransform === 'none' ? '' : curTransform
        );
    } else {
        transformMatrix = curStyle.MozTransform
            || curStyle.OTransform 
            || curStyle.MsTransform
            || curStyle.msTransform
            || curStyle.transform
            || curStyle
            .getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
        matrix = transformMatrix.toString().split(',');
    }

    if (axis === 'x') {
        // Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix) {
            curTransform = transformMatrix.m41;
        }
        // Crazy IE10 Matrix
        else if (matrix.length === 16) {
            curTransform = parseFloat(matrix[12]);
        }
        // Normal Browsers
        else {
            curTransform = parseFloat(matrix[4]);
        }
    }
    if (axis === 'y') {
        // Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix) {
            curTransform = transformMatrix.m42;
        }
        // Crazy IE10 Matrix
        else if (matrix.length === 16) {
            curTransform = parseFloat(matrix[13]);
        }
        // Normal Browsers
        else {
            curTransform = parseFloat(matrix[5]);
        }
    }
    return curTransform || 0;
}

// 方向常量
export const directions = {
    origin: 0,
    up: 1,
    right: 2,
    down: 3,
    left: 4
};

/**
 *  根据x轴和y轴的运动差值，判断运动的方向，并且只会返回一个方向的运动
 * 
 * @param {number} x x轴运动距离
 * @param {number} y y轴运动距离
 * @returns {number} 0: origin 1: up 2: right 3: down 4: left
 */
export function getDirection(x, y) {
    let direction = null;
    if (x === y) {
        direction = directions.origin;
    }
    // 判断哪个轴的距离大，则距离小的运动忽略
    if (Math.abs(x) > Math.abs(y)) {
        direction = x > 0 ? directions.right : directions.left;
    }
    if (Math.abs(x) < Math.abs(y)) {
        direction = y < 0 ? directions.down : directions.up;
    }

    return direction;
}