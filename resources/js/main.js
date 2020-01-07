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

  $(".klanttable th").click(function(e) {
    var url = new URL(window.location.href);
    url.searchParams.set("s", $(this).data("sort"));
    if ($(this).data("order") == "asc") {
      url.searchParams.set("o", "desc");
    } else {
      url.searchParams.set("o", "asc");
    }
    window.location.href = url;
  });

  $(".searchbar #zoekbalk").keypress(function(e) {
    if (e.which == 13) {
      searchKlant();
      return false; //<---- Add this line
    }
  });

  $(".searchverkoop").click(function(e) {
    searchKlant();
  });

  $(".addrow").click(function(e) {
    $("#verkoopform .productlijn")
      .last()
      .after($("#prodlijn").html());
  });

  setSort();
});

function setSort() {
  const urlParams = new URLSearchParams(window.location.search);
  const order = urlParams.get("o") || "asc";
  const sort = urlParams.get("s") || "k.Bedrijfsnaam";
  const search = urlParams.get("q");

  $(".klanttable th[data-sort='" + sort + "']")
    .data("order", order)
    .addClass("active");
  $(".searchbar #zoekbalk").val(search);
}

function searchKlant() {
  var url = new URL(window.location.href);
  url.searchParams.set("q", $(".searchbar #zoekbalk").val());
  window.location.href = url;
}
