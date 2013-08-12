class String
  def to_lua
    encoded = gsub(/\n|\f|\t|"|'|\\/) do |m|
      case m
      when "\n" then "\\n"
      when "\f" then "\\f"
      when "\t" then "\\t"
      when "\"" then "\\\""
      when "'" then "\\'"
      when "\\" then "\\\\"
      end
    end
    return "'" + encoded + "'"
  end
end
