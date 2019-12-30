feather.replace();

if (Cookies.getJSON("closed")) {
  Cookies.set("closed", true);
  $(".wrapper").addClass("closed");
} else if (typeof Cookies.getJSON("closed") == undefined) {
  Cookies.set("closed", false);
} else {
  Cookies.set("closed", false);
  $(".wrapper").removeClass("closed");
}

$(document).ready(function() {
  $(".wrapper").removeClass("notransition");

  $(".sidebartoggle").click(function() {
    Cookies.set("closed", !Cookies.getJSON("closed"));
    $(".wrapper").toggleClass("closed");
  });
});
