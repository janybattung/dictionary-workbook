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
//Unit of work
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
    fetch(url, requestOptions)  // as promise to be resolved somewhere in the future  
    // where "then" is the old whereas  async is the new syntax 
    .then(async res => {      // this is something that will catch or that will collect data from the promise
                                // then or promise - "15 then" - synthic sugar - syntax
                                //In computer science, syntactic sugar is syntax within a programming language that is designed to make things easier to read or to express
                 // if there is not error & the response is OK-> successful               
                if (!res.ok)
                  throw new Error(`${res.status} = ${res.statusText}`);
                
                
                //Get reader is used to read the body - it is use to read the "body stream"
                let reader = res.body.getReader();
                //so in the "reader" we grab all the binary
                //so now we need to read the binary one by one & convert them into a readable form
                let result = [];
                //this reader has a function called "read()" which allows us to read the binery one by one
                reader.read().then(function processText({ done, value }) {
                    //done is the one whose is going to tell whether or not you have copied the whole \
                    //done -> false means i did not yet read the whole data
                    //let's there 3 packages 
                    // pkg - 1
                    // pkg - 2
                    // pkg - 3
//                     In order to play sound we need "URL"
// we got the binary data from API
// First read the binary & store in an array
// once you read all the binary - store in an array
// so we know that all the binery now is in "array"
// "further store the data in a blob"
//  then create the "Url"
// once we got the url pass to "Play music" 
// don't re-invent the wheel
// code reuseability
                    if (done) {
                    //blob - storage area 
                    var blob = new Blob(result, { type: 'audio/wav' });
                    var url = window.URL.createObjectURL(blob);
                    playMusic(url);
                    $(ref).text('Speak').attr('disabled',false);
                      return;
                    }

                    result.push(value); // store the first pkg - 1,2,3
                    return reader.read().then(processText)  // this is called recursiveness (calling the function again) 
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
//let audio = responseJson.entries[0].pronunciations[0].audio.url;
//console.log(audio);
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
       if(this.senses && this.senses.length){ // check if current item has a property named lexemes , if it has then check its length
           $(this.senses).each(function(i,item){
             html += `<p>${++i}. ${this.definition}</p>`;
           })
       }
    })
}

//Check for definitions
 if(this.lexemes && this.lexemes.length){
html += `<p><button onclick='ShowSentensesExample()'>Examples of Sentenses</button></p>`;
$(this.lexemes).each(function(){
//Check if this item has "senses"
if(this.senses && this.senses.length){
    //Looping thru synonymSets 
    $(this.senses).each(function(i,item){
        // i -> is our indexer, it helps to track the current execution number of the loop
        //see , we have added a class named 'SentensesExample' this class will help us to hide show the section, we use this class as
        //selector for jquery
        if(this.usageExamples && this.usageExamples.length){
         $(this.usageExamples).each(function(){
            html += `<p style='display:none' class='SentensesExample'>${this}<p>`;
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
            //Looping thru synonymSets 
            $(this.synonymSets).each(function(i,item){
                // Checking if it has synonyms property & synonyms has atleast one value, see if length returns 0 it means it does not
                // have any value -> if(0) => false in javscript 
                if(this.synonyms && this.synonyms.length){
                    html += `<p>${this.synonyms.toString()}</p>`; //call toString() on an array it will automatically convert them into comma separated list
                }
              })
              html += "</div>" //So that if there is any content it should be enclosed inside the div
         }

         //Check if this item has "Antonym-Sets"
         if(this.antonymSets && this.antonymSets.length){
             //see , we have added a class named 'SynonymsAntonymsDiv' this class will help us to hide show the section, we use this class as
            //selector for jquery
            html += `<div class='SynonymsAntonymsDiv' style='display:none'><h4>Antonyms</h4>`;
            //Looping thru synonymSets 
            $(this.antonymSets).each(function(i,item){
                // Checking if it has antonyms property & antonyms has atleast one value, see if length returns 0 it means it does not
                // have any value -> if(0) => false in javscript 
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
    // $('.result-words').on("click", ".speech", event=>{
    //     getSound(word)
    // });
    }
    

function ShowSentensesExample(){
    if($(".SentensesExample").css('display') === 'block'){ //to hide show div
        $(".SentensesExample,.SynonymsAntonymsDiv").css('display','none');
    }
    else{
        $(".SentensesExample").css('display','block');
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
    // if a class has a hidden element then it means it is hidden at the moment it is not visible to the end user
    //so this works as toggle like ON-OFF
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



// //then() - OK i have the data whose is going to catch - 

// then(function(response){

// //code block
// //we can do whatever we want with "response"

// })



// .then(response => response.json())

// .then((res,req) => {})
// // Ecma Script 6    //is the one define the rules

// then(()=>{})

// //here
// function word
// parenthesis ()
// curly braces {}

// //here
// ok if you're going omit the function word then please use => // lambda

// //this is also a function new syntax 
// ()=>{}

// //ok ok if you're going omit the function word then please use => // lambda & if there is only one parameter to catch then
// //you don;t even need to write the parenthesie as well the curly braces

// function (response){

// }

// response =>  console.log(response)


// //this is also function but old syntax
// function(){

// }

// // In Javascrit everything is done by function    