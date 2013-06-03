module ApplicationHelper
  def data_type_label(data_type)
    case data_type
    when 'factor' then 'Categorical'
    when 'string' then 'String'
    when 'integer' then 'Integer'
    when 'float' then 'Decimal'
    when 'boolean' then 'True/False'
    else ''
    end
  end

  def javascript(*files)
    content_for(:head) { javascript_include_tag(*files) }
  end
end
