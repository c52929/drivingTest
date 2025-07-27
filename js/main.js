'use strict';

let mode;
let time;
let qNum,outOf;
let r;
let qSet;
let qToGo,retry;
let btnPhase=-1;

let matchedQ;

// 開始
const startBtns=document.getElementsByClassName("startBtn");
for(let i=0; i<startBtns.length; i++){
	startBtns[i].addEventListener("click",()=>{
		document.getElementById("startOption").classList.add("none");
		mode=i%2 ? 2 : i/2;
		// mode (0,1):(仮免,本試験)
		// mode 2:オプション
		selectQ();
	})
}

function selectQ(){
	if(mode==0 || mode==1){
		qToGo=[];
		for(let i=0; i<questions[mode].length; i++){
			qToGo.push(i);
		}
		startQuiz();
	}else if(mode==2){
		document.getElementById("qSearch").classList.remove("none");
	}
}

document.getElementById("searchExp").addEventListener("input",()=>{
	executeSearch();
});

let searchQTypes=document.getElementsByClassName("searchQType");
for(let i=0; i<searchQTypes.length; i++){
	searchQTypes[i].addEventListener("change",()=>{
		// console.log(searchQTypes[i].checked);
		executeSearch();
	})
}

let resultOpened="&gt;";

function executeSearch(){
	matchedQ=[];
	let pattern=searchExp.value;
	if(pattern.length==0 || !(searchKari.checked || searchHonshi.checked)){
		document.getElementById("searchResult").innerHTML="";
		document.getElementById("optionalStartBtn").classList.remove("enabled");
		document.getElementById("labelForResult").innerHTML=`Result (0) ${resultOpened}`;
		return;
	}
	let examinees=[];
	if(searchKari.checked){
		examinees=examinees.concat(kari);
	}
	if(searchHonshi.checked){
		examinees=examinees.concat(honshi);
	}
	let tableContent="";
	for(let i=0; i<examinees.length; i++){
		if(examinees[i][0].match(pattern)!=null || examinees[i][2].match(pattern)!=null){
			// console.log(examinees[i]);
			matchedQ.push(examinees[i]);
			let imgMatch=examinees[i][0].match("^\\$(.+?);(.+)$"); // バクスラをバクスラとしてエスケープ <- なんじゃそりゃ
			if(imgMatch!=null){
				tableContent+=`<tr><td><input type="checkbox" class="selectQ" checked></td><td class="resultCell"><div><img src="img/${imgMatch[1]}"><p>${imgMatch[2]}</p></div></td></tr>`;
			}else{
				tableContent+=`<tr><td><input type="checkbox" class="selectQ" checked></td><td class="resultCell">${examinees[i][0]}</td></tr>`;
			}
		}
	}
	document.getElementById("labelForResult").innerHTML=`Result (${matchedQ.length}) ${resultOpened}`;
	document.getElementById("searchResult").innerHTML=tableContent;

	let cells=document.getElementsByClassName("resultCell");
	for(let i=0; i<cells.length; i++){
		cells[i].addEventListener("click",()=>{
			// console.log(matchedQ[i][2]);
			let extracted="";
			let imgMatch=[matchedQ[i][0].match("^\\$(.+?);(.+)$"),matchedQ[i][2].match("^(.+)\\$(.+?);$")];
			if(imgMatch[0]!=null){
				extracted+=`<tr><td colspan="2"><div><img src="img/${imgMatch[0][1]}"><p>${imgMatch[0][2]}</p></div></td></tr>`;
			}else{
				extracted+=`<tr><td colspan="2">${matchedQ[i][0]}</td></tr>`;
			}
			extracted+=`<tr><td class="ox">${matchedQ[i][1]}</td>`;
			if(imgMatch[1]!=null){
				extracted+=`<td class="children100"><p>${imgMatch[1][1]}</p><img src="img/${imgMatch[1][2]}"></td></tr>`;
			}else{
				extracted+=`<td>${matchedQ[i][2]}</td></tr>`;
			}
			document.getElementById("qExtract").innerHTML=extracted;
			document.getElementById("qExtractSet").classList.remove("none");
		})
	}

	if(matchedQ.length>0){
		document.getElementById("optionalStartBtn").classList.add("enabled");
	}

	let qSelects=document.getElementsByClassName("selectQ");
	for(let i=0; i<qSelects.length; i++){
		qSelects[i].addEventListener("change",()=>{
			let selected=0;
			for(let j=0; j<qSelects.length; j++){
				selected+=qSelects[j].checked;
			}
			if(selected>0){
				document.getElementById("optionalStartBtn").classList.add("enabled");
			}else{
				document.getElementById("optionalStartBtn").classList.remove("enabled");
			}
		});
	}
}

document.getElementById("labelForResult").addEventListener("click",()=>{
	document.getElementById("searchResult").classList.toggle("none");
	resultOpened=["v","&gt;"][["&gt;","v"].indexOf(resultOpened)];
	document.getElementById("labelForResult").innerHTML=`Result (${matchedQ.length}) ${resultOpened}`;
})

document.getElementById("blackboard").addEventListener("click",()=>{
	document.getElementById("qExtractSet").classList.add("none");
})

document.getElementById("optionalStartBtn").addEventListener("click",()=>{
	// console.log(optionalStartBtn.classList[0]=="enabled");
	if(optionalStartBtn.classList[0]=="enabled"){
		if(questions.length<3){
			questions.push([]);
		}else{
			questions[2]=[];
		}
		qToGo=[];
		let qSelects=document.getElementsByClassName("selectQ");
		for(let i=0; i<matchedQ.length; i++){
			if(qSelects[i].checked){
				qToGo.push(qToGo.length);
				questions[2].push(matchedQ[i]);
			}
		}
		document.getElementById("qSearch").classList.add("none");
		startQuiz();
	}
})

function startQuiz(){
	retry=[];
	time=0;
	outOf=qToGo.length;
	qNum=0;
	document.getElementById("questionArea").classList.remove("none");
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
		btnPhase=-1;
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