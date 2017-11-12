let tests = [
    [[0,2],[1,5],[7,10],[8,12],[13,15]],
    [[2,4],[1,3],[6,9],[10,11],[4,5]],
    [[2,5],[11,12],[8,11],[4,6],[10,13]],
    [[6,8],[2,4],[10,12],[14,16],[5,7]]
];

function sort(a, b) {
    return a[0] - b[0];
}

function findOpen(input) {
    console.log('\n\nStarting input:\n', input);
    console.log('####################');
    let output = [];
    let merged = [];

    //Sort test input by start time
    input.sort(function (a, b) {
        return a[0] - b[0];
    });

    let curr = input[0];
    //Merge overlapping times
    for (let i = 0, len = input.length; i < len; i++) {
        let comparator = input[i + 1];
        if(!comparator) {
            merged.push(curr);
            break;
        }

        if(curr[1] + 1 >= comparator[0]){
            if(curr[1] < comparator[1]) {
                curr[1] = comparator[1];
            }
        }
        else {
            merged.push(curr);
            curr = comparator;
        }
    }

    let baseTime = 0;
    let currGap = [];
    //Deduce gaps from the merged set
    for (let i = 0, len = merged.length; i < len; i++) {
        let set = merged[i];

        if(baseTime < set[0]) {
            currGap = [];
            currGap[0] = format(baseTime);
            currGap[1] = format(set[0] - 1);
            output.push(currGap);
        }
        if(i === merged.length - 1 && set[1] < 15) {
            currGap = [format(set[1] + 1), format(15)];
            output.push(currGap);
        }
        baseTime = set[1] + 1;
    }
    return output;
}

function format(input){
    return (input * .5) + 9;
}

for (let i = 0, len = tests.length; i < len; i++) {
    console.log('############\nOutput: \n#########\n', findOpen(tests[i]));
}