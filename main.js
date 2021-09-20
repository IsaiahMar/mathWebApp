let easyBtn = document.getElementById("easy");
let mediumBtn = document.getElementById("medium");
let hardBtn = document.getElementById("hard");
let problem = document.getElementById("problem");
let modeSelected = false;
var points = 0;
var answer;
var qMode = "";

//this function is so it's easier to convert to react later on
const displayInfo = (name, hasLinkedIn, hasGithub, linkedInLink, githubLink) => {
    let div = document.createElement("div");
    let nameH3 = document.createElement("h3");
    nameH3.innerText = name;
    if (hasGithub) {
        let miniDiv = document.createElement('div');
        let a = document.createElement("a");
        let img = document.createElement("img");
        img.src = "media/github logo.png"
        img.addEventListener("mouseover", (e) => {
            e.preventDefault();
            img.src = "media/github logo hover.png";
            setTimeout(() => {
                img.src = "media/github logo.png";
            }, 500);
        })
        a.href = githubLink;
        a.append(img);
        miniDiv.append(a);
        div.append(miniDiv)
    }
    if (hasLinkedIn) {
        let miniDiv = document.createElement('div');
        let a = document.createElement("a");
        let img = document.createElement("img");
        img.src = "media/linkedIn logo.png";
        img.style.width="70px";
        a.href = linkedInLink;
        a.append(img);
        miniDiv.append(a);
        div.append(miniDiv)
    }
    div.prepend(nameH3);
    document.getElementById("about").appendChild(div);
}

displayInfo("Bryan", true, true, "https://linkedin.com/in/bryang229", "https://github.com/bryang229");
displayInfo("Isaiah", false, true, "", "https://github.com/IsaiahMar");
displayInfo("David ", false, true, "", "https://github.com/David800888");
displayInfo("Josiah", false, false, "", "");




const hideNavBtns = (id) => {
    //this uses tenary to change the mode selected to the opposite so false -> true and vice versa
    modeSelected = modeSelected ? false : true;
    if (modeSelected) {
        let lazyArr = ["easy", "medium", "hard"];
        for (let i = 0; i < lazyArr.length; i++) {
            if (lazyArr[i] != id)
                document.getElementById(lazyArr[i]).style.display = "none";
        }
    } else {
        let lazyArr = ["easy", "medium", "hard"];
        for (let i = 0; i < lazyArr.length; i++) {
            if (lazyArr[i] != id)
                document.getElementById(lazyArr[i]).style.display = "";
        }
    }
    transitionPage(id);
}


const transitionPage = (mode) => {
    if (modeSelected) {
        let lazyArr = document.querySelectorAll(".homePage");
        let diffText = document.getElementById("diffText")
        for (let i = 0; i < lazyArr.length; i++) {
            lazyArr[i].style.display = "none";
        }
        diffText.innerText = `Difficulty chosen: ${mode}`;
        makeQLayout(mode);
        qMode = mode;
    } else {
        let lazyArr = document.querySelectorAll(".homePage");
        let diffText = document.getElementById("diffText")
        let qElement = document.getElementById("question");
        qElement.remove()
        document.getElementById("response").remove();
        document.getElementById("qForm").remove()
        for (let i = 0; i < lazyArr.length; i++) {
            lazyArr[i].style.display = "";
        }
        diffText.innerText = "";
    }
}


const makeQLayout = (mode) => {
    let form = document.createElement('form');
    let label = document.createElement('label');
    let answerInput = document.createElement("input");
    let response = document.createElement('h1');
    let btn = document.createElement("input");
    let question = document.createElement("h2");
    let lazyArr = [label, answerInput, btn];
    answerInput.onsubmit = ((e) => {
        e.preventDefault();
        return false;
    });
    response.id = "response";
    form.id = 'qForm';
    btn.id = "submit";
    btn.value = "Submit";
    answerInput.id = "answer";
    label.for = "answer";
    label.innerText = "Enter answer here:";
    btn.type = "button"
    question.id = "question";

    btn.addEventListener('click', checkAnswer)

    for (let i = 0; i < lazyArr.length; i++) {
        form.append(lazyArr[i]);
    }

    problem.appendChild(response);
    problem.appendChild(question);
    problem.appendChild(form);
    if (mode == "easy") {
        easyMode();
    } else if (mode == "medium") {
        mediumMode();
    } else if (mode == "hard") {
        hardMode();
    }
}

