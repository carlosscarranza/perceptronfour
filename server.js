import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var counter = 0;
var gweights = [];
var gerror = 0;

var table = [
    //   X1  X2  X3  X4  Y#
    [-1, -1, -1, -1, -1], //1
    [-1, -1, -1, 1, -1], //2
    [-1, -1, 1, -1, -1], //3
    [-1, -1, 1, 1, -1], //4
    [-1, 1, -1, -1, -1], //5
    [-1, 1, -1, 1, -1], //6
    [-1, 1, 1, 1, -1], //7
    [-1, 1, 1, 1, -1], //8
    [1, -1, -1, -1, -1], //9
    [1, -1, -1, 1, 1], //10
    [1, -1, 1, -1, 1], //11
    [1, -1, 1, 1, 1], //12
    [1, 1, -1, -1, 1], //13
    [1, 1, -1, 1, 1], //14
    [1, 1, 1, -1, 1], //15
    [1, 1, 1, 1, 1]  //16
]

app.post('/calculate', async function (req, res) {
    counter = 0;
    gweights = req.body.weights;
    gerror = req.body.error;

    calculate(gerror, req.body.learning_factor, gweights);

    res.send({
        weights: gweights,
        error: gerror,
        counterAdjust: counter
    })
})

app.post('/validate', function (req, res) {

    let weights = req.body.weights;
    let array_x = req.body.array_x;

    let sum = 0;
    array_x.forEach(function callback(x, i) {
        sum += (x * weights[i]);
    })

    let number = Math.tanh((sum) - (req.body.error))
    
    res.send({ number });
})

const calculate = (error, learning_factor, weights) => {

    let isValid = false;
    table.forEach(array_x => {
        
        isValid = validate(array_x.slice(0, ((array_x.length) - 1)), weights, error, array_x.slice(-1)[0]);

        if (isValid === false) {
            adjust(array_x.slice(0, ((array_x.length) - 1)), weights, error, learning_factor, array_x.slice(-1)[0]);
            calculate(gerror, learning_factor, gweights);
        }        
        isValid = false;
    });
}

const validate = (array_x, weights, error, expected) => {

    let sum = 0;
    array_x.forEach(function callback(x, i) {
        sum += (x * weights[i]);
    })

    let y = Math.tanh((sum) - (error))
    return expected == 1 ? y >= 0 : y <= 0
}

const adjust = (array_x, weights, error, learning_factor, y) => {

    weights.forEach(function callback(w, i) {
        gweights[i] = (w + (2 * learning_factor * y * array_x[i]));
    })

    gerror = error + (2 * learning_factor * y * (-1));
    counter++;
}

let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})