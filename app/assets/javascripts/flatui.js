(function($) {
  // Custom Selects
  $("select[name='huge']").selectpicker({style: 'btn-huge btn-primary', menuStyle: 'dropdown-inverse'});
  $("select[name='large']").selectpicker({style: 'btn-large btn-danger'});
  $("select[name='info']").selectpicker({style: 'btn-info'});
  $("select[name='small']").selectpicker({style: 'btn-small btn-warning'});

  // Tabs
  $(".nav-tabs a").on('click', function (e) {
    e.preventDefault();
    $(this).tab("show");
  })

  // Tooltips
  $("[data-toggle=tooltip]").tooltip("show");

  // Focus state for append/prepend inputs
  $(document).on('focus', '.input-prepend, .input-append', 'input', function () {
    $(this).closest('.control-group, form').addClass('focus');
  }).on('blur', 'input', function () {
    $(this).closest('.control-group, form').removeClass('focus');
  });

  // Table: Toggle all checkboxes
  $('.table .toggle-all').on('click', function() {
    var ch = $(this).find(':checkbox').prop('checked');
    $(this).closest('.table').find('tbody :checkbox').checkbox(!ch ? 'check' : 'uncheck');
  });

  // Table: Add class row selected
  $('.table tbody :checkbox').on('check uncheck toggle', function (e) {
    var $this = $(this)
      , check = $this.prop('checked')
      , toggle = e.type == 'toggle'
      , checkboxes = $('.table tbody :checkbox')
      , checkAll = checkboxes.length == checkboxes.filter(':checked').length
      
    $this.closest('tr')[check ? 'addClass' : 'removeClass']('selected-row');
    if (toggle) $this.closest('.table').find('.toggle-all :checkbox').checkbox(checkAll ? 'check' : 'uncheck');
  });

  // Custom checkboxes
  $('[data-toggle="checkbox"]').checkbox();

  // Custom radios
  $('[data-toggle="radio"]').radio();

  // Switch
  $("[data-toggle='switch']").wrap('<div class="switch" />').parent().bootstrapSwitch();
})(jQuery);
