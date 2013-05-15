//= require jquery
//= require jquery_ujs
//= require_tree .

$(document).ready(function() {
    $("select[name='large']").selectpicker({style: 'btn-large', menuStyle: 'dropdown-inverse'});
    $('[data-toggle="radio"]').radio();

  $('#flow .search').typeahead([{
    name: 'search',
    local: ['View Home Page', 'Signup']
  }]);
});