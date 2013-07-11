namespace :landmark do
  task :mock => :environment do
    print("Project ID: ")
    id = STDIN.gets.to_i
    exit if id == 0
  
    project = Project.find(id)
    #project.create_sky_table()
    project.track("bob", {'action' => '/index.html'}, {:timestamp => DateTime.parse("2012-01-01 08:00:00")})
    project.track("bob", {'action' => '/index2.html'}, {:timestamp => DateTime.parse("2012-01-01 08:02:00")})
    project.track("susy", {'action' => '/index.html'}, {:timestamp => DateTime.parse("2012-01-02 08:00:00")})
  end
end