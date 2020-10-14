"use strict";
// ゲームの流れ
// 0:初期化 → 1へ
// 1:箱を開ける(開けた箱の判定をしながら) → 2へ
// 2:箱を開ける(開けた箱の判定をしながら) → 3へ
// 3:箱を開ける(開けた箱の判定をしながら) → 4へ
// 4:図柄一致判定 → 合致なら5へ、不一致なら6へ
// 5:合致後の処理 → 1へ
// 6:箱を隠す → 1へ
// 条件を満たしたら7or8へ
// 7:タイムアップ
// 8:ゲームクリア

var game_initialize = function() {

  // テーブルの初期化
  var game_table = document.getElementById("game_table");
  while (game_table.firstChild) {
    game_table.removeChild(game_table.firstChild);
  };
  // 登場人物のメッセージ格納タグを取得
  var sick_messages = document.getElementsByClassName("sick_messages");
  var default_sick_messages = ["＼喉が痛いヨォ／","＼頭が痛くって／","＼吐き気がします／",
  "＼咳が止まりません／","＼お腹が痛いんじゃ／","＼syntax error／"];
  for ( var i =0; i<sick_messages.length; i++) {
    sick_messages[i].innerHTML = default_sick_messages[i];
  }
  // 登場人物の画像ファイル格納タグを取得
  var sick_characters = document.getElementsByClassName("sick_characters");
  var sick_boy = "sick_boy.png";
  var sick_girl = "sick_girl.png";
  var sick_man = "sick_man.png";
  var sick_woman = "sick_woman.png";
  var sick_old_man = "sick_old_man.png";
  var sick_computer = "sick_computer.png";
  var default_sick_characters = [sick_boy,sick_girl,sick_man,sick_woman,sick_old_man,sick_computer];
  for ( var j=0; j<sick_characters.length; j++) {
    sick_characters[j].src = default_sick_characters[j];
  }

  // カウントダウンタイマー
  var timer = document.getElementsByClassName("timer");
  var timer_setting = 60; // 秒で設定
  var count_time = timer_setting * 100; // 桁調整
  var time_goes_by = setInterval(function() { // 10ミリ秒毎に発火する関数
    count_time -= 1; // 制限時間から10ミリ秒毎に1ずつ引かれていく
    var second = Math.floor(count_time / 100);
    if (second < 10) {
      second = "0" + second;
    }
    var millisecond = count_time % 100;
    if (millisecond < 10) {
      millisecond = "0" + millisecond;
    }
    timer[0].innerHTML = (second + ":" + millisecond);
    if(count_time <= 0) { // 制限時間に到達、もしくは制限時間を過ぎたら
      clearInterval(time_goes_by); // 時間経過を表現する関数を止める
      alert("女神" + "\n" + "「おぉ、なんということでしょう。" + "\n" + "時間内に薬を届けられなかったのですね。" + "\n" + 
      "まだ勇気があるならば、もう一度挑戦するのです。」");
      console.log("バイツァ・ダスト！");
      game_initialize();
    }
  },10);

  // 時間停止 = 図柄が不一致だった時すぐに隠さないような処理
  var wait = function() {
    return function() {
      return new Promise(function(resolve/*, reject*/) {
        setTimeout(resolve, 1000) // 1000ミリ秒待つ
      });
    };
  };

  // 升目
  var fit = 3 * 2; // 揃える図柄数(3)を適正化
  var serial_number = -1; // 通し番号
  var game_table = document.getElementById("game_table");
  for ( var i = 0; i < fit; i++) {
    var tr_tag = document.createElement("tr");
    for ( var j = 0; j < fit; j++) {
      var td_tag = document.createElement("td");
      serial_number += 1;
      td_tag.setAttribute('id',serial_number); // 0から始まる通し番号付与
      tr_tag.appendChild(td_tag);
    }
    game_table.appendChild(tr_tag);
  }
  var td_tags = document.querySelectorAll("td");

  // リサイズ値を設定
  var resize = 50;

  // 画像のパスを宣言
  var question = "question.png";
  var red = "red.png";
  var vermilion = "vermilion.png";
  var orange = "orange.png";
  var yellow = "yellow.png";
  var light_blue = "light_blue.png";
  var green = "green.png"
  var fine_boy = "fine_boy.png";
  var fine_girl = "fine_girl.png";
  var fine_man = "fine_man.png";
  var fine_woman = "fine_woman.png";
  var fine_old_man = "fine_old_man.png";
  var fine_computer = "fine_computer.png";

  // 全ての?画像をtdに格納
  for ( var i = 0; i < fit ** 2; i++) {
    var placed_image = document.createElement("img");
    placed_image.setAttribute('class',"placed_image");
    placed_image.src = question; // ?が初期配置
    placed_image.width = resize; // リサイズ
    placed_image.height = resize; // リサイズ
    td_tags[i].appendChild(placed_image);
  }
  var placed_images = document.getElementsByClassName("placed_image");

  // 全ての色を配列(color_pallete)に格納
  var color_pallete = [];
  for ( var i = 0; i < fit; i++) {
    color_pallete.push(red,vermilion,orange,yellow,light_blue,green);
  }
  // 全ての色をランダム化して配置
  const shuffle = ([...color_pallete]) => {
    for ( var i = color_pallete.length - 1; i >= 0; i--) {
      var j = Math.floor(Math.random() * ( i + 1 ));
      [color_pallete[i],color_pallete[j]] = [color_pallete[j],color_pallete[i]];
    }
    return color_pallete;
  }
  color_pallete = shuffle(color_pallete);
  for ( var j = 0; j < fit ** 2; j++) {
    var color_image = document.createElement("img");
    color_image.src = color_pallete[j];
    color_image.width = resize; // リサイズ
    color_image.height = resize; // リサイズ
    td_tags[j].appendChild(color_image);
  }

  // 登場人物の回復後の画像とメッセージを配列に格納
  var fine_messages = ["＼もう大丈夫だヨ！／","＼漲ってきた〜！／","＼元気が出ました！／",
  "＼買い物行こっと！／","＼わしゃまだ死ねん／","＼ok google.hey siri.／"];
  var fine_characters = [fine_boy,fine_girl,fine_man,fine_woman,fine_old_man,fine_computer];

  // 開けた箱の通し番号を格納する配列
  var opened_cards_list = [];

  // 揃った図柄のidを格納する配列 = もう開けられない箱のidリスト
  var matched_ids = [];

  // ターン設定
  var turn = 1;

  // クリックしたら箱を開ける処理
  var flip_the_card = function (element) {
    if (turn == 5) {
      console.log("箱を開ける関数を開始しました"); // デバッグ
      opened_cards_list = [];
      console.log("(通し番号を格納する)配列を初期化しました"); // デバッグ
      console.log(opened_cards_list);
      turn = 1;
      console.log("ターン数を初期化しました");
      console.log(turn);
    };
    // 既に図柄が合致した箱はもう開けられない
    var choiced_card = element.target.parentNode;
    for (var i=0; i<matched_ids.length; i++) {
      if (choiced_card.id == matched_ids[i]) {
        var wrong = document.getElementById("wrong");
        wrong.currentTime = 0;
        wrong.play(); // 不正解音
        console.log("そこの箱はもう開けられません"); // デバッグ
        return;
      };
    };
    // 同一通し番号は開けられない = 同一通し番号でなければ開ける = 同じ箱を二度クリックしても無効
    if (turn == 3) {
      if (opened_cards_list[0] == choiced_card.id || opened_cards_list[1] == choiced_card.id) {
        var wrong = document.getElementById("wrong");
        wrong.currentTime = 0;
        wrong.play(); // 不正解音
        console.log("3回目の箱開けで失敗しました"); // デバッグ
      } else {
        console.log("3回目の箱開けが成功しました"); // デバッグ
        placed_images[choiced_card.id].src = color_pallete[choiced_card.id];
        opened_cards_list.push(choiced_card.id); // 通し番号を配列に格納 3回目
        turn += 1;
        console.log(opened_cards_list); // デバッグ
        console.log("箱を開ける関数が終わりました"); // デバッグ
        image_match_check(turn,opened_cards_list) // 引数を持って次の関数に移動
      };
    };
    if (turn == 2) {
      if (opened_cards_list[0] == choiced_card.id) {
        var wrong = document.getElementById("wrong");
        wrong.currentTime = 0;
        wrong.play(); // 不正解音
        console.log("2回目の箱開けで失敗しました"); // デバッグ
      } else {
        console.log("2回目の箱開けが成功しました"); // デバッグ
        placed_images[choiced_card.id].src = color_pallete[choiced_card.id];
        opened_cards_list.push(choiced_card.id); // 通し番号を配列に格納 2回目
        turn += 1;
        console.log(opened_cards_list); // デバッグ
      };
    };
    if (turn == 1) {
      if (opened_cards_list.length == 0) {
        console.log("1回目の箱開けが成功しました"); // デバッグ
        placed_images[choiced_card.id].src = color_pallete[choiced_card.id];
        opened_cards_list.push(choiced_card.id); // 通し番号を配列に格納 1回目
        turn += 1
        console.log(opened_cards_list); // デバッグ
      };
    };
  };

  // 図柄が一致するか判定する処理
  var image_match_check = function (turn,opened_cards_list) {
    if (color_pallete[opened_cards_list[0]] == color_pallete[opened_cards_list[1]] &&
      color_pallete[opened_cards_list[1]] == color_pallete[opened_cards_list[2]]) {
      console.log("図柄判定関数を発火しまして、図柄は一致しました"); // デバッグ
      var correct = document.getElementById("correct");
      correct.currentTime = 0;
      correct.play(); // 正解音
      stay_opened(turn,opened_cards_list); // 引数を持って次の関数に移動
    } else {
      console.log("図柄判定関数を発火しましたが、図柄は一致しませんでした"); // デバッグ
      var wrong = document.getElementById("wrong");
      wrong.currentTime = 0;
      wrong.play(); // 不正解音
      reverse_the_card(turn,opened_cards_list); // 引数を持って次の関数に移動
    };
  };

  // 合致した図柄はそのままにする処理
  var stay_opened = function (turn,opened_cards_list) {
    for (var i=0; i<opened_cards_list.length; i++) {
      matched_ids.push(opened_cards_list[i]);
    };
    console.log("図柄はそのままにする関数を発火しました"); // デバッグ
    number_clear(turn,opened_cards_list);
  };

  // はずれ図柄を隠す処理
  var reverse_the_card = function (turn,opened_cards_list) {
    console.log("ザ・ワールド！時よ止まれ！"); // デバッグ
    Promise.resolve()
      .then(wait())
      .then(function() {
      for ( var i=0; i<opened_cards_list.length; i++) {
        placed_images[opened_cards_list[i]].src = question;
      };
      console.log("時は動き出す！"); // デバッグ
      number_clear(turn,opened_cards_list);
    });
    console.log("図柄を隠す関数発火しました"); // デバッグ
  };

  // ゲームクリアもしくはゲーム続行を判定する処理
  var number_clear = function () {
    turn += 1;
    console.log("揃った図柄の数は"+`${matched_ids.length}`+"個です") // デバッグ
    if (matched_ids.length % 6 == 0) { // 6図柄集めるごとに1人回復
      recover(matched_ids);
    };
    if (matched_ids.length == 36) { // 36図柄集めたらゲームクリア
      clearInterval(time_goes_by); // 時間経過を表現する関数を止める
      alert("女神「よく頑張りましたね、" + "\n" + "しかしまだ他にも苦しんでいるもの達はたくさんいます。" + "\n" + 
      "次の場所へ旅立つのです！"); // デバッグ
    };
    for (var i=0; i < td_tags.length; i++) {
      td_tags[i].addEventListener('click', flip_the_card, false); // 全てのtdをクリックした時に発火する
    };  
  };

  var recover = function (matched_ids) {
    for (var i=0; i<matched_ids.length/6;i++) {
      console.log(`${matched_ids.length/6}` + "人の状態が回復しました");
      sick_messages[matched_ids.length/6-1].innerHTML = fine_messages[matched_ids.length/6-1]
      sick_characters[matched_ids.length/6-1].src = fine_characters[matched_ids.length/6-1]
    }
    return;
  };

  console.log("箱を開ける関数を開始できます"); // デバッグ
  for (var i=0; i < td_tags.length; i++) {
    td_tags[i].addEventListener('click', flip_the_card, false); // 全てのtdをクリックした時に発火する
  };

};

var timer_frame = document.getElementsByClassName("timer_frame");
timer_frame[0].addEventListener('click', game_initialize, false); // ゲームスタートもしくはコンティニューする関数
