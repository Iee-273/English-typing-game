$(document).ready(function() {
    //define
    let lastQuestion;
    let incorrectCount; // 間違えた回数をカウントする変数
    let lifePoints; // ライフポイントの初期値
    let gameActive; // ゲームの状態を管理するフラグ
    let score; // スコア
    let incorrectQuestions = []; // 間違えた問題を格納する配列
    let animationTimeOut; // アニメーションのタイムアウトを管理する変数
    var selectedGroup; // 選択されたグループ
    let userHistoryAnswers = []; // ユーザーの回答履歴を格納する配列
    let detailedResultsHtml = "<ul>";
    let animationCallCount = 0;
    let remaining;
    let interval; // タイマーのインターバルを管理する変数
    $("#gameDiscription").hide();
    $(".firstPage").hide();
    $(".secondPage").hide();
    // ボタンにクラスを追加
    $("#clothingButton, #foodButton, #animalButton").addClass("button");
    // ボタン内の要素にクラスを追加
    $(".button").wrapInner("<div><span></span></div>");

    $("#StartButton").off("click").on("click", function()  {//start button click event
        //reset
        incorrectCount = 0;
        lifePoints = 3;
        score = 0;
        $("#lifePoints").text(lifePoints);
        gameActive = false;
        incorrectQuestions = [];
        userHistoryAnswers = [];
        //animation reset
        clearTimeout(animationTimeOut);
        $("#questionImage").stop(true, true).hide();
        $("#answerDisplay").stop(true, true).hide();
        //answer input enmpty
        $("#answerInput").val("");
        //screen transition
        $("#title").hide();
        $("#selectScreen").show();
        
        $("#clothingButton, #foodButton, #animalButton").off("click").on("click", function() {// select screen button event
            selectedGroup = $(this).data("group");// this、element of clicked button
            $("#selectScreen").hide();
            $("#prepareScreen").show();

            $("#yesButton").off("click").on("click", function() {
                $("#prepareScreen").hide();
                $("#gameScreen").show();
                // 質問を表示
                $("#answerDisplay").stop(true, true).hide();
                $("#answerInput").focus();//!!!
                displayRandomQuestion(selectedGroup);
                // 10秒のタイマーをセット
                startTimer(10);

            });
            

            $("#backButton").off("click").on("click", function() { //back to select screen button
                $("#prepareScreen").hide();
                $("#selectScreen").show();
            });
        });
        //Back to title button event
        $("#backToTitleButton").off("click").on("click", function() {//error
            // stop animation
            //$("#questionImage").stop(true, true);
            //$("#answerDisplay").stop(true, true);
            // screen transition
            $("#resultScreen").hide();
            $("#title").show();
        });

        // Detail button click event
        $("#detailButton").off("click").on("click", function() {
            // detailedResultsHtmlを初期化
            let detailedResultsHtml = "<ul>";
            userHistoryAnswers.forEach(function(answer, index) {
                const symbol = answer.userAnswer === answer.correctAnswer ? '💮' : '✘';
                detailedResultsHtml += `<li>Q ${index + 1} ${symbol}: Your Answer - ${answer.userAnswer}, Correct Answer - ${answer.correctAnswer}</li>`;
            });
            detailedResultsHtml += "</ul>";
            $("#detailedResults").html(detailedResultsHtml);
            $("#resultScreen").hide();
            $("#detailScreen").show();
        });

        $("#closeButton").off("click").on("click", function() {
            $("#detailScreen").hide();
            $("#resultScreen").show();
        });
        
    });

    $(".faq-button").click(function() {
        $("#title").hide();
        $("#gameDiscription").show();
        $(".firstPage").show();
    });

    // 1ページ目の次へボタン
    $("#firstPageNext").click(function() {
        $(".firstPage").hide();
        $(".secondPage").show();
    });

    // タイトルへ戻るボタン
    $("#backToStartScreen").click(function() {
        $(".secondPage").hide();
        $("#gameDiscription").hide();
        $("#title").show();
    });

    
    function displayRandomQuestion(group) {
        const groupQuestions = questions[group];
        let randomIndex, question;

        //同じ問題連続重複回避
        do {
            randomIndex = Math.floor(Math.random() * groupQuestions.length);
            question = groupQuestions[randomIndex];
        } while (lastQuestion === question);

        lastQuestion = question;
    
        // image animation
        $("#questionImage").attr("src", question.image).fadeIn(100);
        gameActive = true;
        $("#answerDisplay").text(question.name).show("slide", { direction: "right" }, 15000);
        animationCallCount = 0;
        animateRandomly($("#questionImage"));
    
        $("#answerInput").off("keydown").on("keydown", function(event) {
            if (event.key === "Enter") {
                checkAnswer(question);
            }
        });
    }
    

    function animateRandomly(element) {
        if (!gameActive) return;
    
        // Increment animation call count (defined in displayRandomQuestion)
        animationCallCount++;
    
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        var newLeft = Math.floor(Math.random() * windowWidth - 50);
        var newTop = Math.floor(Math.random() * windowHeight - 50);
    
        element.animate({
            left: newLeft,
            top: newTop
        }, 1000, function() {
            if (!gameActive) {
                $("#questionImage").stop(true, true);
                $("#answerDisplay").stop(true, true).hide();
                return;
            }
    
            if (animationCallCount >= 10) {
                endGame();
            } else {
                animateRandomly(element);
            }
        });
    }

    function checkAnswer(question) {
        var userAnswer = $("#answerInput").val().trim().toLowerCase();//arrenge the answer
        var correctAnswer = question.name.toLowerCase();

        userHistoryAnswers.push({ userAnswer: userAnswer, correctAnswer: correctAnswer });
    
        if (userAnswer === correctAnswer) {
            // 正解の場合の処理
            score++;
            $("#answerInput").val("");
            $("#score").text(score);
            $("#correctScreen").show();
            setTimeout(function() {
                $("#correctScreen").hide();
            }, 500);
            $("#resultText").css("color", "green");//here should add the same prosess as inCorrectScreen
            // 次の問題を表示するなどの処理
            if (gameActive) {
                clearTimeout(animationTimeOut);
                $("#answerDisplay").stop(true, true).hide();
                clearInterval(interval); // 前のタイマーをクリア
                displayRandomQuestion(selectedGroup);
                startTimer(10); // 新しいタイマーを開始
            }
        } else {
            // 不正解の場合の処理
            lifePoints--;
            $("#answerInput").val("");
            $("#lifePoints").text(lifePoints);
            $("#inCorrectScreen").show();
            setTimeout(function() {
                $("#inCorrectScreen").hide();
            }, 500);//最後に不正解した場合はresultScreen
            if (lifePoints === 0) {//if incorrect count is more than max incorrect count, end game
                $("#inCorrectScreen").hide();
                endGame();
            }
        }
        
    }

    function startTimer(seconds) {
        remaining = seconds;
        $("#seconds").text(remaining); // 初期値を表示
        interval = setInterval(() => {
            remaining--;
            $("#seconds").text(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 1000);
    }
    function endGame() {
        gameActive = false;
        clearInterval(interval);
        $("#gameScreen").hide();
        $("#resultScreen").show();
        $("#resultText").text("Your score is "+score+"!");
        $("#score").text(0);
        //すべてのシステムをリセット
    }

    function resetGame() {
        $("#resultScreen").hide();
        $("#correctScreen").hide();
        $("#inCorrectScree").hide();
        $("#gameScreen").hide();
        $("#answerInput").val("");
        $("#title").show();
    }
});