const getSimpleAnswer = (a, b, operand) => {
    if (operand == 1)
        return a + b;
    else if (operand == 2)
        return a - b;
    else if (operand == 3)
        return a * b;
}

const easyMode = () => {
    let qElement = document.getElementById("question");
    let a = Math.floor(Math.random() * 50) - 24;
    let b = Math.floor(Math.random() * 20) - 1;
    //KEY: 1:+ 2:- 3:*
    let operand = Math.floor(Math.random() * 3) + 1;
    console.log(operand)
    qElement.innerText = `${a} ${decodeOperand(operand)} ${b} = ?`;
    answer = getSimpleAnswer(a, b, operand);
}

function decodeOperand(operand) {
    if (operand == 1)
        return "+"
    else if (operand == 2)
        return "-"
    else if (operand == 3)
        return "*"
}

const mediumMode = () => {

    console.log("Hey")
    let qElement = document.getElementById("question");
    let a = Math.floor(Math.random() * 50) - 24;
    let b = Math.floor(Math.random() * 50) - 24;
    let c = Math.floor(Math.random() * 50) - 24;
    let sumA = 0;
    let sumB = 0;
    //KEY: 1:+ 2:- 3:*
    let operand = Math.floor(Math.random() * 3) + 1;
    let operand2 = Math.floor(Math.random() * 3) + 1;
    console.log(a, b, c, operand, operand2)
    if (operand == 3 && operand2 == 3) {
        sumA = getSimpleAnswer(a, b, 3);
        sumB = getSimpleAnswer(sumA, c, 3);
    } else if (operand != 3 && operand2 == 3) {
        sumA = getSimpleAnswer(b, c, 3);
        sumB = getSimpleAnswer(a, sumB, operand);
    } else if (operand == 3 && operand2 != 3) {
        sumA = getSimpleAnswer(a, b, 3);
        sumB = getSimpleAnswer(sumA, c, operand2);
    } else {
        sumA = getSimpleAnswer(a, b, operand);
        sumB = getSimpleAnswer(sumA, c, operand2);
    }
    answer = sumB;

    qElement.innerText = `${a} ${decodeOperand(operand)} ${b} ${decodeOperand(operand2)} ${c}`;


}

