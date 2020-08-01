'use strict';

function getData(entry) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
fetch(`https://lingua-robot.p.rapidapi.com/language/v1/entries/en/${entry}`, {

"method": "GET",
"headers": {
"x-rapidapi-host": "lingua-robot.p.rapidapi.com",
"x-rapidapi-key": "c40f61dd51mshd4cf3ab427a04d2p1845e6jsn89141b9128a7",
"Content-Type": "application/json" 
}
})
.then(response => response.json())
.then(responseJson =>
displayResults(responseJson))
.catch(error => {console.log(error);
$('.result-word').empty();
$('.result-word').append('<h2>An error has occured. Try again later.</h2>');
});
}

function getSound (textforSpeech,voice,ref) {
var myHeaders = new Headers();
    myHeaders.append("Accept", "audio/wav");
    myHeaders.append("Authorization", "Basic YXBpa2V5OkxQUkFMakM1M0lnRS1ReEJfZ2ROcTRUanBJZlhNV0pScldxS0lnR2hiTWdK");
    myHeaders.append("Content-Type", "application/json");
    
    var raw = JSON.stringify({"text":textforSpeech});
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
let url =`https://api.us-south.text-to-speech.watson.cloud.ibm.com/instances/7f035f19-d994-4da1-90bf-4aa251df75fa/v1/synthesize?apikey=LPRALjC53IgE-QxB_gdNq4TjpIfXMWJRrWqKIgGhbMgJ&voice=${voice}`; 
    fetch(url, requestOptions)   
    .then(async res => {                                                  
        if (!res.ok)
        throw new Error(`${res.status} = ${res.statusText}`);
                
let reader = res.body.getReader();
let result = [];
    reader.read().then(function processText({ done, value }) {
if (done) {
    var blob = new Blob(result, { type: 'audio/wav' });
    var url = window.URL.createObjectURL(blob);
    playMusic(url);
    $(ref).text('Speak').attr('disabled',false);
    return;
}
result.push(value); 
return reader.read().then(processText)  
})
})
.catch(error => console.log(error));
}

function playMusic(src){
console.log('it is an audio');
var music = new Audio(src);
music.play();
}

function displayResults(responseJson) {
console.log('This is a message');
console.log(responseJson);
$('.result-words').empty();
let html = '';
const searchFor = $('#js-word').val();
html += `<h3>${searchFor}</h3>`;

if(responseJson.entries.length){
$(responseJson.entries).each(function(){

//Check for audio
if(this.pronunciations && this.pronunciations.length){
    $(this.pronunciations).each(function(){
//check if has audio
    if(this.audio && this.context.regions && this.context.regions.length && this.context.regions.every(e => e == "United States")){
        html += `<p><input type="button" value="play" onclick="playMusic('${this.audio.url}')" /></p>`
        } 
     });
 }

//Check for definitions
if(this.lexemes && this.lexemes.length){
    $(this.lexemes).each(function(){
       let partOfSpeech = this.partOfSpeech;
       html += `<h4>(${searchFor}) - ${partOfSpeech}</h4>`;
       if(this.senses && this.senses.length){ 
           $(this.senses).each(function(i,item){
             html += `<p>${++i}. ${this.definition}</p>`;
           })
       }
    })
}

//Check for definitions
if(this.lexemes && this.lexemes.length){
html += `<p><button onclick='ShowSentencesExample()'>Examples of Sentences</button></p>`;
$(this.lexemes).each(function(){
//Check if this item has "senses"
if(this.senses && this.senses.length){ 
    $(this.senses).each(function(i,item){
if(this.usageExamples && this.usageExamples.length){
    $(this.usageExamples).each(function(){
    html += `<p style='display:none' class='SentencesExample'>${this}<p>`;
})
    }
    })
}
    })
}
//Check for definitions
 if(this.lexemes && this.lexemes.length){
    html += `<p><button style='margin-top: 10px;' onclick='ShowSynonymsAntonyms()'>Synonyms/Antonyms</button></p>`;
      $(this.lexemes).each(function(){
//Check if this item has "synonym-Sets"
if(this.synonymSets && this.synonymSets.length){
    html += `<div class='SynonymsAntonymsDiv' style='display:none'><h4>Synonyms</h4>`;
    $(this.synonymSets).each(function(i,item){
if(this.synonyms && this.synonyms.length){
    html += `<p>${this.synonyms.toString()}</p>`; 
}
})
    html += "</div>" 
}
//Check if this item has "Antonym-Sets"
if(this.antonymSets && this.antonymSets.length){
    html += `<div class='SynonymsAntonymsDiv' style='display:none'><h4>Antonyms</h4>`;
    $(this.antonymSets).each(function(i,item){ 
if(this.antonyms && this.antonyms.length){
    html += `<p>${this.antonyms.toString()}</p>`;
    }
})
    html += "</div>"
    }
         
})
}

html += `<button class="speech" onclick="ShowHideSpeechContent()">Convert text to speech</button>`
  
});
}
else{
    html += `<p>No result Found!</p>`;
}
$('.result-words').append(html);
}

function watchForm() {
    let word;    
    $('form').submit(event => {
    event.preventDefault();
    word = $('#js-word').val();
    console.log(word);
    getData(word);
    })
}
    

function ShowSentencesExample(){
    if($(".SentencesExample").css('display') === 'block'){ 
        $(".SentencesExample,.SynonymsAntonymsDiv").css('display','none');
    }
    else{
        $(".SentencesExample").css('display','block');
    }
    
}
function ShowSynonymsAntonyms(){
    if($(".SynonymsAntonymsDiv").css('display') === 'block'){
        $(".SynonymsAntonymsDiv").css('display','none');
    }
    else{
        $(".SynonymsAntonymsDiv").css('display','block');
    }
    
}
function ShowHideSpeechContent(){
    if($("#textToSpeechDiv").hasClass('hidden')){
    $("#textToSpeechDiv").removeClass('hidden')
 }
    else{
    $("#textToSpeechDiv").addClass('hidden')
 }
}
function Speak(ref){
    $(ref).text('Please wait...').attr('disabled','disabled')
    let textforSpeech = $("#textToSpeech").val();
    let voice = $("#voiceSelectionDDL").val();
    getSound(textforSpeech,voice,ref);
}
function Reset(){
 $("#textToSpeech").val('');  
  let getTheFirstOpt = $("#voiceSelectionDDL option:first").val();
 $("#voiceSelectionDDL").val(getTheFirstOpt);
}
$(function() {
console.log('App loaded! Waiting for submit!');
watchForm();
})