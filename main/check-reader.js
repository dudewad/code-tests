let tests = [
    'one hundred',
    'one hundred thousand',
    'two thousand thirty four',
    'one hundred ninety seven',
    'fifty two hundred seventy six',
    'twenty two thousand three hundred thirty one',
    'One Hundred Sixty Four Million seven HundRED forty three thousand three hundred fifty nine'
];


let nums = {
    'one': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
    'six': 6,
    'seven': 7,
    'eight': 8,
    'nine': 9,
    'ten': 10,
    'eleven': 11,
    'twelve': 12,
    'thirteen': 13,
    'fourteen': 14,
    'fifteen': 15,
    'sixteen': 16,
    'seventeen': 17,
    'eighteen': 18,
    'nineteen': 19,
    'twenty': 20,
    'thirty': 30,
    'forty': 40,
    'fifty': 50,
    'sixty': 60,
    'seventy': 70,
    'eighty': 80,
    'ninety': 90
};

let multipliers = {
    'hundred': 100,
    'thousand': 1000,
    'million': 1000000
};

function parse(input) {
    let words = input.toLowerCase().split(' ');
    let total = 0;
    let currNum = 0;

    for(let i = 0; i < words.length; i++) {
        let word = words[i];

        if(multipliers.hasOwnProperty(word)) {
            currNum *= multipliers[word];
            if (word !== 'hundred') {
                total += currNum;
                currNum = 0;
            }
            continue;
        }

        currNum += nums[word];
    }

    total += currNum;

    console.log('##################################\n', `Parsing ${words.join(' ')} -- ${total}`, '\n##################################\n');
    return total;
}

for(let i = 0; i < tests.length; i++){
    parse(tests[i]);
}