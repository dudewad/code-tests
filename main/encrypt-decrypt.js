let min = 'a'.charCodeAt(0);
let max = 'z'.charCodeAt(0);

function encryptString(str) {
    let output = '';
    let curr;
    let tally = 1;
    let encrypted;

    for (let i = 0, len = str.length; i < len; i++) {
        curr = str.charCodeAt(i);
        encrypted = encryptChar(curr, tally);
        tally += encrypted;
        output += String.fromCharCode(encrypted);
    }

    return output;
}

function encryptChar(curr, tally) {
    let val = curr + tally;

    while (val > max) {
        val -= 26;
    }

    return val;
}

function decrypt(word) {
    let output = '';
    let curr;
    let decrypted;
    let tally = 1;

    for (let i = 0, len = word.length; i < len; i++) {
        curr = word.charCodeAt(i);
        decrypted = decryptChar(curr, tally);
        tally += decrypted;
        output += String.fromCharCode(decrypted);
    }

    return output;
}

function decryptChar(curr, tally) {
    let val = curr - tally;

    while (val < min) {
        val += 26;
    }

    return val;
}


tests = [
    'omg',
    'fishes',
    'elephants',
    'towers',
    'antz',
    'zebras'
];

for(let i = 0; i < tests.length; i++) {
    console.log('============');
    let test = tests[i];
    console.log(`Testing ${test}`);
    let encStr = encryptString(test);
    console.log(encStr);
    let decStr = decrypt(encStr);
    console.log(decStr);
    console.log('============');
}

