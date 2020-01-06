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
  if (window.matchMedia("only screen and (max-width: 768px)").matches) {
    Cookies.set("closed", false);
    $(".wrapper").removeClass("closed");
  }

  $(".sidebartoggle").click(function() {
    Cookies.set("closed", !Cookies.getJSON("closed"));
    $(".wrapper").toggleClass("closed");
  });

  $(".medewerkerlogin").click(function(e) {
    Cookies.set("medewerkerID", $(this).data("medewerkerid"));
    window.location.href = "/";
  });

  $(".producttable tbody tr").click(function() {
    window.location.href = "/inkoop/" + $(this).data("productid");
  });

  $(".logout").click(function() {
    Cookies.remove("medewerkerID");
    window.location.href = "/login";
  });
});
