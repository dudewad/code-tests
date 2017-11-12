/**
 * BFS and DFS graph traversal. Run from node:
 * node traversal --find=XXX
 * where `xxx` is the number you wish to find in the graph `a` defined below.
 */

const argv = require('argv');
argv.option([
    {name: 'find', type: 'string'}
]);
let args = argv.run(argv);

if (args.options.find === undefined) {
    throw new Error('--find argument must be set.')
}

let searchVal = parseInt(args.options.find);

let a = {
    val: 0,
    b: {
        val: 1,
        e: {
            val: 4,
            l: {
                val: 10
            },
            m: {
                val: 11
            }
        },
        f: {
            val: 5,
            n: {
                val: 12
            },
            o: {
                val: 13
            }
        }
    },
    c: {
        val: 2,
        g: {
            val: 6,
            p: {
                val: 14
            },
            q: {
                val: 15,
                v: {
                    val: 20,
                    w: {
                        val: 21
                    }
                }
            }
        },
        h: {
            val: 7
        }
    },
    d: {
        val: 3,
        i: {
            val: 8,
            r: {
                val: 16
            },
            s: {
                val: 17
            }
        },
        j: {
            val: 9,
            t: {
                val: 18
            },
            u: {
                val: 19
            }
        }
    }
};

function dfs(node, nodeKey, targetVal) {
    let found;

    if(node.val === targetVal) {
        found = {};
        found[nodeKey] = node;
        return found;
    }

    for(let key in node) {
        if(node.hasOwnProperty(key)) {
            if(key !== 'val') {
                found = dfs(node[key], key, targetVal);
                if(found) {
                    return found;
                }
            }
        }
    }
    return undefined;
}

console.log('#######Running DFS algorithm');
let node = dfs(a, 'a', searchVal);
console.log(`Searching for node: ${searchVal}`);
console.log(`Found: ${JSON.stringify(node)}`);


function bfs(node, nodeKey, targetVal, queue) {
    let found;
    if (node.val === targetVal) {
        found = {};
        found[nodeKey] = node;
        return found;
    }

    for(let key in node) {
        if(node.hasOwnProperty(key)) {
            if(key !== 'val') {
                queue.push({n: node[key], k: key});
            }
        }
    }

    let next = queue.shift();
    return next ? bfs(next.n, next.k, targetVal, queue) : undefined;
}

console.log('#######Running BFS algorithm');
node = bfs(a, 'a', searchVal, []);
console.log(`Searching for node: ${searchVal}`);
console.log(`Found: ${JSON.stringify(node)}`);