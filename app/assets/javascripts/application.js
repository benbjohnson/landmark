//= require jquery
//= require jquery_ujs
//= require_tree .

$(document).ready(function() {
  $("select[name='large']").selectpicker({style: 'btn-large', menuStyle: 'dropdown-inverse'});
  $('[data-toggle="radio"]').radio();

  $('#flow .search').typeahead([{
    name: "search",
    valueKey: "name",
    remote: "/actions?q=%QUERY"
  }])
  .on("typeahead:selected", function(event, datum) {
    window.location = "/flows/" + encodeURIComponent(datum.name)
  });
});