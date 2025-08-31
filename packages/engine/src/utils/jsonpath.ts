export function convertExpression(expression: string) : string {
    // 检查是否以 $. 开头
    if (!expression.startsWith('$.')) {
        return expression;
    }

    // 提取 $. 后面的第一段内容
    const afterDollar = expression.substring(2); // 去掉 $.
    const firstDotIndex = afterDollar.indexOf('.');

    let firstSegment;
    let remainingPart = '';

    if (firstDotIndex === -1) {
        // 没有更多的点，整个都是第一段
        firstSegment = afterDollar;
    } else {
        // 有点，分割第一段和剩余部分
        firstSegment = afterDollar.substring(0, firstDotIndex);
        remainingPart = afterDollar.substring(firstDotIndex); // 包含点
    }

    // 检查第一段是否包含中文字符
    const hasChinese = /[\u4e00-\u9fff]/.test(firstSegment);

    if (hasChinese) {
        // 如果包含中文，转换为 $['xxx'] 格式
        return `$['${firstSegment}']${remainingPart}`;
    } else {
        // 如果不包含中文，保持原格式
        return expression;
    }
}