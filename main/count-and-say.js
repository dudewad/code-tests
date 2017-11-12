/**
 * @param {number} n
 * @return {string}
 */
function countAndSay(n) {
    let i = 0;
    let output = '1';
    n--;

    while (i < n) {
        output = analyze(output);
        i++
    }
    return output;
}

function analyze(n) {
    let output = '';
    let currChar;
    let repeat;

    for (let i = 0, len = n.length; i < len; i++) {
        currChar = n.charAt(i);
        repeat = currChar === n.charAt(i + 1);
        output += (repeat ? '2' : '1') + currChar;
        if (repeat) {
            i++;
        }
    }

    return output;
}

console.log(countAndSay(1));
console.log(countAndSay(2));
console.log(countAndSay(3));
console.log(countAndSay(4));
console.log(countAndSay(5));
console.log(countAndSay(6));
console.log(countAndSay(7));
console.log(countAndSay(8));
console.log(countAndSay(9));
