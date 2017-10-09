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

    let n = 4, k = 0;
    let eps = 0.001;

    let rightSide = task.rightSide;
    let originalRightSide = deepCloneArray(rightSide);

    let roots = Array.from( { length: 4} ).fill(0);

    console.log("Оригинальная матрица");
    console.log(originalMatrix);
    console.log("Оригинальная правая часть");
    console.log(originalRightSide);


    JordanProcedure(matrix, rightSide);

    console.log("Преобразованая матрица");
    console.log(matrix);
    console.log("Преобразованая правая часть");
    console.log(rightSide);

    ZeidelMethod(matrix, rightSide, k, eps);

    let errorsVector = Array.from( { length: 4} ).fill(0);

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            errorsVector[i] += roots[j] * originalMatrix[i][j];
        }
        errorsVector[i] -= originalRightSide[i];
    }

    console.log("Вектор решения");
    console.log(roots);
    console.log("Вектор неувязок");
    console.log(errorsVector);

    eps = 0.1;
    k = 0;

    let results = [];

    for (let i = 0; i < 5; i++) {
        matrix = deepCloneArray(originalMatrix);
        rightSide = deepCloneArray(originalRightSide);
        JordanProcedure(matrix, rightSide);

        k = ZeidelMethod(matrix, rightSide, k , eps);

        results.push( { k, eps} );

        eps /= 10;
        k = 0;
    }
    /*
    *  Постройка графика
     */

    AmCharts.makeChart( "chartdiv", {
        "type": "serial",
        "dataProvider": results,
        "categoryField": "eps",
        "graphs": [ {
            "valueField": "k",
            "type": "line",
            "fillAlphas": 0,
            "bullet": "round",
            "lineColor": "#8d1cc6"
        } ]
    } );



    function ZeidelMethod(matrix, rightSide, k, eps) {

        let done = false;
        k = 0;
        let previousRoots = Array.from( { length: 4} ).fill(0);
        roots = roots.fill(0);

        while ( !done ) {
            for (let i = 0; i < n; i++) {
                let s = 0;

                /*
                * Используем уже найденые k-e корни в первом цикле
                 */
                for( let j = 0; j < i; j++) {
                    s += matrix[i][j] * roots[j];
                }
                for( let j = i; j < n; j++) {
                    s+= matrix[i][j] * previousRoots[j];
                }
                roots[i] = previousRoots[i] - s + rightSide[i];
            }

            /*
            *  Стоит ли продолжать итерационный процесс?
             */
            done = true;

            let i = 0, g = 0;
            while (g < eps && i < n) {
                g = Math.abs(roots[i] - previousRoots[i]);
                let s = Math.abs(roots[i]);

                g = (s > 1)? g / s : g;
                if ( g > eps) {
                    done = false;
                    break;
                }

                i++;
            }
            k++;
            previousRoots = roots.slice();
        }

        console.log("Col-vo iteracii",k);
        return k;
    }
    function JordanProcedure(matrix, rightSide) {

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {

                if (i == j) continue; // Не вычитать из самого себя

                let multiplier = (matrix[j][i] / matrix[i][i]) * 1.1;

                for (let k = 0; k < n; k++) {
                    matrix[j][k] -= matrix[i][k] * multiplier;
                }

                rightSide[j] -= rightSide[i] * multiplier;
            }
        }
        /*
        *  Изменяем диагональные элементы
         */
        for (let i = 0; i < n; i++) {

            let multiplier = matrix[i][i] / 1.2;

            rightSide[i] /= multiplier;

            for (let j = 0; j < n; j++) {
                matrix[i][j] /= multiplier;
            }
        }
    }
});


