//= require jquery
//= require jquery_ujs
//= require bootstrap
//= require bootstrap-select
//= require bootstrap-switch
//= require flatui-checkbox
//= require flatui-radio
//= require flatui
//= require typeahead
//= require humanize
//= require d3
//= require d3.flow
//= require landmark
//= require application

$(document).ready(function() {
  $("select[name='large']").selectpicker({style: 'btn-large', menuStyle: 'dropdown-inverse'});
  $('[data-toggle="radio"]').radio();

  $('.search').typeahead([{
    name: "search",
    valueKey: "name",
    remote: "/projects/" + landmark.projectId + "/actions?q=%QUERY"
  }])
  .on("typeahead:selected", function(event, datum) {
    window.location = "/projects/" + landmark.projectId + "/flows/view?id=" + encodeURIComponent(datum.name)
  });
});