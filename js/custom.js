// OnClick Join Button Show Time
// $("#connect").click(function () {
//     $("#timer").show();
// });

// // OnClick Join Button Add Parent Div Class
// $('#connect').click(function(e){
//     $(this).parent().addClass('active');
// }); 

// Onclick Join Pause And Close Enable
$("#connect").click(function () {
    $(".pause-close-btn").show();
});

// OnClick Join Button Disable Input Box
// $(document).ready(function () {
//     $('#connect').click(function () {
//         $('#connectpos').attr('disabled', 'disabled');
//     });
// });

//  OnClick Join Button Add Class
$('#connect').click( function() {
    $(".remotepos_block").toggleClass("remotepos-active");
});

//  OnClick Join Button Add Class
$('#disconnect').click( function() {
    $(".remotepos_block").removeClass("remotepos-active");
});

$('#pause').click(function() {
    $("i", this).toggleClass("la-play");
});

// Replace Text Connect to POS To Connected to POS
const changeText = (e) => {
const element = $("#element");
const textToReplace = element.text();
const newText = textToReplace.replace("Connect to POS","Connected to POS");
    element.text(newText);
};
$(document).on('click', '#connect', changeText);