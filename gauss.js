"use strict";
function readFile(url) {

    return new Promise(function(resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onload = function() {
            if (this.status == 200) {
                resolve(JSON.parse(this.response));
            } else {
                var error = new Error(this.statusText);
                error.code = this.status;
                reject(error);
            }
        };
        xhr.send();
    });

}
function deepCloneArray(array) {
    let copy = [];

    for (let item in array) {
        if ( typeof array[item] == "object") {
            copy[item] = deepCloneArray(array[item]);
        } else {
            copy[item] = array[item];
        }
    }
    return copy;
}

let promise = readFile("matrix.json").then((task) => {
    let matrix = task.matrix;

    let originalMatrix = deepCloneArray(matrix);

    const n = 4;

    let rightSide = task.rightSide;
    let originalRightSide = deepCloneArray(rightSide);

    let roots = Array.from( { length: 4 } );

    /*
    *  Начало вычислений
     */
    for ( let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {

            let multiplier = matrix[j][i] / matrix[i][i];

            for (let k = i; k < n; k++) {
                matrix[j][k] -= matrix[i][k] * multiplier;
            }
            rightSide[j] -= rightSide[i] * multiplier;
        }
    }

    roots[n - 1] = rightSide[n - 1] / matrix[n - 1][n - 1];

    for (let i = n - 2; i >= 0; i--) {
        let s = 0;

        for (let j = i + 1; j < n; j++) {
            s += matrix[i][j] * roots[j];
        }
        roots[i] = (rightSide[i] - s) / matrix[i][i];
    }

    let errorsVector = Array.from( {length: 4} ).fill(0);

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            errorsVector[i] += roots[j] * originalMatrix[i][j];
        }
        errorsVector[i] -= originalRightSide[i];
    }

    /*
    *  Конец вычислений
     */

    console.log("Вектор решения");
    console.log(roots);
    console.log("Вектор неувязок");
    console.log(errorsVector);
});