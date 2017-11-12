let tests = [
    {
        vals: [-17, -5, 3, 4, 10, 11, 18],
        target: 10
    },
    {
        vals: [-10, -5, -2, 0, 7, 13, 245],
        target: -2
    },
    {
        vals: [0, 23, 45, 76, 889, 901],
        target: 889
    },
    {
        vals: [11],
        target: 11
    },
    {
        vals: [],
        target: 25
    },
    {
        vals: [-2045, -456, -325, -200, -159, -50, -1],
        target: -2045
    },
    {
        vals: [3, 7, 56, 152, 245, 987, 1235],
        target: 1235
    }
];

function binarySearch(arr, target) {
    let start = 0;
    let end = arr.length - 1;
    let idx;
    let item;

    console.log(`Start\n-----------`);
    while(start <= end) {
        idx = Math.floor((end - start) * .5) + start;
        item = arr[idx];
        console.log(`${idx} | ${item}`);

        if(item === target) {
            return idx;
        }
        if(item > target) {
            end = idx - 1;
        }
        else {
            start = idx + 1;
        }
    }
    console.log('-----------\nEnd');

    return -1;
}

for (let i = 0, len = tests.length; i < len; i++) {
    let arr = tests[i].vals;
    let target = tests[i].target;
    let idx;

    console.log(`\n###########\nSearching for value '${target}' in array [${arr}]\n`);
    idx = binarySearch(arr, target);

    if(idx !== -1) {
        console.log(`Found value '${target}' at index: ${idx}\n`);
        continue;
    }

    console.log(`Value '${target}' doesn't exist in array.\n`);
}