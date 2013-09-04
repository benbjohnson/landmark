require 'open-uri'
require 'weighted_randomizer'
require 'ruby-progressbar'

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

  desc "Imports a CSV file into a project with a given name"
  namespace :profiles do
    task :run, [:name, :path, :iterations] => :environment do |t, args|
      iterations = args.iterations.to_i

      # Find project.
      abort("Project name required") if args.name.blank?
      project = Project.find_by_name(args.name)
      abort("Project not found: #{args.name}") if project.nil?

      # Load profiles.
      abort("Path required") if args.path.blank?
      profiles = Landmark::Profile.load(args.path)

      # Clear out existing project data.
      project.sky_client.delete_table(project.sky_table) rescue nil
      project.create_sky_table()

      # Generated a weighted randomizer.
      lookup = profiles.inject({}) {|h, p| h[p.name] = p; h}
      weights = profiles.inject({}) {|h, p| h[p.name] = p.weight; h}
      randomizer = WeightedRandomizer.new(weights)

      # Output
      puts("PROJECT #{project.id} (#{iterations} USERS)")
      progress_bar = ProgressBar.create(:total => iterations, :format => '%E |%B| %P%%')

      # Apply profiles.
      index = 0
      iterations.times do |i|
        profile_name = randomizer.sample()
        profile = lookup[profile_name]
        profile.generate(project, i.to_s)
        progress_bar.increment()
      end
    end
  end
end
