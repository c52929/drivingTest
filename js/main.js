'use strict';

let mode;
let time;
let qNum,outOf;
let r;
let qSet;
let qToGo,retry;
let btnPhase=-1;

// 開始
const startBtns=document.getElementsByClassName("startBtn");
for(let i=0; i<2; i++){
	startBtns[i].addEventListener("click",()=>{
		mode=i;
		document.getElementById("title").classList.add("none");
		document.getElementById("startOption").classList.add("none");
		document.getElementById("questionArea").classList.remove("none");
		startQuiz(i);
	})
}

function startQuiz(){
	qToGo=[];
	for(let i=0; i<questions[mode].length; i++){
		qToGo.push(i);
	}
	retry=[];
	time=0;
	outOf=qToGo.length;
	qNum=0;
	newQ();
}

function newQ(){
	document.getElementById("qNum").textContent=`${["","Retry "][time]}Q.${++qNum}/${outOf}`;
	// 選択肢ボタンをリセット
	btnPhase=0;
	let btns=document.getElementsByClassName("ansBtn");
	for(let i=0; i<2; i++){
		btns[i].classList.remove("correct");
		btns[i].classList.remove("wrong");
		btns[i].classList.remove("wasCorrect");
		btns[i].classList.remove("notCorrect");
	}
	document.getElementById("explanation").classList.add("none");
	document.getElementById("nextQuestion").classList.add("none");
	// 問題を出す
	r=[Math.floor(Math.random()*qToGo.length)];
	r.push(qToGo[r[0]]);
	qSet=questions[mode][r[1]];
	qToGo.splice(r[0],1);
	document.getElementById("question").innerHTML=separateImg(qSet[0]);
}

let btns=document.getElementsByClassName("ansBtn");
for(let i=0; i<2; i++){
	btns[i].addEventListener("click",()=>{
		btnPushed(i);
	})
}

document.addEventListener("keydown",(e)=>{
	let keyIdx=['t','f','o','x'].indexOf(e.key);
	if(keyIdx>=0){
		btnPushed(keyIdx%2);
	}else if(e.key=="Enter" && btnPhase==1){
		nextQ();
	}
})

function btnPushed(ans){
	if(btnPhase==0){
		btnPhase++;
		if(qSet[1]==['o','x'][ans]){
			// correct
			btns[ans].classList.add("correct");
			btns[1-ans].classList.add("notCorrect");
		}else{
			// wrong
			btns[ans].classList.add("wrong");
			btns[1-ans].classList.add("wasCorrect");
			retry.push(r[1]);
		}
		document.getElementById("explanation").innerHTML=separateImg(qSet[2]);
		document.getElementById("explanation").classList.remove("none");
		document.getElementById("nextQuestion").classList.remove("none");
	}
}

document.getElementById("nextQuestion").addEventListener("click",()=>{
	nextQ();
})

function nextQ(){
	if(qToGo.length>0){
		newQ();
	}else if(retry.length>0){
		time=1;
		qToGo=retry;
		retry=[];
		outOf=qToGo.length;
		qNum=0;
		newQ();
	}else{
		// back home
		document.getElementById("nextQuestion").classList.add("none");
		document.getElementById("title").classList.remove("none");
		document.getElementById("startOption").classList.remove("none");
		document.getElementById("questionArea").classList.add("none");
	}
}

function separateImg(s0){
	let s="";
	let img;
	if(s0.charAt(0)!='$'){
		s="<p>";
	}
	for(let i=0; i<s0.length; i++){
		if(s0.charAt(i)=='$'){
			if(s.length>0){
				s+="</p>";
			}
			img="img/";
			for(let j=i+1; j<s0.length; j++){
				if(s0.charAt(j)==';'){
					i=j;
					break;
				}
				img+=s0.charAt(j);
			}
			s+=`<img src="${img}">`;
			if(i+1<s0.length){
				s+="<p>";
			}
			continue;
		}
		s+=s0.charAt(i);
	}
	if(s.charAt(s.length-1)!=';'){
		s+="</p>";
	}
	return s;
}