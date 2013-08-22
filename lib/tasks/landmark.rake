require 'open-uri'

namespace :landmark do
  task :js do
    content = open("https://raw.github.com/skylandlabs/landmark.js/master/landmark.js").read
    IO.write("public/landmark.js", content)
  end

  task :dot do
    Dir.glob("doc/dot/*.dot") do |filename|
      sh "dot -Tsvg #{filename} > #{filename.gsub(/\.dot$/, '.svg')}"
    end
  end
end