const hardMode = () => {
    let qElement = document.getElementById("question");
    let a = Math.floor(Math.random() * 50) - 24;
    let b = Math.floor(Math.random() * 50) - 24;
    let c = Math.floor(Math.random() * 50) - 24;
    let d = Math.floor(Math.random() * 50) - 24;
    let sumA = 0;
    let sumB = 0;
    let sumC = 0;
    //KEY: 1:+ 2:- 3:*
    let operand = Math.floor(Math.random() * 3) + 1;
    let operand2 = Math.floor(Math.random() * 3) + 1;
    let operand3 = Math.floor(Math.random() * 3) + 1;

    //this checks for * to make sure pemdas works

    if (operand == 3 && operand2 == 3 && operand3 == 3) {
        sumA = getSimpleAnswer(a, b, 3);
        sumB = getSimpleAnswer(sumA, c, 3);
        sumC = getSimpleAnswer(sumB, d, 3);
        console.log(3, 3, 3)
    } else if (operand == 3 && operand2 == 3 && operand3 != 3) {
        sumA = getSimpleAnswer(a, b, 3);
        sumB = getSimpleAnswer(sumA, c, 3);
        sumC = getSimpleAnswer(sumB, d, operand3);
        console.log(3, 3, 0)
    } else if (operand == 3 && operand2 != 3 && operand3 == 3) {
        sumA = getSimpleAnswer(a, b, 3);
        sumB = getSimpleAnswer(c, d, 3);
        sumC = getSimpleAnswer(sumA, sumB);
        console.log(3, 0, 3)
    } else if (operand != 3 && operand2 == 3 & operand3 == 3) {
        sumA = getSimpleAnswer(b, c, 3);
        sumB = getSimpleAnswer(sumA, d, 3);
        sumC = getSimpleAnswer(a, sumB, operand);
        console.log(0, 3, 3)
    } else if (operand == 3 && operand2 != 3 && operand3 != 3) {
        sumA = getSimpleAnswer(a, b, 3);
        sumB = getSimpleAnswer(sumA, c, operand2);
        sumC = getSimpleAnswer(sumB, d, operand3);
        console.log(3, 0, 0);
    } else if (operand != 3 && operand2 == 3 && operand3 != 3) {
        sumA = getSimpleAnswer(b, c, 3);
        sumB = getSimpleAnswer(a,sumA , operand);
        sumC = getSimpleAnswer(sumB, d, operand3);
        console.log(0, 3, 0)
    } else if (operand != 3 && operand2 != 3 && operand3 == 3) {
        sumA = getSimpleAnswer(c, d, 3);
        sumB = getSimpleAnswer(a, b, operand);
        sumC = getSimpleAnswer(sumB, sumA, operand2);
        console.log(0, 0, 3);
    } else {
        sumA = getSimpleAnswer(a, b, operand);
        sumB = getSimpleAnswer(sumA, c, operand2);
        sumC = getSimpleAnswer(sumB, d, operand3);
        console.log(0, 0, 0);
    }
    console.log(a, b, c, d, operand, operand2, operand3)
    answer = sumC

    qElement.innerText = `${a} ${decodeOperand(operand)} ${b} ${decodeOperand(operand2)} ${c} ${decodeOperand(operand3)} ${d} = ?`;

}



const showNextQuestion = () => {
    document.getElementById("response").remove();
    document.getElementById("newBtn").remove();
    document.getElementById("qForm").remove();

    makeQLayout(qMode)


}

const displayNextBtn = (mode) => {
    let nextQuestionBtn = document.createElement("button");
    nextQuestionBtn.innerText = "Next Question";
    nextQuestionBtn.style.marginLeft = '45%';
    nextQuestionBtn.id = "newBtn";
    nextQuestionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showNextQuestion(mode);
    })
    document.querySelector("main").appendChild(nextQuestionBtn);
}



const checkAnswer = (e) => {
    e.preventDefault();
    let userAnswer = parseInt(document.getElementById("answer").value);
    let response = document.getElementById("response");
    if (userAnswer == answer) {
        points++;
        response.innerText = "GOOD JOB";
        displayNextBtn()
        points++;

    } else {
        response.innerText = 'TRY AGAIN... YOU GOT THIS!';
        points--;
    }
}




easyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    hideNavBtns(easyBtn.id)
    if (easy.innerText == "Easy") {
        easy.innerText = "Go back"
    } else if (easy.innerText == "Go back") {
        easy.innerText = "Easy"
    }
});

mediumBtn.addEventListener('click', (e) => {
    e.preventDefault();
    hideNavBtns(mediumBtn.id)
    if (medium.innerText == "Medium") {
        medium.innerText = "Go back"
    } else if (medium.innerText == "Go back") {
        medium.innerText = "Medium"
    }

});

hardBtn.addEventListener('click', (e) => {
    e.preventDefault();
    hideNavBtns(hardBtn.id)
    if (hard.innerText == "Hard") {
        hard.innerText = "Go back"
    } else if (hard.innerText == "Go back") {
        hard.innerText = "Hard"
    }
});