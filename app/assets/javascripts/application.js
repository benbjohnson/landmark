//= require jquery
//= require jquery_ujs
//= require bootstrap
//= require bootstrap-select
//= require bootstrap-switch
//= require flatui-checkbox
//= require flatui-radio
//= require flatui
//= require humanize
//= require moment
//= require chosen.jquery
//= require d3
//= require application
//= require state
//= require action

$(document).ready(function() {
  $("select[name='large']").selectpicker({style: 'btn-large', menuStyle: 'dropdown-inverse'});
  $('[data-toggle="radio"]').radio();
  $(".chosen-select").chosen()
  $('[title]').tooltip();
});

var landmark = {};
