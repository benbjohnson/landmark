namespace :mock do
  task :load => :environment do
    print("Account ID: ")
    id = STDIN.gets.to_i
    exit if id == 0
  
    account = Account.find(id)
    #account.create_sky_table()
    account.track("bob", {:action => '/index.html'}, {:timestamp => DateTime.parse("2012-01-01 08:00:00")})
    account.track("bob", {:action => '/index2.html'}, {:timestamp => DateTime.parse("2012-01-01 08:02:00")})
    account.track("susy", {:action => '/index.html'}, {:timestamp => DateTime.parse("2012-01-02 08:00:00")})
  end
end