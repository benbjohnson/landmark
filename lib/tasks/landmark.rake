require 'open-uri'

namespace :landmark do
  task :js do
    content = open("https://raw.github.com/skylandlabs/landmark.js/master/landmark.js").read
    IO.write("public/landmark.js", content)
  end
end