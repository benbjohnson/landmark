//= require jquery
//= require jquery_ujs
//= require bootstrap
//= require bootstrap-select
//= require bootstrap-switch
//= require flatui-checkbox
//= require flatui-radio
//= require flatui
//= require typeahead
//= require landmark
//= require application

$(document).ready(function() {
  $("select[name='large']").selectpicker({style: 'btn-large', menuStyle: 'dropdown-inverse'});
  $('[data-toggle="radio"]').radio();

  $('.search').typeahead([{
    name: "search",
    valueKey: "name",
    remote: "/actions?q=%QUERY"
  }])
  .on("typeahead:selected", function(event, datum) {
    window.location = "/flows/" + encodeURIComponent(datum.name)
  });
});